import type { Store } from "@/types/store";

/** Store fixture: setup mostly complete, template not yet chosen, not live. */
export const DEMO_STORE: Store = {
  id: "store_0001",
  sellerId: "seller_0001",
  name: "Musa's Fashion Hub",
  slug: "musas-fashion-hub",
  description:
    "Premium handmade Ankara wear, accessories and limited fashion drops. Based in Lagos, delivering across Nigeria.",
  logo: "/nav-icon.webp",
  banner: "/hero.png",
  favicon: "",
  socialLinks: {
    facebook: "https://facebook.com/musasfashionhub",
    twitter: "",
    instagram: "https://instagram.com/musasfashionhub",
    whatsappNumber: "+2348012345678",
    tiktok: "",
    youtube: "",
  },
  colorScheme: {
    primary: "#800A1D",
    secondary: "#0A0E11",
    accent: "#FAD4D8",
    background: "#FFFFFF",
    text: "#0A0E11",
  },
  templateId: null,
  currency: "NGN",
  currencySymbol: "₦",
  contactEmail: "hello@musasfashionhub.com",
  contactPhone: "+2348012345678",
  address: "12 Adeola Odeku Street, Victoria Island, Lagos",
  isLive: false,
  customDomain: null,
  customDomainVerified: false,
  metaTitle: "Musa's Fashion Hub — Premium Ankara & Fashion",
  metaDescription:
    "Shop handmade Ankara wear, accessories and limited drops from Musa's Fashion Hub. Escrow-protected payments, nationwide delivery.",
  shippingPolicy:
    "Orders are processed within 24 hours. Delivery takes 2-5 business days nationwide. Free shipping on orders above ₦50,000.",
  returnPolicy:
    "Items may be returned within 7 days of delivery if unused and in original packaging. Refunds are processed to the original payment method within 5 business days.",
  termsOfService:
    "By purchasing from Musa's Fashion Hub you agree to our escrow-protected checkout flow and delivery confirmation process.",
  privacyPolicy:
    "We only collect the information needed to fulfil your orders. Your data is never shared with third parties.",
  createdAt: "2026-07-05T10:00:00.000Z",
  updatedAt: "2026-08-12T10:00:00.000Z",
};

/** Slugs already taken by other stores on the platform. */
export const TAKEN_SLUGS = [
  "fashion-hub",
  "ankara-store",
  "tech-gadgets",
  "glow-beauty",
  "kicks-ng",
];
