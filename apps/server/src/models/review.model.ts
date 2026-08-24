import mongoose, { Document, Schema } from "mongoose";

export interface IReview extends Document {
  productId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  buyerProfileId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  rating: number;
  title?: string;
  comment?: string;
  images: string[];
  isVerifiedPurchase: boolean;
  status: "published" | "hidden" | "flagged";
  productTitle: string;
  productImage?: string;
  variantInfo?: Record<string, string>;
  sellerReply?: { text: string; repliedAt: Date } | null;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    buyerProfileId: { type: Schema.Types.ObjectId, ref: "BuyerProfile", required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: "" },
    comment: { type: String, default: "", maxlength: 2000 },
    images: { type: [String], default: [] },
    isVerifiedPurchase: { type: Boolean, default: true },
    status: { type: String, enum: ["published", "hidden", "flagged"], default: "published" },
    productTitle: { type: String, required: true },
    productImage: { type: String, default: "" },
    variantInfo: { type: Schema.Types.Mixed, default: {} },
    sellerReply: {
      text: { type: String },
      repliedAt: { type: Date },
    },
  },
  { timestamps: true },
);

reviewSchema.index({ buyerProfileId: 1, orderId: 1, productId: 1 }, { unique: true });

export const Review = mongoose.model<IReview>("Review", reviewSchema);
