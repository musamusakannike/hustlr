import mongoose, { Document, Schema } from "mongoose";

export interface IColorVariable {
  variableName: string;
  defaultValue: string;
  label: string;
}

export interface ILayoutSection {
  sectionId: string;
  sectionName: string;
  isRequired: boolean;
}

export interface IWebsiteTemplate extends Document {
  name: string;
  slug: string;
  description: string;
  previewImageUrl: string;
  tier: "free" | "pro" | "pro+";
  category: string;
  isActive: boolean;
  colorVariables: IColorVariable[];
  layoutSections: ILayoutSection[];
  createdAt: Date;
  updatedAt: Date;
}

const websiteTemplateSchema = new Schema<IWebsiteTemplate>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: "" },
    previewImageUrl: { type: String, default: "" },
    tier: { type: String, enum: ["free", "pro", "pro+"], required: true, index: true },
    category: { type: String, default: "general", index: true },
    isActive: { type: Boolean, default: true },
    colorVariables: [
      {
        variableName: { type: String, required: true },
        defaultValue: { type: String, required: true },
        label: { type: String, required: true },
      },
    ],
    layoutSections: [
      {
        sectionId: { type: String, required: true },
        sectionName: { type: String, required: true },
        isRequired: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true },
);

export const WebsiteTemplate = mongoose.model<IWebsiteTemplate>(
  "WebsiteTemplate",
  websiteTemplateSchema,
);
