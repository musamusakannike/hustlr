import { APP_NAME, BRAND } from "../config/constants.config";
import { connectDatabase, disconnectDatabase } from "../config/db.config";
import { WebsiteTemplate } from "../models/website-template.model";
import { Store } from "../models/store.model";
import { applyTemplateDefaults } from "../services/store.service";

export const REMIXED_TEMPLATES = [
  {
    name: "Atelier Furniture",
    slug: "atelier-furniture",
    description: "Serene, organic layout inspired by Nordic interior studios with gallery product layouts and earthy tones.",
    previewImageUrl: "/template-free.png",
    tier: "free" as const,
    category: "general",
    defaultColorScheme: {
      primary: "#5B7065",
      secondary: "#1B2420",
      accent: "#E6EDE8",
      background: "#FAFBF9",
      text: "#1B2420",
    },
    themeSettings: {
      headerVariant: "classic" as const,
      footerVariant: "columns" as const,
      shopLayout: "grid-3" as const,
      productLayout: "gallery" as const,
      productCardVariant: "minimal" as const,
      cardRadius: "16px",
      buttonRadius: "9999px",
    },
    defaultSections: [
      {
        id: "sec_hero_slider",
        type: "hero-slider",
        name: "Artisan Hero Slider",
        isEnabled: true,
        order: 0,
        data: {
          slides: [
            {
              badge: "HANDCRAFTED LIVING",
              heading: "Natural Wood & Sculptural Living",
              subheading: "Timeless handcrafted furniture crafted sustainably for serene modern interiors.",
              ctaText: "Explore Collection",
              ctaLink: "/products",
              image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&auto=format&fit=crop&q=80",
            },
            {
              badge: "MINIMALIST SPACES",
              heading: "Organic Form & Functional Comfort",
              subheading: "Curated seating, ceramic lighting, and architectural accents.",
              ctaText: "Shop New Arrivals",
              ctaLink: "/products",
              image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&auto=format&fit=crop&q=80",
            },
          ],
        },
      },
      {
        id: "sec_banner_grid",
        type: "banner-grid",
        name: "Department Banners",
        isEnabled: true,
        order: 1,
        data: {
          columns: 3,
          items: [
            { title: "Lounge Chairs", subtitle: "Sculpted Comfort", image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&auto=format&fit=crop&q=80", link: "/products" },
            { title: "Warm Lighting", subtitle: "Ceramic & Glass", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80", link: "/products" },
            { title: "Artisan Ceramics", subtitle: "Tabletop Essentials", image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&auto=format&fit=crop&q=80", link: "/products" },
          ],
        },
      },
      {
        id: "sec_icon_boxes",
        type: "icon-boxes",
        name: "Service Guarantees",
        isEnabled: true,
        order: 2,
        data: {
          items: [
            { icon: "Truck", title: "Nationwide Tracked Delivery", description: "Safe insured transit on all large furniture" },
            { icon: "ShieldCheck", title: "100% Escrow Protection", description: "Funds safely held until you inspect delivery" },
            { icon: "RefreshCw", title: "7-Day Return Guarantee", description: "Hassle-free return policy if not delighted" },
            { icon: "Headphones", title: "Dedicated Concierge", description: "Direct artisan & merchant support" },
          ],
        },
      },
      {
        id: "sec_featured_products",
        type: "featured-products",
        name: "Featured Pieces",
        isEnabled: true,
        order: 3,
        data: {
          badge: "CURATED PIECES",
          heading: "Handpicked Essentials",
          subheading: "Best-selling artisan furnishings crafted for modern homes.",
          limit: 6,
        },
      },
      {
        id: "sec_cta_banner",
        type: "cta-banner",
        name: "Design Consultation Banner",
        isEnabled: true,
        order: 4,
        data: {
          badge: "CUSTOM COMMISSIONS",
          heading: "Bespoke Orders & Bulk Spaces",
          subheading: "Partner with our verified artisans to create custom dimension pieces for your home or project.",
          buttonText: "Inquire Now",
          buttonLink: "/contact",
        },
      },
      {
        id: "sec_newsletter",
        type: "newsletter",
        name: "Newsletter",
        isEnabled: true,
        order: 5,
        data: {
          badge: "THE ATELIER JOURNAL",
          heading: "Join our Collector Circle",
          subheading: "Receive seasonal drop previews and private architectural sales.",
          buttonText: "Subscribe",
        },
      },
    ],
  },
  {
    name: "Lumen Fashion",
    slug: "lumen-fashion",
    description: "High-fashion boutique layout with centered navigation, editorial sliders, and rich burgundy accents.",
    previewImageUrl: "/template-free.png",
    tier: "free" as const,
    category: "fashion",
    defaultColorScheme: {
      primary: "#800A1D",
      secondary: "#0A0E11",
      accent: "#FAD4D8",
      background: "#FFFFFF",
      text: "#0A0E11",
    },
    themeSettings: {
      headerVariant: "centered" as const,
      footerVariant: "simple" as const,
      shopLayout: "grid-3" as const,
      productLayout: "centered" as const,
      productCardVariant: "minimal" as const,
      cardRadius: "12px",
      buttonRadius: "9999px",
    },
    defaultSections: [
      {
        id: "sec_hero_slider",
        type: "hero-slider",
        name: "Runway Hero Slider",
        isEnabled: true,
        order: 0,
        data: {
          slides: [
            {
              badge: "AUTUMN / WINTER 2026",
              heading: "The Haute Couture Edit",
              subheading: "Exquisite tailoring, luxe silk silhouettes, and handcrafted statement jewelry.",
              ctaText: "Shop the Runway",
              ctaLink: "/products",
              image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop&q=80",
            },
          ],
        },
      },
      {
        id: "sec_banner_grid",
        type: "banner-grid",
        name: "Campaign Tiles",
        isEnabled: true,
        order: 1,
        data: {
          columns: 3,
          items: [
            { title: "Dresses & Gowns", subtitle: "Evening Elegance", image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&auto=format&fit=crop&q=80", link: "/products" },
            { title: "Leather Handbags", subtitle: "Italian Craftsmanship", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80", link: "/products" },
            { title: "Footwear & Heels", subtitle: "Modern Silhouettes", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80", link: "/products" },
          ],
        },
      },
      {
        id: "sec_new_arrivals",
        type: "new-arrivals",
        name: "New Season Drops",
        isEnabled: true,
        order: 2,
        data: {
          badge: "FRESH DROPS",
          heading: "New Arrivals",
          subheading: "Limited seasonal releases verified for authentic quality.",
          limit: 6,
        },
      },
      {
        id: "sec_split_story",
        type: "split-story",
        name: "Brand Narrative",
        isEnabled: true,
        order: 3,
        data: {
          badge: "OUR ATELIER HERITAGE",
          heading: "Designed with Passion, Finished with Perfection",
          narrative: "Each garment in the Lumen collection is crafted in ethical ateliers with rigorous attention to drape, seam precision, and sustainable textiles.",
          bullets: ["100% Verified Authentic Materials", "Hand-finished Tailoring Details", "Insured Escrow Protected Dispatch"],
          ctaText: "Discover the Story",
          ctaLink: "/about",
          image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&auto=format&fit=crop&q=80",
        },
      },
      {
        id: "sec_testimonials",
        type: "testimonials",
        name: "VIP Reviews",
        isEnabled: true,
        order: 4,
        data: {
          badge: "VERIFIED BUYERS",
          heading: "Loved by Discerning Collectors",
          items: [
            { name: "Amara K.", role: "Fashion Director", comment: "The quality and texture exceeded all expectations. Fast delivery with full escrow safety!", rating: 5 },
            { name: "Folake A.", role: "Creative Stylist", comment: "Incredible attention to tailoring details and fit. My go-to storefront.", rating: 5 },
          ],
        },
      },
      {
        id: "sec_newsletter",
        type: "newsletter",
        name: "VIP Newsletter",
        isEnabled: true,
        order: 5,
        data: {
          badge: "EXCLUSIVE ACCESS",
          heading: "Subscribe to the VIP Private List",
          subheading: "Get first access to limited runway drops and private sale invitations.",
          buttonText: "Join VIP List",
        },
      },
    ],
  },
  {
    name: "Paper Simple",
    slug: "paper-simple",
    description: "Airy, ultra-clean white canvas layout with minimal header and high-density 4-column catalog.",
    previewImageUrl: "/template-free.png",
    tier: "free" as const,
    category: "general",
    defaultColorScheme: {
      primary: "#333F48",
      secondary: "#1A2024",
      accent: "#E8ECEF",
      background: "#FFFFFF",
      text: "#1A2024",
    },
    themeSettings: {
      headerVariant: "classic" as const,
      footerVariant: "simple" as const,
      shopLayout: "grid-4" as const,
      productLayout: "gallery" as const,
      productCardVariant: "minimal" as const,
      cardRadius: "8px",
      buttonRadius: "8px",
    },
    defaultSections: [
      {
        id: "sec_hero",
        type: "hero",
        name: "Minimal Hero",
        isEnabled: true,
        order: 0,
        data: {
          badge: "SIMPLE ESSENTIALS",
          heading: "Pure Functionality. Quiet Elegance.",
          subheading: "Designed with minimal noise and maximum focus on timeless product craftsmanship.",
          primaryCtaText: "Browse All",
          primaryCtaLink: "/products",
          backgroundImage: "https://images.unsplash.com/photo-1449247709967-d4461a6a6103?w=1200&auto=format&fit=crop&q=80",
          align: "left",
        },
      },
      {
        id: "sec_banner_grid",
        type: "banner-grid",
        name: "Duo Promos",
        isEnabled: true,
        order: 1,
        data: {
          columns: 2,
          items: [
            { title: "Desk & Studio", subtitle: "Stationery & Workspace", image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop&q=80", link: "/products" },
            { title: "Home Accents", subtitle: "Natural Oak & Ceramic", image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80", link: "/products" },
          ],
        },
      },
      {
        id: "sec_icon_boxes",
        type: "icon-boxes",
        name: "Service Ribbon",
        isEnabled: true,
        order: 2,
        data: {
          items: [
            { icon: "Truck", title: "Direct Logistics", description: "Direct dispatch from verified workshops" },
            { icon: "ShieldCheck", title: "Escrow Protected", description: "Buyer protection on every checkout" },
            { icon: "RefreshCw", title: "Simple Returns", description: "7 days no questions asked" },
            { icon: "Headphones", title: "Prompt Support", description: "Help whenever you need it" },
          ],
        },
      },
      {
        id: "sec_featured_products",
        type: "featured-products",
        name: "Catalog Rail",
        isEnabled: true,
        order: 3,
        data: {
          badge: "ESSENTIAL CATALOG",
          heading: "Featured Products",
          limit: 8,
        },
      },
      {
        id: "sec_newsletter",
        type: "newsletter",
        name: "Newsletter",
        isEnabled: true,
        order: 4,
        data: {
          badge: "STAY INFORMED",
          heading: "Subscribe for occasional releases",
          subheading: "No spam, only release notices when new batches are finished.",
          buttonText: "Subscribe",
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
    name: "Runway Editorial",
    slug: "runway-editorial",
    description: "High-end editorial fashion storefront with full-width sliders, mosaic lookbook, and overlay cards.",
    previewImageUrl: "/template-pro.png",
    tier: "pro" as const,
    category: "fashion",
    defaultColorScheme: {
      primary: "#18181B",
      secondary: "#09090B",
      accent: "#F4F4F5",
      background: "#FFFFFF",
      text: "#09090B",
    },
    themeSettings: {
      headerVariant: "classic" as const,
      footerVariant: "columns" as const,
      shopLayout: "grid-3" as const,
      productLayout: "extended" as const,
      productCardVariant: "overlay" as const,
      cardRadius: "0px",
      buttonRadius: "0px",
    },
    defaultSections: [
      {
        id: "sec_hero_slider",
        type: "hero-slider",
        name: "Full Runway Slider",
        isEnabled: true,
        order: 0,
        data: {
          slides: [
            {
              badge: "EDITORIAL ISSUE 04",
              heading: "Monochrome Modernism",
              subheading: "Sharp tailoring, structured silhouettes, and avant-garde luxury outerwear.",
              ctaText: "View Lookbook",
              ctaLink: "/products",
              image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&auto=format&fit=crop&q=80",
            },
          ],
        },
      },
      {
        id: "sec_lookbook_grid",
        type: "lookbook-grid",
        name: "Runway Mosaic",
        isEnabled: true,
        order: 1,
        data: {
          badge: "SEASONAL MOODBOARD",
          heading: "The Capsule Wardrobe",
          items: [
            { title: "Wool Overcoats", image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80", link: "/products" },
            { title: "Minimal Blazers", image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80", link: "/products" },
            { title: "Architectural Accessories", image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80", link: "/products" },
          ],
        },
      },
      {
        id: "sec_featured_products",
        type: "featured-products",
        name: "Collection Rail",
        isEnabled: true,
        order: 2,
        data: {
          badge: "RUNWAY DROPS",
          heading: "Featured Garments",
          limit: 6,
        },
      },
      {
        id: "sec_brands",
        type: "brands",
        name: "Partner Labels",
        isEnabled: true,
        order: 3,
        data: {
          heading: "Featured Fashion Houses & Labels",
          items: [
            { name: "VOGUE NOIR" },
            { name: "ATELIER 88" },
            { name: "KINETICS" },
            { name: "LUMEN STUDIO" },
          ],
        },
      },
      {
        id: "sec_newsletter",
        type: "newsletter",
        name: "Editorial Journal",
        isEnabled: true,
        order: 4,
        data: {
          badge: "THE RUNWAY DIGEST",
          heading: "Subscribe to Seasonal Previews",
          subheading: "Private invitations to fashion shows and subscriber-only collections.",
          buttonText: "Subscribe",
        },
      },
    ],
  },
  {
    name: "Sole House",
    slug: "sole-house",
    description: "Footwear & accessories boutique with top utility bar, dual banner grid, and sticky buy-box PDP.",
    previewImageUrl: "/template-pro.png",
    tier: "pro" as const,
    category: "fashion",
    defaultColorScheme: {
      primary: "#C2410C",
      secondary: "#271810",
      accent: "#FFEDD5",
      background: "#FFFBF7",
      text: "#271810",
    },
    themeSettings: {
      headerVariant: "topbar" as const,
      footerVariant: "columns" as const,
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
        name: "Sneaker Drop Banner",
        isEnabled: true,
        order: 0,
        data: {
          slides: [
            {
              badge: "LIMITED SNEAKER DROPS",
              heading: "Premium Streetwear & Leather Boots",
              subheading: "Authentic deadstock sneakers, artisan leather footwear, and verified essentials.",
              ctaText: "Shop Footwear",
              ctaLink: "/products",
              image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&auto=format&fit=crop&q=80",
            },
          ],
        },
      },
      {
        id: "sec_banner_grid",
        type: "banner-grid",
        name: "Category Banners",
        isEnabled: true,
        order: 1,
        data: {
          columns: 2,
          items: [
            { title: "Retro Performance Sneakers", subtitle: "Collector Originals", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80", link: "/products" },
            { title: "Handcrafted Chelsea Boots", subtitle: "Full-Grain Italian Leather", image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&auto=format&fit=crop&q=80", link: "/products" },
          ],
        },
      },
      {
        id: "sec_featured_products",
        type: "featured-products",
        name: "Featured Kicks",
        isEnabled: true,
        order: 2,
        data: {
          badge: "HEAT ON FEET",
          heading: "Trending Footwear",
          limit: 6,
        },
      },
      {
        id: "sec_icon_boxes",
        type: "icon-boxes",
        name: "Authentication Strip",
        isEnabled: true,
        order: 3,
        data: {
          items: [
            { icon: "ShieldCheck", title: "100% Legit Check", description: "Verified authentic by sneaker specialists" },
            { icon: "Truck", title: "Double Boxed Shipping", description: "Protective packaging on every order" },
            { icon: "RefreshCw", title: "Size Swap Guarantee", description: "Easy exchanges for the perfect fit" },
            { icon: "Headphones", title: "Fast Support", description: "Instant WhatsApp & live chat assistance" },
          ],
        },
      },
    ],
  },
  {
    name: "Open Market",
    slug: "open-market",
    description: "Department marketplace template with category banner header and boxed sidebar shop listing.",
    previewImageUrl: "/template-pro.png",
    tier: "pro" as const,
    category: "general",
    defaultColorScheme: {
      primary: "#059669",
      secondary: "#064E3B",
      accent: "#D1FAE5",
      background: "#FFFFFF",
      text: "#062E22",
    },
    themeSettings: {
      headerVariant: "market" as const,
      footerVariant: "columns" as const,
      shopLayout: "boxed-sidebar" as const,
      productLayout: "gallery" as const,
      productCardVariant: "boxed" as const,
      cardRadius: "12px",
      buttonRadius: "8px",
    },
    defaultSections: [
      {
        id: "sec_hero_slider",
        type: "hero-slider",
        name: "Supermarket Banner",
        isEnabled: true,
        order: 0,
        data: {
          slides: [
            {
              badge: "MARKETPLACE SUPERSTORE",
              heading: "Thousands of Verified Goods in One Place",
              subheading: "From daily grocery staples to home appliances, backed by escrow purchase protection.",
              ctaText: "Shop the Marketplace",
              ctaLink: "/products",
              image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1200&auto=format&fit=crop&q=80",
            },
          ],
        },
      },
      {
        id: "sec_categories",
        type: "categories",
        name: "Marketplace Aisles",
        isEnabled: true,
        order: 1,
        data: {
          badge: "DEPARTMENT AISLES",
          heading: "Shop by Category",
          layout: "cards",
        },
      },
      {
        id: "sec_featured_products",
        type: "featured-products",
        name: "Market Deals",
        isEnabled: true,
        order: 2,
        data: {
          badge: "FLASH DISCOUNTS",
          heading: "Best Sellers This Week",
          limit: 6,
        },
      },
      {
        id: "sec_icon_boxes",
        type: "icon-boxes",
        name: "Market Trust",
        isEnabled: true,
        order: 3,
        data: {
          items: [
            { icon: "Truck", title: "Same-Day Delivery", description: "Fast delivery to your doorstep" },
            { icon: "ShieldCheck", title: "Escrow Protected", description: "Safe payments on every order" },
            { icon: "RefreshCw", title: "Freshness Guaranteed", description: "Quality inspection before packaging" },
            { icon: "Headphones", title: "Customer Care", description: "Helpful support 7 days a week" },
          ],
        },
      },
    ],
  },
  {
    name: "Lookbook Studio",
    slug: "lookbook-studio",
    description: "Art gallery aesthetic with mosaic image lookbooks, editorial typography, and 2-column catalog.",
    previewImageUrl: "/template-pro.png",
    tier: "pro" as const,
    category: "art",
    defaultColorScheme: {
      primary: "#A85338",
      secondary: "#1C1310",
      accent: "#F7EDE8",
      background: "#FAF6F3",
      text: "#1C1310",
    },
    themeSettings: {
      headerVariant: "classic" as const,
      footerVariant: "simple" as const,
      shopLayout: "grid-2" as const,
      productLayout: "extended" as const,
      productCardVariant: "minimal" as const,
      cardRadius: "20px",
      buttonRadius: "9999px",
    },
    defaultSections: [
      {
        id: "sec_hero",
        type: "hero",
        name: "Studio Hero",
        isEnabled: true,
        order: 0,
        data: {
          badge: "STUDIO ARCHIVE 2026",
          heading: "Ceramics, Prints & Fine Objects",
          subheading: "A limited exhibition of collectible stoneware, archival prints, and handcrafted home artifacts.",
          primaryCtaText: "Explore Exhibition",
          primaryCtaLink: "/products",
          backgroundImage: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=1200&auto=format&fit=crop&q=80",
        },
      },
      {
        id: "sec_lookbook_grid",
        type: "lookbook-grid",
        name: "Art Mosaic",
        isEnabled: true,
        order: 1,
        data: {
          badge: "CURATED MOSAIC",
          heading: "Exhibition Visuals",
          items: [
            { title: "Sculptural Vases", image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&auto=format&fit=crop&q=80", link: "/products" },
            { title: "Terracotta Vessels", image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&auto=format&fit=crop&q=80", link: "/products" },
            { title: "Archival Art Prints", image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=800&auto=format&fit=crop&q=80", link: "/products" },
          ],
        },
      },
      {
        id: "sec_featured_products",
        type: "featured-products",
        name: "Artwork Rail",
        isEnabled: true,
        order: 2,
        data: {
          badge: "AVAILABLE COMMISSIONS",
          heading: "Selected Works",
          limit: 4,
        },
      },
    ],
  },
  {
    name: "Arcade Games",
    slug: "arcade-games",
    description: "Immersive dark gaming aesthetic with vibrant neon purple accents, overlay product cards, and gaming categories.",
    previewImageUrl: "/template-proplus.png",
    tier: "pro+" as const,
    category: "electronics",
    defaultColorScheme: {
      primary: "#7C3AED",
      secondary: "#090514",
      accent: "#EDE9FE",
      background: "#0F0A21",
      text: "#EDE9FE",
    },
    themeSettings: {
      headerVariant: "classic" as const,
      footerVariant: "dark" as const,
      shopLayout: "grid-4" as const,
      productLayout: "gallery" as const,
      productCardVariant: "overlay" as const,
      cardRadius: "16px",
      buttonRadius: "8px",
    },
    defaultSections: [
      {
        id: "sec_hero_slider",
        type: "hero-slider",
        name: "Gaming Hero",
        isEnabled: true,
        order: 0,
        data: {
          slides: [
            {
              badge: "PRO GAMING GEAR",
              heading: "Next-Gen Consoles, VR & Battlestations",
              subheading: "Equip your battlestation with verified high-performance mechanical keyboards, OLED monitors, and custom rigs.",
              ctaText: "Shop Gaming Gear",
              ctaLink: "/products",
              image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80",
            },
          ],
        },
      },
      {
        id: "sec_categories",
        type: "categories",
        name: "Game Rigs & Accessories",
        isEnabled: true,
        order: 1,
        data: {
          badge: "ECOSYSTEM",
          heading: "Gaming Hardware Categories",
          layout: "cards",
        },
      },
      {
        id: "sec_featured_products",
        type: "featured-products",
        name: "Featured Gear",
        isEnabled: true,
        order: 2,
        data: {
          badge: "HOT LOOT",
          heading: "Top Gaming Hardware",
          limit: 8,
        },
      },
      {
        id: "sec_brands",
        type: "brands",
        name: "Esports Brands",
        isEnabled: true,
        order: 3,
        data: {
          heading: "Official Gaming Hardware Partners",
          items: [
            { name: "TITAN RIGS" },
            { name: "NEXUS VR" },
            { name: "CHRONO PRO" },
            { name: "PULSE AUDIO" },
          ],
        },
      },
    ],
  },
  {
    name: "Folio Books",
    slug: "folio-books",
    description: "Literary bookstore and publishing aesthetic with warm paper backgrounds, narrative story blocks, and multi-column footers.",
    previewImageUrl: "/template-proplus.png",
    tier: "pro+" as const,
    category: "general",
    defaultColorScheme: {
      primary: "#B45309",
      secondary: "#0F172A",
      accent: "#FEF3C7",
      background: "#FFFDF7",
      text: "#0F172A",
    },
    themeSettings: {
      headerVariant: "centered" as const,
      footerVariant: "columns" as const,
      shopLayout: "list" as const,
      productLayout: "gallery" as const,
      productCardVariant: "minimal" as const,
      cardRadius: "12px",
      buttonRadius: "8px",
    },
    defaultSections: [
      {
        id: "sec_hero",
        type: "hero",
        name: "Bookstore Hero",
        isEnabled: true,
        order: 0,
        data: {
          badge: "INDEPENDENT PUBLISHERS",
          heading: "Stories that Shape Generations",
          subheading: "Discover rare first editions, contemporary African literature, and curated art monographs.",
          primaryCtaText: "Explore Books",
          primaryCtaLink: "/products",
          backgroundImage: "https://images.unsplash.com/photo-1507842229451-7f01be8ff7ab?w=1200&auto=format&fit=crop&q=80",
        },
      },
      {
        id: "sec_split_story",
        type: "split-story",
        name: "Author Story",
        isEnabled: true,
        order: 1,
        data: {
          badge: "SPOTLIGHT AUTHOR",
          heading: "Voices of Contemporary Fiction",
          narrative: "Every book in our collection is carefully curated from award-winning independent presses and certified authentic publishers.",
          bullets: ["Hardcover Collector Editions", "Direct Author Royalties", "Protective Book Mailer Packaging"],
          ctaText: "Read Author Interviews",
          ctaLink: "/about",
          image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
        },
      },
      {
        id: "sec_featured_products",
        type: "featured-products",
        name: "Curated Titles",
        isEnabled: true,
        order: 2,
        data: {
          badge: "STAFF PICKS",
          heading: "Featured Titles",
          limit: 6,
        },
      },
      {
        id: "sec_newsletter",
        type: "newsletter",
        name: "Reader Club",
        isEnabled: true,
        order: 3,
        data: {
          badge: "LITERARY CLUB",
          heading: "Join our Reader Society",
          subheading: "Weekly book reviews, author dispatches, and priority signed edition releases.",
          buttonText: "Subscribe",
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
  {
    name: "Summit Extreme",
    slug: "summit-extreme",
    description: "Outdoor expedition & adventure template with vertical left navigation, high-contrast palette, and extended PDP.",
    previewImageUrl: "/template-proplus.png",
    tier: "pro+" as const,
    category: "general",
    defaultColorScheme: {
      primary: "#65A30D",
      secondary: "#18181B",
      accent: "#ECFCCB",
      background: "#09090B",
      text: "#F4F4F5",
    },
    themeSettings: {
      headerVariant: "left-nav" as const,
      footerVariant: "dark" as const,
      shopLayout: "grid-3" as const,
      productLayout: "extended" as const,
      productCardVariant: "overlay" as const,
      cardRadius: "12px",
      buttonRadius: "9999px",
    },
    defaultSections: [
      {
        id: "sec_hero_slider",
        type: "hero-slider",
        name: "Expedition Hero",
        isEnabled: true,
        order: 0,
        data: {
          slides: [
            {
              badge: "MOUNTAIN EXPEDITION GEAR",
              heading: "Conquer the Elements",
              subheading: "Tested in extreme conditions: alpine tents, waterproof GORE-TEX parkas, and tactical packs.",
              ctaText: "Shop Expedition Equipment",
              ctaLink: "/products",
              image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1200&auto=format&fit=crop&q=80",
            },
          ],
        },
      },
      {
        id: "sec_lookbook_grid",
        type: "lookbook-grid",
        name: "Wilderness Visuals",
        isEnabled: true,
        order: 1,
        data: {
          badge: "FIELD TESTED",
          heading: "Expedition Loadout",
          items: [
            { title: "Sub-Zero Outerwear", image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&auto=format&fit=crop&q=80", link: "/products" },
            { title: "Alpine Rucksacks", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80", link: "/products" },
            { title: "Navigation & Optics", image: "https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=800&auto=format&fit=crop&q=80", link: "/products" },
          ],
        },
      },
      {
        id: "sec_featured_products",
        type: "featured-products",
        name: "Expedition Essentials",
        isEnabled: true,
        order: 2,
        data: {
          badge: "CRITICAL GEAR",
          heading: "Tested Hardware",
          limit: 6,
        },
      },
      {
        id: "sec_icon_boxes",
        type: "icon-boxes",
        name: "Guarantees",
        isEnabled: true,
        order: 3,
        data: {
          items: [
            { icon: "ShieldCheck", title: "Extreme Durability", description: "Tested in high altitude and subzero climates" },
            { icon: "Truck", title: "Nationwide Tracked Dispatch", description: "Insured delivery on heavy expedition hardware" },
            { icon: "RefreshCw", title: "Lifetime Repair Support", description: "Artisan and brand repair program" },
            { icon: "Headphones", title: "Expedition Experts", description: "Gear consultants on call" },
          ],
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

  // Find fallback free template
  const fallbackTemplate = await WebsiteTemplate.findOne({ slug: "atelier-furniture" });

  // Delete legacy templates not in our remixed 12 set
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

  // Backfill existing stores that have a templateId but empty customSections
  if (fallbackTemplate) {
    const emptyStores = await Store.find({
      $or: [{ customSections: { $exists: false } }, { customSections: { $size: 0 } }],
    });
    for (const store of emptyStores) {
      let tpl = null;
      if (store.templateId) {
        tpl = await WebsiteTemplate.findById(store.templateId);
      }
      if (!tpl) tpl = fallbackTemplate;
      applyTemplateDefaults(store, tpl);
      await store.save();
      console.log(`[${APP_NAME}] Backfilled store defaults for: ${store.name} (${store.slug})`);
    }
  }

  await disconnectDatabase();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
