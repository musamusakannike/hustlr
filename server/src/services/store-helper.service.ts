import mongoose from "mongoose";
import { PLAN_NAMES } from "../config/constants.config";
import { Store, type IStore } from "../models/store.model";
import { Subscription } from "../models/subscription.model";
import { SubscriptionPlan } from "../models/subscription-plan.model";
import { Kyc } from "../models/kyc.model";
import { ApiError } from "../utils/api-error.util";

export async function getSellerStore(sellerId: string | mongoose.Types.ObjectId): Promise<IStore> {
  const store = await Store.findOne({ sellerId });
  if (!store) throw ApiError.notFound("Store has not been set up yet");
  return store;
}

export async function getOrCreateSellerStore(
  sellerId: string | mongoose.Types.ObjectId,
  email: string,
  name: string,
): Promise<IStore> {
  const existing = await Store.findOne({ sellerId });
  if (existing) return existing;
  throw ApiError.notFound("Store has not been set up yet");
}

export async function getActiveSubscription(sellerId: string | mongoose.Types.ObjectId) {
  return Subscription.findOne({
    sellerId,
    status: { $in: ["active", "grace_period"] },
  }).sort({ createdAt: -1 });
}

export async function getSellerPlan(sellerId: string | mongoose.Types.ObjectId) {
  const sub = await getActiveSubscription(sellerId);
  if (!sub) {
    return SubscriptionPlan.findOne({ name: PLAN_NAMES.FREE, isActive: true });
  }
  return SubscriptionPlan.findById(sub.planId);
}

export async function assertKycApproved(sellerId: string): Promise<void> {
  const kyc = await Kyc.findOne({ sellerId, status: "approved" });
  if (!kyc) throw ApiError.forbidden("KYC must be approved before this action");
}

export async function refreshStoreLiveStatus(store: IStore): Promise<IStore> {
  if (store.liveOverride === true) {
    store.isLive = true;
    await store.save();
    return store;
  }
  if (store.liveOverride === false) {
    store.isLive = false;
    await store.save();
    return store;
  }
  const [kyc, sub] = await Promise.all([
    Kyc.findOne({ sellerId: store.sellerId, status: "approved" }),
    getActiveSubscription(store.sellerId),
  ]);
  store.isLive = Boolean(kyc && sub);
  await store.save();
  return store;
}

export function planAllowsTemplate(
  planName: string,
  templateTier: "free" | "pro" | "pro+",
): boolean {
  if (templateTier === "free") return true;
  if (templateTier === "pro") return planName === "pro" || planName === "pro+";
  return planName === "pro+";
}

export function planAllowsBlog(planName: string): boolean {
  return planName === "pro" || planName === "pro+";
}

export function planAllowsCustomDomain(planName: string): boolean {
  return planName === "pro+";
}
