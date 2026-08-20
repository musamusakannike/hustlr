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
  id: string;
  name: string;
  slug: string;
  description: string;
  previewImageUrl: string;
  tier: TemplateTier;
  category: string;
  isActive: boolean;
  colorVariables: ColorVariable[];
  layoutSections: LayoutSection[];
  createdAt: string;
  updatedAt: string;
}

export interface TemplateListFilters {
  tier?: TemplateTier;
  category?: string;
}
