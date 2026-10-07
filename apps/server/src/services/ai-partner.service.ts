import type { Response } from "express";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { APP_NAME } from "../config/constants.config";
import { AiThread } from "../models/ai-thread.model";
import { AiMessage, type IAiAction, type IAiCitation } from "../models/ai-message.model";
import { ApiError } from "../utils/api-error.util";
import { completeWithTools } from "./ai.service";
import { citationForTool, PARTNER_TOOLS, runPartnerTool } from "./ai-tools.service";
import { getSellerPlan, getSellerStore, planAllowsAiPartner } from "./store-helper.service";
import * as productService from "./product.service";
import * as couponService from "./coupon.service";

const SYSTEM = `You are the ${APP_NAME} seller partner for this store only.
Use tools before stating any money, stock, order, or dispute figure. Never invent naira amounts.
If a tool errors, say you cannot see that number.
Net after fees is not profit after product cost unless a tool says otherwise. Currency is NGN.
When you want a catalog, price, restock, or coupon change, call the matching draft_* tool. Never claim you already saved a change.
Be concise. Use short headings and lists.`;

export async function assertAiPartner(sellerId: string) {
  const plan = await getSellerPlan(sellerId);
  if (!plan || !planAllowsAiPartner(plan.name)) {
    throw ApiError.forbidden("AI Partner is available on the Pro+ plan");
  }
  return getSellerStore(sellerId);
}

function serializeThread(t: { _id: unknown; title: string; preview: string; updatedAt: Date; createdAt: Date }) {
  return {
    id: String(t._id),
    title: t.title,
    preview: t.preview,
    updatedAt: t.updatedAt,
    createdAt: t.createdAt,
  };
}

function serializeMessage(m: {
  _id: unknown;
  role: string;
  content: string;
  citations: IAiCitation[];
  actions: IAiAction[];
  createdAt: Date;
}) {
  return {
    id: String(m._id),
    role: m.role,
    content: m.content,
    citations: m.citations,
    actions: m.actions,
    createdAt: m.createdAt,
  };
}

export async function listThreads(sellerId: string) {
  const store = await assertAiPartner(sellerId);
  const items = await AiThread.find({ sellerId, storeId: store._id }).sort({ updatedAt: -1 }).limit(50);
  return items.map(serializeThread);
}

export async function createThread(sellerId: string, title?: string) {
  const store = await assertAiPartner(sellerId);
  const thread = await AiThread.create({
    sellerId,
    storeId: store._id,
    title: title?.trim() || "New chat",
  });
  return serializeThread(thread);
}

export async function renameThread(sellerId: string, threadId: string, title: string) {
  const store = await assertAiPartner(sellerId);
  const thread = await AiThread.findOne({ _id: threadId, sellerId, storeId: store._id });
  if (!thread) throw ApiError.notFound("Thread not found");
  thread.title = title.trim().slice(0, 80) || thread.title;
  await thread.save();
  return serializeThread(thread);
}

export async function deleteThread(sellerId: string, threadId: string) {
  const store = await assertAiPartner(sellerId);
  const thread = await AiThread.findOneAndDelete({ _id: threadId, sellerId, storeId: store._id });
  if (!thread) throw ApiError.notFound("Thread not found");
  await AiMessage.deleteMany({ threadId: thread._id, storeId: store._id });
  return { deleted: true };
}

export async function listMessages(sellerId: string, threadId: string) {
  const store = await assertAiPartner(sellerId);
  const thread = await AiThread.findOne({ _id: threadId, sellerId, storeId: store._id });
  if (!thread) throw ApiError.notFound("Thread not found");
  const items = await AiMessage.find({ threadId: thread._id, storeId: store._id }).sort({ createdAt: 1 });
  return { thread: serializeThread(thread), messages: items.map(serializeMessage) };
}

function sse(res: Response, event: unknown) {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

export async function postMessage(sellerId: string, threadId: string, content: string, res: Response) {
  const store = await assertAiPartner(sellerId);
  const thread = await AiThread.findOne({ _id: threadId, sellerId, storeId: store._id });
  if (!thread) throw ApiError.notFound("Thread not found");

  const text = content.trim();
  if (!text) throw ApiError.badRequest("Message is required");

  await AiMessage.create({
    threadId: thread._id,
    storeId: store._id,
    sellerId,
    role: "user",
    content: text,
  });

  if (thread.title === "New chat") {
    thread.title = text.slice(0, 60);
  }
  thread.preview = text.slice(0, 120);
  await thread.save();

  const historyDocs = await AiMessage.find({ threadId: thread._id, storeId: store._id })
    .sort({ createdAt: 1 })
    .limit(20);

  const messages: ChatCompletionMessageParam[] = historyDocs.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  res.status(200);
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const actions: IAiAction[] = [];
  const citations: IAiCitation[] = [];
  const seenSource = new Set<string>();

  try {
    const { text: reply } = await completeWithTools({
      system: SYSTEM,
      messages,
      tools: PARTNER_TOOLS,
      runTool: async (name, args) => {
        const result = await runPartnerTool(sellerId, name, args);
        const cite = citationForTool(name);
        if (!seenSource.has(cite.source)) {
          seenSource.add(cite.source);
          citations.push(cite);
        }
        if (result && typeof result === "object" && "proposedAction" in result) {
          actions.push((result as { proposedAction: IAiAction }).proposedAction);
        }
        return result;
      },
      onDelta: (delta) => sse(res, { type: "text", delta }),
    });

    const contentOut =
      reply.trim() ||
      (actions.length
        ? "I drafted a change for you to confirm."
        : "I could not reach the language model. Try again in a moment.");

    const assistant = await AiMessage.create({
      threadId: thread._id,
      storeId: store._id,
      sellerId,
      role: "assistant",
      content: contentOut,
      citations,
      actions,
    });
    thread.preview = contentOut.slice(0, 120);
    await thread.save();
    sse(res, { type: "done", message: serializeMessage(assistant) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI request failed";
    sse(res, { type: "error", message });
  }
  res.end();
}

export async function applyAction(sellerId: string, actionId: string) {
  const store = await assertAiPartner(sellerId);
  const doc = await AiMessage.findOne({
    sellerId,
    storeId: store._id,
    "actions.actionId": actionId,
  });
  if (!doc) throw ApiError.notFound("Action not found");
  const action = doc.actions.find((a) => a.actionId === actionId);
  if (!action) throw ApiError.notFound("Action not found");
  if (action.status === "applied") return serializeMessage(doc);
  if (action.status === "dismissed") throw ApiError.badRequest("Action was dismissed");

  const payload = action.payload;
  if (action.type === "restock") {
    const product = await productService.getSellerProduct(sellerId, String(payload.productId));
    await productService.updateProduct(sellerId, String(payload.productId), {
      stock: product.stock + Number(payload.addUnits ?? 0),
    });
  } else if (action.type === "price") {
    await productService.updateProduct(sellerId, String(payload.productId), {
      price: Number(payload.price),
    });
  } else if (action.type === "catalog") {
    const update: Record<string, unknown> = {};
    if (payload.title) update.title = payload.title;
    if (payload.description) update.description = payload.description;
    await productService.updateProduct(sellerId, String(payload.productId), update);
  } else if (action.type === "coupon") {
    await couponService.createCoupon(sellerId, payload);
  }

  action.status = "applied";
  action.appliedAt = new Date();
  await doc.save();
  return serializeMessage(doc);
}

export async function dismissAction(sellerId: string, actionId: string) {
  const store = await assertAiPartner(sellerId);
  const doc = await AiMessage.findOne({
    sellerId,
    storeId: store._id,
    "actions.actionId": actionId,
  });
  if (!doc) throw ApiError.notFound("Action not found");
  const action = doc.actions.find((a) => a.actionId === actionId);
  if (!action) throw ApiError.notFound("Action not found");
  if (action.status === "applied") throw ApiError.badRequest("Action already applied");
  action.status = "dismissed";
  await doc.save();
  return serializeMessage(doc);
}
