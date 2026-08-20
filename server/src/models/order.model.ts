import mongoose, { Document, Schema } from "mongoose";
import { DEFAULT_CURRENCY } from "../config/constants.config";
import type { IShippingAddress } from "./buyer-profile.model";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  title: string;
  price: number;
  quantity: number;
  selectedVariants: Record<string, string>;
  image?: string;
  shippingFee: number;
}

export interface IOrder extends Document {
  buyerProfileId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  orderNumber: string;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  subtotal: number;
  shippingTotal: number;
  discountAmount: number;
  couponCode?: string;
  totalAmount: number;
  currency: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded" | "partially_refunded";
  paymentReference?: string;
  paidAt?: Date | null;
  deliveryStatus:
    | "processing"
    | "shipped"
    | "in_transit"
    | "delivered"
    | "confirmed"
    | "disputed"
    | "refunded";
  shippedAt?: Date | null;
  deliveredAt?: Date | null;
  confirmedAt?: Date | null;
  trackingNumber?: string;
  trackingNote?: string;
  commissionPercent: number;
  commissionAmount: number;
  payoutAmount: number;
  escrowStatus: "locked" | "released" | "disputed" | "refunded";
  escrowReleasedAt?: Date | null;
  receiptUrl?: string;
  invoiceUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    buyerProfileId: { type: Schema.Types.ObjectId, ref: "BuyerProfile", required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    orderNumber: { type: String, required: true, unique: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        title: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        selectedVariants: { type: Schema.Types.Mixed, default: {} },
        image: { type: String, default: "" },
        shippingFee: { type: Number, default: 0 },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      streetAddress: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
      phoneNumber: { type: String, required: true },
      isDefault: { type: Boolean, default: false },
    },
    subtotal: { type: Number, required: true },
    shippingTotal: { type: Number, required: true, default: 0 },
    discountAmount: { type: Number, required: true, default: 0 },
    couponCode: { type: String, default: "" },
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: DEFAULT_CURRENCY },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "partially_refunded"],
      default: "pending",
      index: true,
    },
    paymentReference: { type: String, default: "" },
    paidAt: { type: Date, default: null },
    deliveryStatus: {
      type: String,
      enum: ["processing", "shipped", "in_transit", "delivered", "confirmed", "disputed", "refunded"],
      default: "processing",
      index: true,
    },
    shippedAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    confirmedAt: { type: Date, default: null },
    trackingNumber: { type: String, default: "" },
    trackingNote: { type: String, default: "" },
    commissionPercent: { type: Number, required: true, default: 0 },
    commissionAmount: { type: Number, required: true, default: 0 },
    payoutAmount: { type: Number, required: true, default: 0 },
    escrowStatus: {
      type: String,
      enum: ["locked", "released", "disputed", "refunded"],
      default: "locked",
    },
    escrowReleasedAt: { type: Date, default: null },
    receiptUrl: { type: String, default: "" },
    invoiceUrl: { type: String, default: "" },
  },
  { timestamps: true },
);

orderSchema.index({ storeId: 1, createdAt: -1 });
orderSchema.index({ sellerId: 1, createdAt: -1 });

export const Order = mongoose.model<IOrder>("Order", orderSchema);
