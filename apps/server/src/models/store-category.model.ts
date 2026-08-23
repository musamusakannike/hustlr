import mongoose, { Document, Schema } from "mongoose";

export interface IStoreCategory extends Document {
  storeId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  order: number;
  isActive: boolean;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const storeCategorySchema = new Schema<IStoreCategory>(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true },
    image: { type: String, default: "" },
    description: { type: String, default: "" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    productCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

storeCategorySchema.index({ storeId: 1, slug: 1 }, { unique: true });

export const StoreCategory = mongoose.model<IStoreCategory>("StoreCategory", storeCategorySchema);
