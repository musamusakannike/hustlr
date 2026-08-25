import mongoose, { Document, Schema } from "mongoose";

export interface IHtmlFieldSchema {
  key: string;
  label: string;
  type: "text" | "textarea" | "image" | "color" | "url" | "number" | "list";
}

export interface ITemplateSection extends Document {
  key: string;
  name: string;
  description: string;
  category: string;
  kind: "react" | "html";
  type: string;
  variant: string;
  html: string;
  css: string;
  fieldSchema: IHtmlFieldSchema[];
  bindings: string[];
  defaultData: Record<string, unknown>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const fieldSchema = new Schema<IHtmlFieldSchema>(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: {
      type: String,
      enum: ["text", "textarea", "image", "color", "url", "number", "list"],
      required: true,
    },
  },
  { _id: false },
);

const templateSectionSchema = new Schema<ITemplateSection>(
  {
    key: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    category: { type: String, default: "general", index: true },
    kind: { type: String, enum: ["react", "html"], required: true, index: true },
    type: { type: String, required: true },
    variant: { type: String, default: "default" },
    html: { type: String, default: "" },
    css: { type: String, default: "" },
    fieldSchema: { type: [fieldSchema], default: [] },
    bindings: { type: [String], default: [] },
    defaultData: { type: Schema.Types.Mixed, default: {} },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

templateSectionSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id ? ret._id.toString() : ret.id;
    return ret;
  },
});

templateSectionSchema.set("toObject", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id ? ret._id.toString() : ret.id;
    return ret;
  },
});

export const TemplateSection = mongoose.model<ITemplateSection>("TemplateSection", templateSectionSchema);
