import mongoose, { Document, Schema } from "mongoose";
import type { StoreColorScheme, StoreThemeSettings } from "../utils/storefront-theme.util";

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
  defaultColorScheme: StoreColorScheme;
  themeSettings: StoreThemeSettings;
  defaultSections?: Array<Record<string, unknown>>;
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
    defaultColorScheme: {
      primary: { type: String, default: "#800A1D" },
      secondary: { type: String, default: "#0A0E11" },
      accent: { type: String, default: "#FAD4D8" },
      background: { type: String, default: "#FFFFFF" },
      text: { type: String, default: "#0A0E11" },
    },
    themeSettings: { type: Schema.Types.Mixed, default: {} },
    defaultSections: { type: [Schema.Types.Mixed], default: [] },
  },
  { timestamps: true },
);

websiteTemplateSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret: Record<string, any>) => {
    ret.id = ret._id ? ret._id.toString() : ret.id;
    return ret;
  },
});

websiteTemplateSchema.set("toObject", {
  virtuals: true,
  transform: (_doc, ret: Record<string, any>) => {
    ret.id = ret._id ? ret._id.toString() : ret.id;
    return ret;
  },
});

export const WebsiteTemplate = mongoose.model<IWebsiteTemplate>(
  "WebsiteTemplate",
  websiteTemplateSchema,
);
