import type { WebsiteTemplate } from "@/types/template";

const baseVars = [
  { variableName: "--primary-color", defaultValue: "#800A1D", label: "Primary Color" },
  { variableName: "--accent-color", defaultValue: "#FAD4D8", label: "Accent Color" },
  { variableName: "--background-color", defaultValue: "#FFFFFF", label: "Background" },
  { variableName: "--text-color", defaultValue: "#0A0E11", label: "Text Color" },
];

const baseSections = [
  { sectionId: "hero", sectionName: "Hero Banner", isRequired: true },
  { sectionId: "featured-products", sectionName: "Featured Products", isRequired: true },
  { sectionId: "newsletter-signup", sectionName: "Newsletter Signup", isRequired: false },
];

export const DEMO_TEMPLATES: WebsiteTemplate[] = [
  {
    id: "tpl_minimalist",
    name: "Modern Minimalist",
    slug: "modern-minimalist",
    description:
      "Clean, high-performance storefront layout designed for boutique fashion, beauty, and craft brands.",
    previewImageUrl: "/template-free.png",
    tier: "free",
    category: "fashion",
    isActive: true,
    colorVariables: baseVars,
    layoutSections: baseSections,
    createdAt: "2026-06-01T10:00:00.000Z",
    updatedAt: "2026-06-01T10:00:00.000Z",
  },
  {
    id: "tpl_marketplace",
    name: "Classic Storefront",
    slug: "classic-storefront",
    description:
      "Traditional multi-category shop layout with prominent category tiles and a trust-focused hero.",
    previewImageUrl: "/template-free.png",
    tier: "free",
    category: "general",
    isActive: true,
    colorVariables: baseVars,
    layoutSections: [
      ...baseSections,
      { sectionId: "testimonials", sectionName: "Testimonials", isRequired: false },
    ],
    createdAt: "2026-06-01T10:00:00.000Z",
    updatedAt: "2026-06-01T10:00:00.000Z",
  },
  {
    id: "tpl_bold_gadgets",
    name: "Bold Electronics & Gadgets",
    slug: "bold-gadgets",
    description:
      "Dark-themed immersive layout optimized for electronics, phones, accessories, and multi-category catalogs.",
    previewImageUrl: "/template-pro.png",
    tier: "pro",
    category: "electronics",
    isActive: true,
    colorVariables: [
      ...baseVars,
      { variableName: "--card-radius", defaultValue: "16px", label: "Card Roundness" },
    ],
    layoutSections: [
      ...baseSections,
      { sectionId: "best-sellers", sectionName: "Best Sellers Rail", isRequired: false },
    ],
    createdAt: "2026-06-05T10:00:00.000Z",
    updatedAt: "2026-06-05T10:00:00.000Z",
  },
  {
    id: "tpl_glow_beauty",
    name: "Glow Beauty Showcase",
    slug: "glow-beauty",
    description:
      "Soft, airy layout with editorial product storytelling for skincare, beauty, and wellness brands.",
    previewImageUrl: "/template-pro.png",
    tier: "pro",
    category: "beauty",
    isActive: true,
    colorVariables: baseVars,
    layoutSections: baseSections,
    createdAt: "2026-06-05T10:00:00.000Z",
    updatedAt: "2026-06-05T10:00:00.000Z",
  },
  {
    id: "tpl_aurelia",
    name: "Aurelia Pro+ Luxury",
    slug: "luxury-aurelia",
    description:
      "Premium high-end storefront featuring custom video hero sections, gold accents, and express Paystack checkout.",
    previewImageUrl: "/template-proplus.png",
    tier: "pro+",
    category: "fashion",
    isActive: true,
    colorVariables: [
      ...baseVars,
      { variableName: "--hero-video", defaultValue: "enabled", label: "Video Hero" },
    ],
    layoutSections: [
      ...baseSections,
      { sectionId: "lookbook", sectionName: "Seasonal Lookbook", isRequired: false },
      { sectionId: "vip-list", sectionName: "VIP Mailing List", isRequired: false },
    ],
    createdAt: "2026-06-10T10:00:00.000Z",
    updatedAt: "2026-06-10T10:00:00.000Z",
  },
  {
    id: "tpl_atelier",
    name: "Atelier Pro+ Gallery",
    slug: "atelier-gallery",
    description:
      "Gallery-first layout for artists, photographers, and creators selling limited prints and commissions.",
    previewImageUrl: "/template-proplus.png",
    tier: "pro+",
    category: "art",
    isActive: true,
    colorVariables: baseVars,
    layoutSections: [
      { sectionId: "hero", sectionName: "Hero Banner", isRequired: true },
      { sectionId: "gallery-grid", sectionName: "Gallery Grid", isRequired: true },
      { sectionId: "commissions", sectionName: "Commission Request Form", isRequired: false },
    ],
    createdAt: "2026-06-10T10:00:00.000Z",
    updatedAt: "2026-06-10T10:00:00.000Z",
  },
];
