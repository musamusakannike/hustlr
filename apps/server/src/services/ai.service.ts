import OpenAI from "openai";
import type { ChatCompletionMessageParam, ChatCompletionTool } from "openai/resources/chat/completions";
import { env } from "../config/env.config";
import { APP_NAME } from "../config/constants.config";

function client(): { sdk: OpenAI; model: string } | null {
  if (env.deepseekApiKey) {
    return {
      sdk: new OpenAI({ apiKey: env.deepseekApiKey, baseURL: `${env.deepseekBaseUrl.replace(/\/$/, "")}/v1` }),
      model: env.deepseekModel,
    };
  }
  if (env.xaiApiKey) {
    return {
      sdk: new OpenAI({ apiKey: env.xaiApiKey, baseURL: env.xaiBaseUrl }),
      model: env.xaiModel,
    };
  }
  return null;
}

async function complete(system: string, user: string): Promise<string | null> {
  const c = client();
  if (!c) return null;
  try {
    const res = await c.sdk.chat.completions.create({
      model: c.model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.7,
    });
    return res.choices[0]?.message?.content ?? null;
  } catch (error) {
    console.error(`[${APP_NAME}] LLM call failed`, error);
    return null;
  }
}

function parseJson<T>(text: string | null, fallback: T): T {
  if (!text) return fallback;
  try {
    const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!match) return fallback;
    return JSON.parse(match[0]) as T;
  } catch {
    return fallback;
  }
}

export async function improveTitle(input: { title: string; category?: string; description?: string }) {
  const fallback = {
    suggestions: [
      `${input.title} — Premium Quality`,
      `Shop ${input.title} Online`,
      `${input.title} | Fast Delivery`,
    ],
  };
  const text = await complete(
    `You help African e-commerce sellers on ${APP_NAME} write SEO product titles. Return JSON { "suggestions": string[] } with 3 titles.`,
    JSON.stringify(input),
  );
  return parseJson(text, fallback);
}

export async function rewriteDescription(input: {
  description: string;
  title?: string;
  category?: string;
  tone?: string;
}) {
  const fallback = {
    description: input.description,
    highlights: ["Quality product", "Fast shipping", "Secure checkout"],
  };
  const text = await complete(
    `Rewrite product copy for ${APP_NAME} sellers. Tone: ${input.tone ?? "professional"}. Return JSON { "description": string, "highlights": string[] }.`,
    JSON.stringify(input),
  );
  return parseJson(text, fallback);
}

export type ToolHandler = (name: string, args: Record<string, unknown>) => Promise<unknown>;

export async function completeWithTools(params: {
  system: string;
  messages: ChatCompletionMessageParam[];
  tools: ChatCompletionTool[];
  runTool: ToolHandler;
  onDelta?: (text: string) => void;
}): Promise<{ text: string; toolNames: string[] }> {
  const c = client();
  if (!c) return { text: "", toolNames: [] };

  const history: ChatCompletionMessageParam[] = [
    { role: "system", content: params.system },
    ...params.messages,
  ];
  const toolNames: string[] = [];

  for (let step = 0; step < 6; step++) {
    const res = await c.sdk.chat.completions.create({
      model: c.model,
      messages: history,
      tools: params.tools,
      temperature: 0.3,
    });
    const msg = res.choices[0]?.message;
    if (!msg) break;

    const calls = msg.tool_calls ?? [];
    if (calls.length === 0) {
      const text = typeof msg.content === "string" ? msg.content : "";
      if (params.onDelta && text) params.onDelta(text);
      return { text, toolNames };
    }

    history.push(msg);
    for (const call of calls) {
      const fn = call.function;
      toolNames.push(fn.name);
      let args: Record<string, unknown> = {};
      try {
        args = fn.arguments ? (JSON.parse(fn.arguments) as Record<string, unknown>) : {};
      } catch {
        args = {};
      }
      let result: unknown;
      try {
        result = await params.runTool(fn.name, args);
      } catch (error) {
        result = { error: error instanceof Error ? error.message : "Tool failed" };
      }
      history.push({
        role: "tool",
        tool_call_id: call.id,
        content: JSON.stringify(result),
      });
    }
  }

  const fallback = await c.sdk.chat.completions.create({
    model: c.model,
    messages: history,
    temperature: 0.3,
  });
  const text = fallback.choices[0]?.message?.content ?? "";
  if (params.onDelta && text) params.onDelta(text);
  return { text, toolNames };
}

export async function generateSeo(input: { name: string; description?: string; category?: string }) {
  const fallback = {
    metaTitle: `${input.name} | ${APP_NAME}`.slice(0, 60),
    metaDescription: (input.description || `Shop ${input.name} with escrow-protected payments.`).slice(0, 160),
  };
  const text = await complete(
    `Generate SEO metadata for a ${APP_NAME} store or product. Return JSON { "metaTitle": string, "metaDescription": string }.`,
    JSON.stringify(input),
  );
  return parseJson(text, fallback);
}

const COPY_SKIP_KEYS = new Set([
  "id",
  "type",
  "order",
  "isEnabled",
  "align",
  "autoplay",
  "limit",
  "columns",
  "layout",
  "imagePosition",
  "overlayOpacity",
  "variant",
  "html",
  "css",
  "fieldSchema",
  "libraryKey",
  "icon",
]);

function looksLikeUrl(value: string) {
  return /^(https?:\/\/|\/|data:)/i.test(value.trim());
}

function isImageOrLinkKey(key: string) {
  return /(image|logo|url|href|src|link)$/i.test(key);
}

function mergeCopy(original: unknown, generated: unknown): unknown {
  if (Array.isArray(original)) {
    const gen = Array.isArray(generated) ? generated : [];
    return original.map((item, i) => mergeCopy(item, gen[i]));
  }
  if (original && typeof original === "object") {
    const src = original as Record<string, unknown>;
    const gen = generated && typeof generated === "object" ? (generated as Record<string, unknown>) : {};
    const out: Record<string, unknown> = { ...src };
    for (const [key, value] of Object.entries(gen)) {
      if (COPY_SKIP_KEYS.has(key) || isImageOrLinkKey(key)) continue;
      if (typeof src[key] === "string" && typeof value === "string") {
        if (looksLikeUrl(src[key] as string)) continue;
        out[key] = value;
      } else if (src[key] && typeof src[key] === "object") {
        out[key] = mergeCopy(src[key], value);
      }
    }
    return out;
  }
  return original;
}

export async function storefrontInterviewQuestions(input: {
  storeName: string;
  description: string;
  sectionSummary?: string;
}) {
  const fallback = {
    questions: [
      { id: "audience", prompt: "Who is this store for?" },
      { id: "tone", prompt: "What tone should the homepage use (e.g. bold, warm, luxury)?" },
      { id: "location", prompt: "Where do you ship from, and how fast?" },
      { id: "differentiator", prompt: "What makes your products different?" },
      { id: "cta", prompt: "What should shoppers do first (shop, browse, contact)?" },
    ],
  };
  const text = await complete(
    `You interview ${APP_NAME} sellers to write homepage copy. Return JSON { "questions": [{ "id": string, "prompt": string }] } with 4 to 6 short questions. No markdown.`,
    JSON.stringify(input),
  );
  const parsed = parseJson(text, fallback);
  if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) return fallback;
  return parsed;
}

export async function storefrontRewriteCopy(input: {
  storeName: string;
  description: string;
  answers: Record<string, string>;
  sections: Array<{ id: string; type: string; name: string; data: Record<string, unknown> }>;
}) {
  const skeleton = input.sections.map((s) => ({ id: s.id, type: s.type, data: s.data }));
  const text = await complete(
    `Rewrite ONLY marketing text for a ${APP_NAME} storefront. Keep the same JSON shape, array lengths, and keys. Do not change ids, image URLs, links, numbers like limit, or layout flags. Keep headings punchy. CTAs max 4 words. Return JSON { "sections": [{ "id": string, "data": object }] }.`,
    JSON.stringify({
      storeName: input.storeName,
      description: input.description,
      answers: input.answers,
      sections: skeleton,
    }),
  );
  const parsed = parseJson<{ sections?: Array<{ id?: string; data?: Record<string, unknown> }> }>(text, {
    sections: [],
  });
  const byId = new Map((parsed.sections || []).map((s) => [s.id, s.data]));
  return {
    sections: input.sections.map((section) => ({
      ...section,
      data: mergeCopy(section.data, byId.get(section.id) || {}) as Record<string, unknown>,
    })),
  };
}
