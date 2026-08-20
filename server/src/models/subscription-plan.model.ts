import mongoose, { Document, Schema } from "mongoose";

export interface ISubscriptionPlan extends Document {
  name: "free" | "pro" | "pro+";
  slug: "free" | "pro" | "pro-plus";
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  maxProducts: number | null;
  allowCustomDomain: boolean;
  allowProTemplates: boolean;
  allowProPlusTemplates: boolean;
  allowBlog: boolean;
  commissionPercent: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionPlanSchema = new Schema<ISubscriptionPlan>(
  {
    name: { type: String, enum: ["free", "pro", "pro+"], required: true, unique: true },
    slug: { type: String, enum: ["free", "pro", "pro-plus"], required: true, unique: true },
    monthlyPrice: { type: Number, required: true, default: 0 },
    yearlyPrice: { type: Number, required: true, default: 0 },
    features: { type: [String], default: [] },
    maxProducts: { type: Number, default: null },
    allowCustomDomain: { type: Boolean, default: false },
    allowProTemplates: { type: Boolean, default: false },
    allowProPlusTemplates: { type: Boolean, default: false },
    allowBlog: { type: Boolean, default: false },
    commissionPercent: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const SubscriptionPlan = mongoose.model<ISubscriptionPlan>(
  "SubscriptionPlan",
  subscriptionPlanSchema,
);
