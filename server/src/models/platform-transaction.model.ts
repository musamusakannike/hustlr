import mongoose, { Document, Schema } from "mongoose";

export interface IPlatformTransaction extends Document {
  type: "order_payment" | "refund" | "withdrawal" | "subscription";
  amount: number;
  currency: string;
  gateway: string;
  reference: string;
  status: string;
  sellerId?: mongoose.Types.ObjectId | null;
  storeId?: mongoose.Types.ObjectId | null;
  buyerProfileId?: mongoose.Types.ObjectId | null;
  orderId?: mongoose.Types.ObjectId | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const platformTransactionSchema = new Schema<IPlatformTransaction>(
  {
    type: {
      type: String,
      enum: ["order_payment", "refund", "withdrawal", "subscription"],
      required: true,
      index: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: "NGN" },
    gateway: { type: String, default: "paystack" },
    reference: { type: String, required: true, index: true },
    status: { type: String, required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    storeId: { type: Schema.Types.ObjectId, ref: "Store", default: null },
    buyerProfileId: { type: Schema.Types.ObjectId, ref: "BuyerProfile", default: null },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

export const PlatformTransaction = mongoose.model<IPlatformTransaction>(
  "PlatformTransaction",
  platformTransactionSchema,
);
