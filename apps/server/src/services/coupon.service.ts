import { Coupon } from "../models/coupon.model";
import { Product } from "../models/product.model";
import { ApiError } from "../utils/api-error.util";
import { getSellerStore } from "./store-helper.service";
import { escapeRegex } from "../utils/pagination.util";

export async function createCoupon(sellerId: string, payload: Record<string, unknown>) {
  const store = await getSellerStore(sellerId);
  const code = String(payload.code).toUpperCase();
  const exists = await Coupon.exists({ storeId: store._id, code });
  if (exists) throw ApiError.conflict("Coupon code already exists in this store");
  if (payload.type === "percentage" && Number(payload.value) > 100) {
    throw ApiError.badRequest("Percentage discount cannot exceed 100");
  }
  return Coupon.create({
    storeId: store._id,
    sellerId,
    code,
    type: payload.type,
    value: payload.value,
    minimumOrderAmount: payload.minimumOrderAmount ?? null,
    maxUsageCount: payload.maxUsageCount ?? null,
    maxUsagePerBuyer: payload.maxUsagePerBuyer ?? 1,
    startDate: payload.startDate ?? null,
    expiryDate: payload.expiryDate ?? null,
    isActive: payload.isActive ?? true,
    appliesTo: payload.appliesTo ?? "all",
    applicableProductIds: payload.applicableProductIds ?? [],
    applicableCategories: payload.applicableCategories ?? [],
  });
}

export async function listCoupons(
  sellerId: string,
  query: { isActive?: boolean; search?: string; skip: number; limit: number },
) {
  const store = await getSellerStore(sellerId);
  const filter: Record<string, unknown> = { storeId: store._id };
  if (typeof query.isActive === "boolean") filter.isActive = query.isActive;
  if (query.search) filter.code = new RegExp(escapeRegex(query.search), "i");
  const [items, total] = await Promise.all([
    Coupon.find(filter).sort({ createdAt: -1 }).skip(query.skip).limit(query.limit),
    Coupon.countDocuments(filter),
  ]);
  return { items, total };
}

export async function updateCoupon(sellerId: string, couponId: string, payload: Record<string, unknown>) {
  const coupon = await Coupon.findOne({ _id: couponId, sellerId });
  if (!coupon) throw ApiError.notFound("Coupon not found");
  const allowed = [
    "type",
    "value",
    "minimumOrderAmount",
    "maxUsageCount",
    "maxUsagePerBuyer",
    "startDate",
    "expiryDate",
    "isActive",
    "appliesTo",
    "applicableProductIds",
    "applicableCategories",
  ];
  for (const key of allowed) {
    if (payload[key] !== undefined) (coupon as unknown as Record<string, unknown>)[key] = payload[key];
  }
  await coupon.save();
  return coupon;
}

export async function toggleCoupon(sellerId: string, couponId: string) {
  const coupon = await Coupon.findOne({ _id: couponId, sellerId });
  if (!coupon) throw ApiError.notFound("Coupon not found");
  coupon.isActive = !coupon.isActive;
  await coupon.save();
  return coupon;
}

export async function deleteCoupon(sellerId: string, couponId: string) {
  const coupon = await Coupon.findOne({ _id: couponId, sellerId });
  if (!coupon) throw ApiError.notFound("Coupon not found");
  if (coupon.currentUsageCount > 0) {
    coupon.isActive = false;
    await coupon.save();
    return { deactivated: true };
  }
  await coupon.deleteOne();
  return { deleted: true };
}

export async function couponUsage(sellerId: string, couponId: string) {
  const coupon = await Coupon.findOne({ _id: couponId, sellerId });
  if (!coupon) throw ApiError.notFound("Coupon not found");
  return {
    code: coupon.code,
    currentUsageCount: coupon.currentUsageCount,
    maxUsageCount: coupon.maxUsageCount,
    usedBy: coupon.usedBy,
  };
}

export function couponApplies(coupon: InstanceType<typeof Coupon>, product: InstanceType<typeof Product>): boolean {
  if (coupon.appliesTo === "all") return true;
  if (coupon.appliesTo === "specific_products") {
    return coupon.applicableProductIds.some((id) => String(id) === String(product._id));
  }
  return coupon.applicableCategories.includes(product.category);
}

export async function validateCouponForStore(
  storeId: string,
  code: string,
  options?: { subtotal?: number; buyerProfileId?: string; items?: Array<{ product: InstanceType<typeof Product>; lineTotal: number }> },
) {
  const coupon = await Coupon.findOne({ storeId, code: code.toUpperCase() });
  if (!coupon || !coupon.isActive) throw ApiError.badRequest("Invalid coupon");
  const now = new Date();
  if (coupon.startDate && coupon.startDate > now) throw ApiError.badRequest("Coupon is not active yet");
  if (coupon.expiryDate && coupon.expiryDate < now) throw ApiError.badRequest("Coupon has expired");
  if (coupon.maxUsageCount != null && coupon.currentUsageCount >= coupon.maxUsageCount) {
    throw ApiError.badRequest("Coupon usage limit reached");
  }
  if (options?.buyerProfileId) {
    const used = coupon.usedBy.filter((u) => String(u.buyerProfileId) === options.buyerProfileId).length;
    if (used >= coupon.maxUsagePerBuyer) throw ApiError.badRequest("You have already used this coupon");
  }
  const eligibleSubtotal = options?.items
    ? options.items.reduce((sum, i) => (couponApplies(coupon, i.product) ? sum + i.lineTotal : sum), 0)
    : options?.subtotal ?? 0;
  if (coupon.minimumOrderAmount && (options?.subtotal ?? 0) < coupon.minimumOrderAmount) {
    throw ApiError.badRequest(`Minimum order amount is ${coupon.minimumOrderAmount}`);
  }
  let discount = 0;
  if (coupon.type === "percentage") discount = (eligibleSubtotal * coupon.value) / 100;
  else discount = Math.min(coupon.value, eligibleSubtotal);
  discount = Math.round(discount * 100) / 100;
  return { coupon, discount };
}

export async function markCouponUsed(
  coupon: InstanceType<typeof Coupon>,
  buyerProfileId: string,
  orderId: string,
) {
  coupon.currentUsageCount += 1;
  coupon.usedBy.push({
    buyerProfileId: buyerProfileId as unknown as typeof coupon.usedBy[0]["buyerProfileId"],
    orderId: orderId as unknown as typeof coupon.usedBy[0]["orderId"],
    usedAt: new Date(),
  });
  await coupon.save();
}

export async function deactivateExpiredCoupons(): Promise<number> {
  const res = await Coupon.updateMany(
    { isActive: true, expiryDate: { $lt: new Date() } },
    { isActive: false },
  );
  return res.modifiedCount;
}
