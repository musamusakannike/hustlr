import mongoose, { Document, Schema } from "mongoose";

export interface ISubscription extends Document {
  sellerId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  planName: "free" | "pro" | "pro+";
  billingCycle: "monthly" | "yearly" | "none";
  amount: number;
  status: "active" | "expired" | "cancelled" | "grace_period" | "pending";
  startDate: Date;
  endDate?: Date | null;
  autoRenew: boolean;
  paymentReference?: string;
  gracePeriodEnd?: Date | null;
  cancelledAt?: Date | null;
  renewalReminderSent: boolean;
  pendingPlanId?: mongoose.Types.ObjectId | null;
  pendingPlanName?: "free" | "pro" | "pro+" | null;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    planId: { type: Schema.Types.ObjectId, ref: "SubscriptionPlan", required: true },
    planName: { type: String, enum: ["free", "pro", "pro+"], required: true },
    billingCycle: { type: String, enum: ["monthly", "yearly", "none"], required: true },
    amount: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled", "grace_period", "pending"],
      default: "pending",
      index: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    autoRenew: { type: Boolean, default: true },
    paymentReference: { type: String, default: "" },
    gracePeriodEnd: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    renewalReminderSent: { type: Boolean, default: false },
    pendingPlanId: { type: Schema.Types.ObjectId, ref: "SubscriptionPlan", default: null },
    pendingPlanName: { type: String, enum: ["free", "pro", "pro+", null], default: null },
  },
  { timestamps: true },
);

subscriptionSchema.index({ sellerId: 1, status: 1 });

export const Subscription = mongoose.model<ISubscription>("Subscription", subscriptionSchema);
