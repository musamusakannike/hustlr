import type { ColorScheme, SocialLinks } from "./store";

export type StorefrontSectionType =
  | "hero"
  | "stats"
  | "features"
  | "how-it-works"
  | "split-story"
  | "featured-products"
  | "new-arrivals"
  | "best-sellers"
  | "categories"
  | "testimonials"
  | "cta-banner"
  | "newsletter";

export interface HeroSectionData {
  badge?: string;
  heading: string;
  subheading: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  backgroundImage?: string;
  overlayOpacity?: number;
  align?: "left" | "center";
}

export interface StatItem {
  id?: string;
  icon: string;
  value: string;
  label: string;
}

export interface StatsSectionData {
  items: StatItem[];
}

export interface FeatureCardItem {
  id?: string;
  icon?: string;
  image?: string;
  title: string;
  description: string;
  buttonText?: string;
  buttonLink?: string;
}

export interface FeaturesSectionData {
  badge?: string;
  heading: string;
  subheading?: string;
  cards: FeatureCardItem[];
}

export interface HowItWorksStep {
  id?: string;
  stepNumber: number;
  title: string;
  bullets: string[];
}

export interface HowItWorksSectionData {
  badge?: string;
  heading: string;
  subheading?: string;
  ctaText?: string;
  ctaLink?: string;
  steps: HowItWorksStep[];
}

export interface SplitStorySectionData {
  badge?: string;
  heading: string;
  narrative: string;
  bullets: string[];
  ctaText?: string;
  ctaLink?: string;
  image: string;
  imagePosition?: "right" | "left";
}

export interface ProductRailSectionData {
  badge?: string;
  heading: string;
  subheading?: string;
  limit?: number;
  viewAllLink?: string;
}

export interface CategoriesSectionData {
  badge?: string;
  heading: string;
  subheading?: string;
  layout?: "pills" | "grid" | "cards";
}

export interface TestimonialItem {
  id?: string;
  name: string;
  role?: string;
  comment: string;
  rating: number;
  avatar?: string;
}

export interface TestimonialsSectionData {
  badge?: string;
  heading: string;
  subheading?: string;
  items: TestimonialItem[];
}

export interface CtaBannerSectionData {
  badge?: string;
  heading: string;
  subheading?: string;
  buttonText: string;
  buttonLink: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
}

export interface NewsletterSectionData {
  badge?: string;
  heading: string;
  subheading?: string;
  placeholder?: string;
  buttonText?: string;
}

export interface StorefrontSection<T = any> {
  id: string;
  type: StorefrontSectionType;
  name: string;
  isEnabled: boolean;
  order: number;
  data: T;
}

export interface StorefrontThemeSettings {
  palettePreset?: string;
  heroLayout?: "split" | "centered" | "editorial";
  cardRadius?: string;
  showCategoryPills?: boolean;
}

export interface StorefrontInfo {
  name: string;
  slug: string;
  description: string;
  logo: string;
  banner: string;
  favicon: string;
  socialLinks: SocialLinks;
  colorScheme: ColorScheme;
  contactEmail: string;
  contactPhone: string;
  address: string;
  shippingPolicy: string;
  returnPolicy: string;
  termsOfService: string;
  privacyPolicy: string;
  metaTitle: string;
  metaDescription: string;
  currency: string;
  currencySymbol: string;
  templateId: string | null;
  templateSlug?: string;
  customSections?: StorefrontSection[];
  themeSettings?: StorefrontThemeSettings;
  url: string;
  customDomain: string | null;
  isLive?: boolean;
}

export interface StorefrontProduct {
  id: string;
  storeId: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  images: string[];
  hasVariants: boolean;
  variants: { name: string; options: string[] }[];
  variantCombinations: {
    combination: Record<string, string>;
    price: number;
    stock: number;
    sku?: string;
    image?: string;
  }[];
  tags: string[];
  shippingFee: number;
  estimatedDeliveryDays: string;
  rating: number;
  reviewCount: number;
  isFeatured?: boolean;
  isWishlisted?: boolean;
  createdAt: string;
}

export interface StorefrontFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "popular";
  page?: number;
  limit?: number;
}

export interface AnalyticsOverview {
  totalRevenue: number;
  revenueThisMonth: number;
  revenueChangePercent: number;
  totalOrders: number;
  ordersThisMonth: number;
  averageOrderValue: number;
  totalCustomers: number;
  newCustomersThisMonth: number;
  walletBalance: number;
}

export interface RevenuePoint {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface TopProductRow {
  productId?: string;
  title?: string;
  revenue: number;
  orders?: number;
}

export interface DomainDns {
  cname: { host: string; value: string };
  aRecord: { host: string; value: string } | null;
  note: string;
}

export interface AiTextResult {
  title?: string;
  description?: string;
  suggestions?: string[];
  highlights?: string[];
  metaTitle?: string;
  metaDescription?: string;
  result?: string;
  text?: string;
}