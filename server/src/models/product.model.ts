import mongoose, { Document, Schema } from "mongoose";

export interface IProductVariant {
  name: string;
  options: string[];
}

export interface IVariantCombination {
  combination: Record<string, string>;
  price: number;
  stock: number;
  sku?: string;
  image?: string;
}

export interface IProduct extends Document {
  storeId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  compareAtPrice?: number | null;
  sku?: string;
  stock: number;
  images: string[];
  weightKg?: number | null;
  hasVariants: boolean;
  variants: IProductVariant[];
  variantCombinations: IVariantCombination[];
  status: "draft" | "active" | "archived";
  isFeatured: boolean;
  tags: string[];
  shippingFee: number;
  estimatedDeliveryDays: string;
  rating: number;
  reviewCount: number;
  ratingSum: number;
  orderCount: number;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true },
    description: { type: String, default: "" },
    category: { type: String, default: "", index: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: null },
    sku: { type: String, default: "" },
    stock: { type: Number, required: true, default: 0, min: 0 },
    images: { type: [String], default: [] },
    weightKg: { type: Number, default: null },
    hasVariants: { type: Boolean, default: false },
    variants: [
      {
        name: { type: String, required: true },
        options: { type: [String], default: [] },
      },
    ],
    variantCombinations: [
      {
        combination: { type: Schema.Types.Mixed, default: {} },
        price: { type: Number, required: true },
        stock: { type: Number, required: true, default: 0 },
        sku: { type: String, default: "" },
        image: { type: String, default: "" },
      },
    ],
    status: { type: String, enum: ["draft", "active", "archived"], default: "draft", index: true },
    isFeatured: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    shippingFee: { type: Number, default: 0, min: 0 },
    estimatedDeliveryDays: { type: String, default: "" },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    ratingSum: { type: Number, default: 0 },
    orderCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

productSchema.index({ storeId: 1, slug: 1 }, { unique: true });
productSchema.index({ storeId: 1, title: "text", description: "text", tags: "text" });

export const Product = mongoose.model<IProduct>("Product", productSchema);
