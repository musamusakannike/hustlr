import { SUBSCRIPTION_GRACE_DAYS } from "../config/constants.config";
import { env } from "../config/env.config";
import { SubscriptionPlan } from "../models/subscription-plan.model";
import { Subscription } from "../models/subscription.model";
import { Store } from "../models/store.model";
import { User } from "../models/user.model";
import { SellerReferral } from "../models/seller-referral.model";
import { PlatformTransaction } from "../models/platform-transaction.model";
import { ApiError } from "../utils/api-error.util";
import { assertKycApproved, getActiveSubscription, refreshStoreLiveStatus } from "./store-helper.service";
import { initializeTransaction, verifyTransaction } from "./paystack.service";
import { createNotification } from "./notification.service";
import { creditWallet } from "./wallet.service";
import { getSettings } from "./settings.service";

function addCycle(from: Date, cycle: "monthly" | "yearly"): Date {
  const next = new Date(from);
  if (cycle === "yearly") next.setFullYear(next.getFullYear() + 1);
  else next.setMonth(next.getMonth() + 1);
  return next;
}

async function activatePaidSubscription(params: {
  sellerId: string;
  plan: InstanceType<typeof SubscriptionPlan>;
  billingCycle: "monthly" | "yearly";
  amount: number;
  reference: string;
}) {
  const start = new Date();
  const end = addCycle(start, params.billingCycle);
  await Subscription.updateMany(
    { sellerId: params.sellerId, status: { $in: ["active", "grace_period", "pending"] } },
    { status: "cancelled", cancelledAt: new Date() },
  );
  const sub = await Subscription.create({
    sellerId: params.sellerId,
    planId: params.plan._id,
    planName: params.plan.name,
    billingCycle: params.billingCycle,
    amount: params.amount,
    status: "active",
    startDate: start,
    endDate: end,
    autoRenew: true,
    paymentReference: params.reference,
    renewalReminderSent: false,
  });
  const store = await Store.findOne({ sellerId: params.sellerId });
  if (store) await refreshStoreLiveStatus(store);
  await PlatformTransaction.create({
    type: "subscription",
    amount: params.amount,
    currency: "NGN",
    gateway: "paystack",
    reference: params.reference,
    status: "success",
    sellerId: params.sellerId,
    storeId: store?._id,
  });
  const seller = await User.findById(params.sellerId);
  if (seller) {
    await createNotification({
      recipientId: seller._id,
      recipientType: "seller",
      type: "subscription_activated",
      title: "Subscription activated",
      message: `Your ${params.plan.name} plan is now active.`,
      link: "/dashboard/billing",
      email: {
        to: seller.email,
        templateName: "subscriptionActivated",
        data: { name: seller.name, planName: params.plan.name },
      },
    });
  }
  await qualifySellerReferral(params.sellerId);
  return sub;
}

async function qualifySellerReferral(sellerId: string) {
  const referral = await SellerReferral.findOne({ refereeId: sellerId, status: "pending" });
  if (!referral) return;
  const settings = await getSettings();
  if (!settings.sellerReferralEnabled) return;
  referral.status = "qualified";
  referral.qualifiedAt = new Date();
  referral.rewardAmount = settings.defaultSellerReferralRewardAmount;
  await creditWallet(
    String(referral.referrerId),
    referral.rewardAmount,
    "referral_bonus",
    "Seller referral bonus",
  );
  referral.status = "rewarded";
  referral.rewardedAt = new Date();
  await referral.save();
}

export async function listPublicPlans() {
  return SubscriptionPlan.find({ isActive: true }).sort({ monthlyPrice: 1 });
}

export async function subscribeFree(sellerId: string) {
  await assertKycApproved(sellerId);
  const plan = await SubscriptionPlan.findOne({ name: "free", isActive: true });
  if (!plan) throw ApiError.notFound("Free plan is not available");
  const existing = await getActiveSubscription(sellerId);
  if (existing && existing.planName !== "free") {
    throw ApiError.badRequest("Cancel or wait for your current paid plan to expire before switching to free");
  }
  if (existing?.planName === "free" && existing.status === "active") return existing;
  await Subscription.updateMany(
    { sellerId, status: { $in: ["active", "pending"] } },
    { status: "cancelled", cancelledAt: new Date() },
  );
  const sub = await Subscription.create({
    sellerId,
    planId: plan._id,
    planName: "free",
    billingCycle: "none",
    amount: 0,
    status: "active",
    startDate: new Date(),
    endDate: null,
    autoRenew: false,
  });
  const store = await Store.findOne({ sellerId });
  if (store) await refreshStoreLiveStatus(store);
  return sub;
}

export async function initializePaidSubscription(
  sellerId: string,
  email: string,
  planId: string,
  billingCycle: "monthly" | "yearly",
) {
  await assertKycApproved(sellerId);
  const plan = await SubscriptionPlan.findById(planId);
  if (!plan || !plan.isActive || plan.name === "free") {
    throw ApiError.badRequest("Invalid plan");
  }
  const amount = billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
  const reference = `SUB-${sellerId}-${Date.now()}`;
  const pay = await initializeTransaction({
    email,
    amount,
    reference,
    callbackUrl: `${env.frontendUrl}/dashboard/billing?reference=${reference}`,
    metadata: { sellerId, planId: String(plan._id), billingCycle, type: "subscription" },
  });
  return { ...pay, amount, plan };
}

export async function verifySubscriptionPayment(reference: string) {
  const result = await verifyTransaction(reference);
  if (!result.success) throw ApiError.badRequest("Payment was not successful");
  const metadata = (result.data.metadata ?? {}) as {
    sellerId?: string;
    planId?: string;
    billingCycle?: "monthly" | "yearly";
    type?: string;
  };
  if (!metadata.sellerId || !metadata.planId || !metadata.billingCycle) {
    throw ApiError.badRequest("Invalid payment metadata");
  }
  const existing = await Subscription.findOne({ paymentReference: reference, status: "active" });
  if (existing) return existing;
  const plan = await SubscriptionPlan.findById(metadata.planId);
  if (!plan) throw ApiError.notFound("Plan not found");
  const amount = metadata.billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
  return activatePaidSubscription({
    sellerId: metadata.sellerId,
    plan,
    billingCycle: metadata.billingCycle,
    amount,
    reference,
  });
}

export async function cancelSubscription(sellerId: string) {
  const sub = await getActiveSubscription(sellerId);
  if (!sub) throw ApiError.notFound("No active subscription");
  sub.autoRenew = false;
  sub.cancelledAt = new Date();
  await sub.save();
  return sub;
}

export async function changePlan(
  sellerId: string,
  email: string,
  planId: string,
  billingCycle: "monthly" | "yearly",
) {
  const current = await getActiveSubscription(sellerId);
  const nextPlan = await SubscriptionPlan.findById(planId);
  if (!nextPlan || !nextPlan.isActive) throw ApiError.notFound("Plan not found");
  if (!current) {
    if (nextPlan.name === "free") return subscribeFree(sellerId);
    return initializePaidSubscription(sellerId, email, planId, billingCycle);
  }
  const rank: Record<string, number> = { free: 0, pro: 1, "pro+": 2, "pro-plus": 2 };
  const upgrading = (rank[nextPlan.name] ?? 0) > (rank[current.planName] ?? 0);
  if (!upgrading) {
    current.pendingPlanId = nextPlan._id;
    current.pendingPlanName = nextPlan.name as "free" | "pro" | "pro+";
    current.autoRenew = false;
    await current.save();
    return { mode: "downgrade_scheduled", subscription: current };
  }
  if (nextPlan.name === "free") return subscribeFree(sellerId);
  const full = billingCycle === "yearly" ? nextPlan.yearlyPrice : nextPlan.monthlyPrice;
  let amount = full;
  if (current.endDate && current.amount > 0) {
    const remainingMs = Math.max(0, current.endDate.getTime() - Date.now());
    const totalMs =
      current.billingCycle === "yearly" ? 365 * 24 * 3600 * 1000 : 30 * 24 * 3600 * 1000;
    const credit = (remainingMs / totalMs) * current.amount;
    amount = Math.max(0, Math.round((full - credit) * 100) / 100);
  }
  if (amount <= 0) {
    return activatePaidSubscription({
      sellerId,
      plan: nextPlan,
      billingCycle,
      amount: 0,
      reference: `PRORATE-${sellerId}-${Date.now()}`,
    });
  }
  const reference = `SUBCHG-${sellerId}-${Date.now()}`;
  const pay = await initializeTransaction({
    email,
    amount,
    reference,
    callbackUrl: `${env.frontendUrl}/dashboard/billing?reference=${reference}`,
    metadata: { sellerId, planId: String(nextPlan._id), billingCycle, type: "subscription" },
  });
  return { mode: "upgrade", ...pay, amount };
}

export async function currentSubscription(sellerId: string) {
  return getActiveSubscription(sellerId);
}

export async function processSubscriptionExpiry(): Promise<number> {
  const now = new Date();
  const soon = new Date(now.getTime() + 3 * 24 * 3600 * 1000);
  const expiring = await Subscription.find({
    status: "active",
    planName: { $ne: "free" },
    endDate: { $lte: soon, $gt: now },
    renewalReminderSent: false,
  });
  for (const sub of expiring) {
    const seller = await User.findById(sub.sellerId);
    if (seller) {
      await createNotification({
        recipientId: seller._id,
        recipientType: "seller",
        type: "subscription_expiring",
        title: "Subscription expiring",
        message: `Your ${sub.planName} plan expires soon.`,
        link: "/dashboard/billing",
        email: {
          to: seller.email,
          templateName: "subscriptionExpiring",
          data: {
            name: seller.name,
            planName: sub.planName,
            endDate: sub.endDate ? sub.endDate.toDateString() : "",
          },
        },
      });
    }
    sub.renewalReminderSent = true;
    await sub.save();
  }

  const expired = await Subscription.find({
    status: { $in: ["active", "grace_period"] },
    planName: { $ne: "free" },
    endDate: { $lte: now },
  });
  let n = 0;
  for (const sub of expired) {
    const graceEnd =
      sub.gracePeriodEnd ??
      new Date((sub.endDate ?? now).getTime() + SUBSCRIPTION_GRACE_DAYS * 24 * 3600 * 1000);
    if (now <= graceEnd) {
      if (sub.status !== "grace_period") {
        sub.status = "grace_period";
        sub.gracePeriodEnd = graceEnd;
        await sub.save();
      }
      continue;
    }
    sub.status = "expired";
    await sub.save();
    const store = await Store.findOne({ sellerId: sub.sellerId });
    if (store) {
      if (sub.pendingPlanName === "free" || sub.pendingPlanId) {
        // apply scheduled downgrade if present
      }
      store.isLive = false;
      if (store.customDomain && sub.planName === "pro+") {
        store.customDomain = null;
        store.customDomainVerified = false;
      }
      await store.save();
      await refreshStoreLiveStatus(store);
    }
    const seller = await User.findById(sub.sellerId);
    if (seller) {
      await createNotification({
        recipientId: seller._id,
        recipientType: "seller",
        type: "subscription_expired",
        title: "Subscription expired",
        message: "Your store is currently unavailable.",
        link: "/dashboard/billing",
        email: { to: seller.email, templateName: "subscriptionExpired", data: { name: seller.name } },
      });
    }
    n += 1;
  }
  return n;
}
