import { APP_NAME, BRAND } from "../config/constants.config";
import { connectDatabase, disconnectDatabase } from "../config/db.config";
import { WebsiteTemplate } from "../models/website-template.model";
import { Store } from "../models/store.model";
import { applyTemplateDefaults } from "../services/store.service";

export const REMIXED_TEMPLATES = [
  {
    name: "ShopCo Streetwear",
    slug: "shopco",
    description: "Bold contemporary streetwear and fashion template styled with iconic high-contrast aesthetics, integral headers, browse-by-style grids, and customer reviews.",
    previewImageUrl: "/template-free.png",
    tier: "free" as const,
    category: "fashion",
    defaultColorScheme: {
      primary: "#000000",
      secondary: "#000000",
      accent: "#F2F0F1",
      background: "#FFFFFF",
      text: "#000000",
    },
    themeSettings: {
      headerVariant: "classic" as const,
      footerVariant: "columns" as const,
      shopLayout: "boxed-sidebar" as const,
      productLayout: "gallery" as const,
      productCardVariant: "minimal" as const,
      cardRadius: "20px",
      buttonRadius: "9999px",
    },
    defaultSections: [
      {
        id: "sec_hero",
        type: "hero",
        name: "ShopCo Hero Banner",
        isEnabled: true,
        order: 0,
        data: {
          badge: "200+ INTERNATIONAL BRANDS",
          heading: "FIND CLOTHES THAT MATCHES YOUR STYLE",
          subheading: "Browse through our diverse range of meticulously crafted garments, designed to bring out your individuality and cater to your sense of style.",
          primaryCtaText: "Shop Now",
          primaryCtaLink: "/products",
          secondaryCtaText: "Explore Collections",
          secondaryCtaLink: "/products",
          align: "left",
        },
      },
      {
        id: "sec_brands",
        type: "brands",
        name: "Brand Logos Strip",
        isEnabled: true,
        order: 1,
        data: {
          heading: "",
          items: [
            { name: "VERSACE" },
            { name: "ZARA" },
            { name: "GUCCI" },
            { name: "PRADA" },
            { name: "Calvin Klein" },
          ],
        },
      },
      {
        id: "sec_new_arrivals",
        type: "new-arrivals",
        name: "New Arrivals",
        isEnabled: true,
        order: 2,
        data: {
          badge: "",
          heading: "NEW ARRIVALS",
          subheading: "",
          limit: 4,
          viewAllLink: "/products",
        },
      },
      {
        id: "sec_top_selling",
        type: "best-sellers",
        name: "Top Selling",
        isEnabled: true,
        order: 3,
        data: {
          badge: "",
          heading: "TOP SELLING",
          subheading: "",
          limit: 4,
          viewAllLink: "/products",
        },
      },
      {
        id: "sec_banner_grid",
        type: "banner-grid",
        name: "Browse By Dress Style",
        isEnabled: true,
        order: 4,
        data: {
          columns: 4,
          items: [
            {
              title: "Casual",
              subtitle: "EVERYDAY ESSENTIALS",
              image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80",
              link: "/products?category=Casual",
            },
            {
              title: "Formal",
              subtitle: "TAILORED REFINEMENT",
              image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80",
              link: "/products?category=Formal",
            },
            {
              title: "Party",
              subtitle: "NIGHT OUT STATEMENT",
              image: "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=800&auto=format&fit=crop&q=80",
              link: "/products?category=Party",
            },
            {
              title: "Gym",
              subtitle: "ACTIVE ATHLEISURE",
              image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
              link: "/products?category=Gym",
            },
          ],
        },
      },
      {
        id: "sec_testimonials",
        type: "testimonials",
        name: "Our Happy Customers",
        isEnabled: true,
        order: 5,
        data: {
          badge: "",
          heading: "OUR HAPPY CUSTOMERS",
          subheading: "",
          items: [
            {
              name: "Sarah M.",
              role: "Verified Buyer",
              rating: 5,
              comment: "I'm blown away by the quality and style of the clothes I received from Shop.co. From casual wear to elegant dresses, every item I've bought has exceeded my expectations.",
            },
            {
              name: "Alex K.",
              role: "Verified Buyer",
              rating: 5,
              comment: "Finding clothes that align with my personal style used to be a challenge until I discovered Shop.co. The range of options they offer is truly remarkable, catering to a variety of tastes and occasions.",
            },
            {
              name: "James L.",
              role: "Verified Buyer",
              rating: 5,
              comment: "As someone who's always on the lookout for unique fashion pieces, I'm thrilled to have stumbled upon Shop.co. The selection of clothes is not only diverse but also on-point with the latest trends.",
            },
          ],
        },
      },
      {
        id: "sec_newsletter",
        type: "newsletter",
        name: "Newsletter",
        isEnabled: true,
        order: 6,
        data: {
          badge: "",
          heading: "STAY UPTO DATE ABOUT OUR LATEST OFFERS",
          subheading: "Subscribe to our newsletter to receive exclusive offers, new arrival alerts and discounts.",
          buttonText: "Subscribe to Newsletter",
        },
      },
    ],
  },
  {
    name: "Circuit Electronics",
    slug: "circuit-electronics",
    description: "Search-first electronics store with category navigation bar, dark blue tones, and dense marketplace rails.",
    previewImageUrl: "/template-pro.png",
    tier: "pro" as const,
    category: "electronics",
    defaultColorScheme: {
      primary: "#0284C7",
      secondary: "#0F172A",
      accent: "#E0F2FE",
      background: "#F8FAFC",
      text: "#0F172A",
    },
    themeSettings: {
      headerVariant: "market" as const,
      footerVariant: "columns" as const,
      shopLayout: "grid-4" as const,
      productLayout: "gallery" as const,
      productCardVariant: "boxed" as const,
      cardRadius: "12px",
      buttonRadius: "8px",
    },
    defaultSections: [
      {
        id: "sec_hero_slider",
        type: "hero-slider",
        name: "Tech Flagship Banner",
        isEnabled: true,
        order: 0,
        data: {
          slides: [
            {
              badge: "NEXT-GEN AUDIO",
              heading: "Wireless Noise-Cancelling Headphones",
              subheading: "Audiophile-grade studio fidelity with 40-hour fast charging battery life.",
              ctaText: "Shop Audio Gear",
              ctaLink: "/products",
              image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80",
            },
          ],
        },
      },
      {
        id: "sec_icon_boxes",
        type: "icon-boxes",
        name: "Warranty & Shipping",
        isEnabled: true,
        order: 1,
        data: {
          items: [
            { icon: "ShieldCheck", title: "1-Year Warranty", description: "Official brand manufacturer warranty" },
            { icon: "Truck", title: "Fast Express Delivery", description: "Tracked same-day courier dispatch" },
            { icon: "RefreshCw", title: "Verified Returns", description: "Easy replacement on tech defects" },
            { icon: "Headphones", title: "Tech Help Desk", description: "Expert technical setup support" },
          ],
        },
      },
      {
        id: "sec_categories",
        type: "categories",
        name: "Department Rails",
        isEnabled: true,
        order: 2,
        data: {
          badge: "DEPARTMENTS",
          heading: "Popular Tech Categories",
          layout: "pills",
        },
      },
      {
        id: "sec_featured_products",
        type: "featured-products",
        name: "Flagship Gadgets",
        isEnabled: true,
        order: 3,
        data: {
          badge: "TOP PICKS",
          heading: "Featured Electronics",
          limit: 8,
        },
      },
      {
        id: "sec_cta_banner",
        type: "cta-banner",
        name: "Trade-in Promo",
        isEnabled: true,
        order: 4,
        data: {
          badge: "DEVICE TRADE-IN",
          heading: "Upgrade Your Tech Setup Today",
          subheading: "Guaranteed authentic tech gadgets with instant escrow release on confirmation.",
          buttonText: "Browse All Electronics",
          buttonLink: "/products",
        },
      },
    ],
  },
  {
    name: "Apex Sport",
    slug: "apex-sport",
    description: "High-energy athletic storefront featuring bold crimson banners, dynamic category cards, and fast performance grids.",
    previewImageUrl: "/template-proplus.png",
    tier: "pro+" as const,
    category: "general",
    defaultColorScheme: {
      primary: "#DC2626",
      secondary: "#111827",
      accent: "#FEE2E2",
      background: "#FFFFFF",
      text: "#111827",
    },
    themeSettings: {
      headerVariant: "topbar" as const,
      footerVariant: "dark" as const,
      shopLayout: "grid-3" as const,
      productLayout: "sticky" as const,
      productCardVariant: "boxed" as const,
      cardRadius: "16px",
      buttonRadius: "9999px",
    },
    defaultSections: [
      {
        id: "sec_hero_slider",
        type: "hero-slider",
        name: "Athlete Banner",
        isEnabled: true,
        order: 0,
        data: {
          slides: [
            {
              badge: "PRO ATHLETIC PERFORMANCE",
              heading: "Train Without Compromise",
              subheading: "Engineered activewear, carbon running shoes, and training essentials built for high endurance.",
              ctaText: "Shop Athletics",
              ctaLink: "/products",
              image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&auto=format&fit=crop&q=80",
            },
          ],
        },
      },
      {
        id: "sec_banner_grid",
        type: "banner-grid",
        name: "Sports Disciplines",
        isEnabled: true,
        order: 1,
        data: {
          columns: 3,
          items: [
            { title: "Marathon & Running", subtitle: "Carbon Plate Shoes", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80", link: "/products" },
            { title: "Gym & Cross-Training", subtitle: "Breathable Compression", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80", link: "/products" },
            { title: "Outdoor & Trail", subtitle: "All-Weather Technical", image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&auto=format&fit=crop&q=80", link: "/products" },
          ],
        },
      },
      {
        id: "sec_icon_boxes",
        type: "icon-boxes",
        name: "Athlete Perks",
        isEnabled: true,
        order: 2,
        data: {
          items: [
            { icon: "Truck", title: "Express Dispatch", description: "Fast delivery nationwide" },
            { icon: "ShieldCheck", title: "100% Genuine Gear", description: "Authorized performance brands only" },
            { icon: "RefreshCw", title: "Free Size Exchanges", description: "Find your ideal fit stress-free" },
            { icon: "Headphones", title: "Pro Athlete Advice", description: "Gear fitment guidance" },
          ],
        },
      },
      {
        id: "sec_featured_products",
        type: "featured-products",
        name: "Performance Drops",
        isEnabled: true,
        order: 3,
        data: {
          badge: "PEAK PERFORMANCE",
          heading: "Top Training Gear",
          limit: 6,
        },
      },
    ],
  },
];

async function run(): Promise<void> {
  await connectDatabase();
  const upsertedSlugs: string[] = [];

  for (const t of REMIXED_TEMPLATES) {
    const colorVars = [
      { variableName: "--primary-color", defaultValue: t.defaultColorScheme.primary, label: "Primary Color" },
      { variableName: "--secondary-color", defaultValue: t.defaultColorScheme.secondary, label: "Secondary Color" },
      { variableName: "--accent-color", defaultValue: t.defaultColorScheme.accent, label: "Accent Color" },
      { variableName: "--background-color", defaultValue: t.defaultColorScheme.background, label: "Background Color" },
      { variableName: "--text-color", defaultValue: t.defaultColorScheme.text, label: "Text Color" },
    ];

    const layoutSecs = (t.defaultSections || []).map((s) => ({
      sectionId: s.type,
      sectionName: s.name,
      isRequired: s.type === "hero" || s.type === "hero-slider" || s.type === "featured-products",
    }));

    await WebsiteTemplate.findOneAndUpdate(
      { slug: t.slug },
      {
        ...t,
        isActive: true,
        colorVariables: colorVars,
        layoutSections: layoutSecs,
      },
      { upsert: true, new: true },
    );
    upsertedSlugs.push(t.slug);
    console.log(`[${APP_NAME}] Upserted template: ${t.name} (${t.slug})`);
  }

  // Find fallback free default template
  const fallbackTemplate = await WebsiteTemplate.findOne({ slug: "shopco" });

  // Delete legacy templates not in our 3 templates set
  const deleted = await WebsiteTemplate.find({ slug: { $nin: upsertedSlugs } });
  for (const del of deleted) {
    if (fallbackTemplate) {
      await Store.updateMany(
        { templateId: del._id },
        {
          $set: {
            templateId: fallbackTemplate._id,
            colorScheme: fallbackTemplate.defaultColorScheme,
            themeSettings: fallbackTemplate.themeSettings,
            customSections: fallbackTemplate.defaultSections,
          },
        },
      );
    }
    await WebsiteTemplate.findByIdAndDelete(del._id);
    console.log(`[${APP_NAME}] Removed legacy template: ${del.name} (${del.slug})`);
  }

  // Backfill existing stores that have no templateId or empty customSections to default ShopCo
  if (fallbackTemplate) {
    const storesToUpdate = await Store.find({
      $or: [
        { templateId: null },
        { templateId: { $exists: false } },
        { customSections: { $exists: false } },
        { customSections: { $size: 0 } },
      ],
    });
    for (const store of storesToUpdate) {
      applyTemplateDefaults(store, fallbackTemplate);
      await store.save();
      console.log(`[${APP_NAME}] Backfilled store to ShopCo: ${store.name} (${store.slug})`);
    }
  }

  await disconnectDatabase();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
