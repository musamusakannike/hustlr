import mongoose, { Document, Schema } from "mongoose";

export interface IGlobalCategory extends Document {
  name: string;
  slug: string;
  image?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const globalCategorySchema = new Schema<IGlobalCategory>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    image: { type: String, default: "" },
    description: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const GlobalCategory = mongoose.model<IGlobalCategory>("GlobalCategory", globalCategorySchema);
