import mongoose, { Document, Schema } from "mongoose";

export interface IBlogPost extends Document {
  storeId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  tags: string[];
  status: "draft" | "published" | "archived";
  publishedAt?: Date | null;
  metaTitle?: string;
  metaDescription?: string;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const blogPostSchema = new Schema<IBlogPost>(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true },
    content: { type: String, default: "" },
    excerpt: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    tags: { type: [String], default: [] },
    status: { type: String, enum: ["draft", "published", "archived"], default: "draft", index: true },
    publishedAt: { type: Date, default: null },
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

blogPostSchema.index({ storeId: 1, slug: 1 }, { unique: true });

export const BlogPost = mongoose.model<IBlogPost>("BlogPost", blogPostSchema);
