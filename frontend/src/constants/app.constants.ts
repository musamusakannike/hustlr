export const APP_NAME = "Hustlr";
export const APP_SLOGAN = "Launch Your Custom E-Commerce Storefront in Minutes";
export const APP_TAGLINE =
  "Empowering African merchants and creators to build branded online stores, accept Paystack payments with escrow protection, and manage sales seamlessly.";

export const APP_DOMAIN = "hustlr.online";
export const APP_URL = `https://${APP_DOMAIN}`;
export const SUPPORT_EMAIL = "support@hustlr.online";

export const COLORS = {
  primary: "#800A1D", // Deep Maroon
  primaryHover: "#660817",
  primaryLight: "#FAD4D8", // Soft Rose/Maroon tint
  primaryBorder: "rgba(128, 10, 29, 0.2)",
  dark: "#0A0E11", // Pitch Dark / Charcoal
  darkSecondary: "#12171A",
  bgLight: "#EFEFEF", // Soft off-white backdrop
  white: "#FFFFFF",
  textDark: "#0A0E11",
  textMuted: "#666666",
  textSubtle: "#AAAAAA",
  borderLight: "#E5E7EB",
};

export const SIZES = {
  maxContainer: "max-w-7xl",
  headerHeight: "80px",
  borderRadiusCard: "rounded-3xl",
  borderRadiusButton: "rounded-lg",
};

export const NAV_LINKS = [
  { name: "Home", href: "#hero", external: false },
  { name: "Features", href: "#features", external: false },
  { name: "Templates", href: "#templates", external: false },
  { name: "Pricing", href: "#pricing", external: false },
  { name: "Merchant FAQs", href: "#faqs", external: false },
];

export const MARQUEE_ITEMS = [
  "DYNAMIC STORE TEMPLATES",
  "PAYSTACK ESCROW PAYMENTS",
  "CUSTOM SUBDOMAINS & DOMAINS",
  "ZERO COMMISSIONS ON PRO",
  "REAL-TIME ORDER TRACKING",
  "INSTANT WALLET WITHDRAWALS",
  "VERIFIED MERCHANTS & KYC",
];

export const FEATURE_CARDS = [
  {
    title: "Instant Store Setup",
    description:
      "Launch your custom store with your own unique subdomain (e.g. musa-store.hustlr.online) in under 5 minutes. No coding required.",
    isDark: false,
    badge: "5 Min Setup",
  },
  {
    title: "Escrow Payment Protection",
    description:
      "Integrated Paystack payments hold customer funds in escrow until delivery is confirmed. Buyers shop with trust, sellers get paid securely.",
    isDark: true,
    badge: "100% Secure",
  },
  {
    title: "Pro Templates & Custom Domains",
    description:
      "Stand out with high-converting storefront themes, custom colors, domain mapping (www.yourname.com), and product variant management.",
    isDark: false,
    badge: "Pro Branding",
  },
];

export const PLATFORM_CAPABILITIES = [
  {
    iconType: "subdomain",
    title: "Custom Storefronts & Subdomains",
    description:
      "Give your store a memorable brand identity. Get an instant subdomain or connect your custom domain name with automatic SSL.",
  },
  {
    iconType: "escrow",
    title: "Escrow Wallet & Instant Payouts",
    description:
      "Buyer payments are held in escrow during transit. Once delivered, payouts land in your wallet ready for instant withdrawal to your bank account.",
  },
];

export const STORE_TEMPLATES = [
  {
    id: "free-template",
    name: "Modern Minimalist",
    tier: "Free Tier",
    slug: "modern-minimalist",
    description:
      "Clean, high-performance storefront layout designed for boutique fashion, beauty, and craft brands.",
    image: "/template-free.png",
    accentColor: "#800A1D",
    isFeatured: false,
  },
  {
    id: "pro-template",
    name: "Bold Electronics & Gadgets",
    tier: "Pro Plan",
    slug: "bold-gadgets",
    description:
      "Dark-themed immersive layout optimized for electronics, phones, accessories, and multi-category catalogs.",
    image: "/template-pro.png",
    accentColor: "#800A1D",
    isFeatured: true,
  },
  {
    id: "proplus-template",
    name: "Aurelia Pro+ Luxury",
    tier: "Pro+ VIP Plan",
    slug: "luxury-aurelia",
    description:
      "Premium high-end storefront featuring custom video hero sections, gold accents, and express Paystack checkout.",
    image: "/template-proplus.png",
    accentColor: "#800A1D",
    isFeatured: false,
  },
];

export const PRICING_PLANS = [
  {
    name: "Free",
    slug: "free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    commissionPercent: "10%",
    description: "Perfect for new sellers testing out their online store idea.",
    isPopular: false,
    features: [
      "1 Storefront Subdomain",
      "Up to 25 Products Listing",
      "Access to Free Store Templates",
      "Paystack Escrow Integration",
      "Basic Order Analytics",
      "Email Customer Support",
    ],
  },
  {
    name: "Pro",
    slug: "pro",
    monthlyPrice: 15000,
    yearlyPrice: 150000,
    commissionPercent: "7%",
    description: "Ideal for growing businesses looking for full customization.",
    isPopular: true,
    features: [
      "1 Custom Subdomain",
      "Unlimited Product Listings",
      "Access to All Pro Templates",
      "Discount Coupons & Promotions",
      "Storefront Color Customization",
      "Reduced Platform Commission (7%)",
      "Priority Email & Chat Support",
    ],
  },
  {
    name: "Pro+",
    slug: "pro-plus",
    monthlyPrice: 35000,
    yearlyPrice: 350000,
    commissionPercent: "5%",
    description: "Built for established brands needing custom domains & lowest fees.",
    isPopular: false,
    features: [
      "Custom Domain Mapping (yourstore.com)",
      "Unlimited Products & Variants",
      "Access to Exclusive Pro+ Templates",
      "Lowest Platform Commission (5%)",
      "Advanced Inventory & Analytics",
      "Multi-Currency Support Ready",
      "Dedicated Account Manager",
    ],
  },
];

export const FAQS = [
  {
    question: "How long does it take to create a store on Hustlr?",
    answer:
      "You can register and set up your store details, upload products, and go live in less than 10 minutes.",
  },
  {
    question: "How does the Paystack escrow system work?",
    answer:
      "When a buyer orders from your storefront, their payment is safely held by Hustlr in escrow. Once you ship the item and the buyer confirms delivery, funds are instantly released to your wallet for withdrawal.",
  },
  {
    question: "Can I use my own custom domain (e.g. www.mybrand.com)?",
    answer:
      "Yes! Sellers on the Pro+ plan can connect their existing domain directly to their Hustlr storefront with free SSL certificate setup.",
  },
  {
    question: "How do payouts work when I withdraw my earnings?",
    answer:
      "Once escrow is released to your wallet balance, you can click 'Withdraw' anytime to send funds directly to any Nigerian bank account via Paystack transfer.",
  },
];
