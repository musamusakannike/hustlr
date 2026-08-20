import { APP_NAME, BRAND } from "../config/constants.config";
import { connectDatabase, disconnectDatabase } from "../config/db.config";
import { WebsiteTemplate } from "../models/website-template.model";

const templates = [
  {
    name: "Modern Minimal",
    slug: "modern-minimal",
    description: "Clean, product-first layout for fashion and lifestyle brands.",
    previewImageUrl: "/template-free.png",
    tier: "free" as const,
    category: "fashion",
  },
  {
    name: "Bold Showcase",
    slug: "bold-showcase",
    description: "High-contrast storefront with large hero and featured collections.",
    previewImageUrl: "/template-pro.png",
    tier: "pro" as const,
    category: "general",
  },
  {
    name: "Classic Storefront",
    slug: "classic-storefront",
    description: "Editorial layout with blog, testimonials, and custom domain ready.",
    previewImageUrl: "/template-proplus.png",
    tier: "pro+" as const,
    category: "art",
  },
];

async function run(): Promise<void> {
  await connectDatabase();
  for (const t of templates) {
    await WebsiteTemplate.findOneAndUpdate(
      { slug: t.slug },
      {
        ...t,
        isActive: true,
        colorVariables: [
          { variableName: "--primary-color", defaultValue: BRAND.primaryColor, label: "Primary Color" },
          { variableName: "--background-color", defaultValue: BRAND.background, label: "Background" },
          { variableName: "--text-color", defaultValue: BRAND.textColor, label: "Text" },
        ],
        layoutSections: [
          { sectionId: "hero", sectionName: "Hero", isRequired: true },
          { sectionId: "featured-products", sectionName: "Featured Products", isRequired: true },
          { sectionId: "testimonials", sectionName: "Testimonials", isRequired: false },
          { sectionId: "newsletter-signup", sectionName: "Newsletter", isRequired: false },
        ],
      },
      { upsert: true },
    );
    console.log(`[${APP_NAME}] upserted template ${t.name}`);
  }
  await disconnectDatabase();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
