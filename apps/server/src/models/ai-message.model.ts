import mongoose, { Document, Schema } from "mongoose";

export type AiActionType = "restock" | "price" | "catalog" | "coupon";
export type AiActionStatus = "proposed" | "applied" | "dismissed";

export interface IAiCitation {
  source: string;
  asOf: Date;
}

export interface IAiAction {
  actionId: string;
  type: AiActionType;
  status: AiActionStatus;
  previewLabel: string;
  payload: Record<string, unknown>;
  appliedAt?: Date | null;
}

export interface IAiMessage extends Document {
  threadId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  role: "user" | "assistant";
  content: string;
  citations: IAiCitation[];
  actions: IAiAction[];
  createdAt: Date;
  updatedAt: Date;
}

const aiMessageSchema = new Schema<IAiMessage>(
  {
    threadId: { type: Schema.Types.ObjectId, ref: "AiThread", required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, default: "" },
    citations: [
      {
        source: { type: String, required: true },
        asOf: { type: Date, required: true },
      },
    ],
    actions: [
      {
        actionId: { type: String, required: true },
        type: { type: String, enum: ["restock", "price", "catalog", "coupon"], required: true },
        status: { type: String, enum: ["proposed", "applied", "dismissed"], default: "proposed" },
        previewLabel: { type: String, required: true },
        payload: { type: Schema.Types.Mixed, default: {} },
        appliedAt: { type: Date, default: null },
      },
    ],
  },
  { timestamps: true },
);

aiMessageSchema.index({ threadId: 1, createdAt: 1 });

export const AiMessage = mongoose.model<IAiMessage>("AiMessage", aiMessageSchema);
