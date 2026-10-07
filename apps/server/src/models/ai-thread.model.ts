import mongoose, { Document, Schema } from "mongoose";

export interface IAiThread extends Document {
  sellerId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  title: string;
  preview: string;
  createdAt: Date;
  updatedAt: Date;
}

const aiThreadSchema = new Schema<IAiThread>(
  {
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    title: { type: String, default: "New chat" },
    preview: { type: String, default: "" },
  },
  { timestamps: true },
);

aiThreadSchema.index({ storeId: 1, sellerId: 1, updatedAt: -1 });

export const AiThread = mongoose.model<IAiThread>("AiThread", aiThreadSchema);
