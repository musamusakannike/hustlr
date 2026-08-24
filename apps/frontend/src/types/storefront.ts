import type { ColorScheme, SocialLinks } from "./store";

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
  metaTitle?: string;
  metaDescription?: string;
  result?: string;
  text?: string;
}