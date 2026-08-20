import mongoose, { Document, Schema } from "mongoose";

export interface ICouponUsage {
  buyerProfileId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  usedAt: Date;
}

export interface ICoupon extends Document {
  storeId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minimumOrderAmount?: number | null;
  maxUsageCount?: number | null;
  maxUsagePerBuyer: number;
  currentUsageCount: number;
  usedBy: ICouponUsage[];
  startDate?: Date | null;
  expiryDate?: Date | null;
  isActive: boolean;
  appliesTo: "all" | "specific_products" | "specific_categories";
  applicableProductIds: mongoose.Types.ObjectId[];
  applicableCategories: string[];
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    type: { type: String, enum: ["percentage", "fixed"], required: true },
    value: { type: Number, required: true, min: 0 },
    minimumOrderAmount: { type: Number, default: null },
    maxUsageCount: { type: Number, default: null },
    maxUsagePerBuyer: { type: Number, default: 1 },
    currentUsageCount: { type: Number, default: 0 },
    usedBy: [
      {
        buyerProfileId: { type: Schema.Types.ObjectId, ref: "BuyerProfile" },
        orderId: { type: Schema.Types.ObjectId, ref: "Order" },
        usedAt: { type: Date, default: Date.now },
      },
    ],
    startDate: { type: Date, default: null },
    expiryDate: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    appliesTo: {
      type: String,
      enum: ["all", "specific_products", "specific_categories"],
      default: "all",
    },
    applicableProductIds: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    applicableCategories: { type: [String], default: [] },
  },
  { timestamps: true },
);

couponSchema.index({ storeId: 1, code: 1 }, { unique: true });

export const Coupon = mongoose.model<ICoupon>("Coupon", couponSchema);
