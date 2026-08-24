export type ProductStatus = "draft" | "active" | "archived";

export interface ProductVariant {
  name: string;
  options: string[];
}

export interface VariantCombination {
  combination: Record<string, string>;
  price: number;
  stock: number;
  sku?: string;
  image?: string;
}

export interface Product {
  id: string;
  storeId: string;
  sellerId: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  compareAtPrice?: number | null;
  sku: string;
  stock: number;
  images: string[];
  weightKg?: number | null;
  hasVariants: boolean;
  variants: ProductVariant[];
  variantCombinations: VariantCombination[];
  status: ProductStatus;
  isFeatured: boolean;
  tags: string[];
  shippingFee: number;
  estimatedDeliveryDays: string;
  rating: number;
  reviewCount: number;
  orderCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductInput {
  title: string;
  description: string;
  category: string;
  price: number;
  compareAtPrice?: number | null;
  sku?: string;
  stock: number;
  weightKg?: number | null;
  hasVariants: boolean;
  variants: ProductVariant[];
  variantCombinations: VariantCombination[];
  status: ProductStatus;
  isFeatured: boolean;
  tags: string[];
  shippingFee: number;
  estimatedDeliveryDays: string;
  images: string[];
}

export interface ProductFilters {
  status?: ProductStatus | "all";
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface BulkStatusInput {
  productIds: string[];
  status: ProductStatus;
}

export interface ProductStats {
  total: number;
  active: number;
  draft: number;
  archived: number;
  outOfStock: number;
}
