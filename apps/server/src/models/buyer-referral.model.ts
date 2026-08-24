import mongoose, { Document, Schema } from "mongoose";

export interface IBuyerReferral extends Document {
  storeId: mongoose.Types.ObjectId;
  referrerId: mongoose.Types.ObjectId;
  refereeId: mongoose.Types.ObjectId;
  status: "pending" | "rewarded" | "expired";
  referrerRewardType: "voucher";
  referrerRewardAmount: number;
  refereeDiscountType: "percentage" | "fixed";
  refereeDiscountValue: number;
  rewardedAt?: Date | null;
  orderId?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const buyerReferralSchema = new Schema<IBuyerReferral>(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    referrerId: { type: Schema.Types.ObjectId, ref: "BuyerProfile", required: true },
    refereeId: { type: Schema.Types.ObjectId, ref: "BuyerProfile", required: true, unique: true },
    status: { type: String, enum: ["pending", "rewarded", "expired"], default: "pending" },
    referrerRewardType: { type: String, enum: ["voucher"], default: "voucher" },
    referrerRewardAmount: { type: Number, default: 0 },
    refereeDiscountType: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
    refereeDiscountValue: { type: Number, default: 0 },
    rewardedAt: { type: Date, default: null },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", default: null },
  },
  { timestamps: true },
);

export const BuyerReferral = mongoose.model<IBuyerReferral>("BuyerReferral", buyerReferralSchema);
