export type CouponType = "percentage" | "fixed";
export type CouponAppliesTo = "all" | "specific_products" | "specific_categories";

export interface Coupon {
  id: string;
  storeId: string;
  sellerId: string;
  code: string;
  type: CouponType;
  value: number;
  minimumOrderAmount?: number | null;
  maxUsageCount?: number | null;
  maxUsagePerBuyer: number;
  currentUsageCount: number;
  startDate?: string | null;
  expiryDate?: string | null;
  isActive: boolean;
  appliesTo: CouponAppliesTo;
  applicableProductIds: string[];
  applicableCategories: string[];
  createdAt: string;
}

export interface CouponInput {
  code: string;
  type: CouponType;
  value: number;
  minimumOrderAmount?: number | null;
  maxUsageCount?: number | null;
  maxUsagePerBuyer?: number;
  startDate?: string | null;
  expiryDate?: string | null;
  appliesTo?: CouponAppliesTo;
  applicableProductIds?: string[];
  applicableCategories?: string[];
}

export interface CouponValidation {
  valid: boolean;
  discountAmount: number;
  message?: string;
  coupon?: Coupon;
}