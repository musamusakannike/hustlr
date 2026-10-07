export type AiActionType = "restock" | "price" | "catalog" | "coupon";
export type AiActionStatus = "proposed" | "applied" | "dismissed";

export interface AiCitation {
  source: string;
  asOf: string;
}

export interface AiAction {
  actionId: string;
  type: AiActionType;
  status: AiActionStatus;
  previewLabel: string;
  payload: Record<string, unknown>;
  appliedAt?: string | null;
}

export interface AiThread {
  id: string;
  title: string;
  preview: string;
  updatedAt: string;
  createdAt: string;
}

export interface AiChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations: AiCitation[];
  actions: AiAction[];
  createdAt: string;
}

export interface AiThreadDetail {
  thread: AiThread;
  messages: AiChatMessage[];
}
