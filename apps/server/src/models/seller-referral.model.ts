import mongoose, { Document, Schema } from "mongoose";

export interface ISellerReferral extends Document {
  referrerId: mongoose.Types.ObjectId;
  refereeId: mongoose.Types.ObjectId;
  status: "pending" | "qualified" | "rewarded" | "expired" | "reversed";
  rewardType: "subscription_credit" | "cash_bonus";
  rewardAmount: number;
  rewardedAt?: Date | null;
  qualifiedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const sellerReferralSchema = new Schema<ISellerReferral>(
  {
    referrerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    refereeId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    status: {
      type: String,
      enum: ["pending", "qualified", "rewarded", "expired", "reversed"],
      default: "pending",
    },
    rewardType: { type: String, enum: ["subscription_credit", "cash_bonus"], default: "cash_bonus" },
    rewardAmount: { type: Number, default: 0 },
    rewardedAt: { type: Date, default: null },
    qualifiedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const SellerReferral = mongoose.model<ISellerReferral>("SellerReferral", sellerReferralSchema);
