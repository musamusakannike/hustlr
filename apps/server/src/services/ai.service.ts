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
