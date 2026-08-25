import type { ColorScheme } from "./store";
import type { StorefrontSection } from "./storefront";
import type { StoreThemeSettings } from "@/lib/storefront-theme";
import type { HtmlFieldSchema } from "@/lib/html-section";

export type TemplateTier = "free" | "pro" | "pro+";

export interface ColorVariable {
  variableName: string;
  defaultValue: string;
  label: string;
}

export interface LayoutSection {
  sectionId: string;
  sectionName: string;
  isRequired: boolean;
}

export interface WebsiteTemplate {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  description: string;
  previewImageUrl: string;
  tier: TemplateTier;
  category: string;
  isActive: boolean;
  colorVariables?: ColorVariable[];
  layoutSections?: LayoutSection[];
  defaultColorScheme?: ColorScheme;
  themeSettings?: StoreThemeSettings;
  defaultSections?: StorefrontSection[];
  createdAt: string;
  updatedAt: string;
}

export interface TemplateSectionDefinition {
  _id?: string;
  id?: string;
  key: string;
  name: string;
  description: string;
  category: string;
  kind: "react" | "html";
  type: string;
  variant: string;
  html: string;
  css: string;
  fieldSchema: HtmlFieldSchema[];
  bindings: string[];
  defaultData: Record<string, unknown>;
  isActive: boolean;
}

export interface TemplateListFilters {
  tier?: TemplateTier;
  category?: string;
}
