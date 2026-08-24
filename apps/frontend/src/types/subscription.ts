export type PlanName = "free" | "pro" | "pro+";
export type BillingCycle = "monthly" | "yearly" | "none";
export type SubscriptionStatus =
  | "active"
  | "expired"
  | "cancelled"
  | "grace_period"
  | "pending";

export interface SubscriptionPlan {
  id: string;
  name: PlanName;
  slug: "free" | "pro" | "pro-plus";
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  maxProducts: number | null;
  allowCustomDomain: boolean;
  allowProTemplates: boolean;
  allowProPlusTemplates: boolean;
  allowBlog: boolean;
  commissionPercent: number;
  isActive: boolean;
}

export interface Subscription {
  id: string;
  sellerId: string;
  planId: string;
  planName: PlanName;
  billingCycle: BillingCycle;
  amount: number;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string | null;
  autoRenew: boolean;
  paymentReference: string;
  gracePeriodEnd: string | null;
  cancelledAt: string | null;
}

export interface SubscribeInput {
  planId: string;
  billingCycle: "monthly" | "yearly";
}

/** Returned by subscriptions/initialize. Mock transport returns only a
 *  reference (no hosted checkout); ApiTransport also returns a Paystack
 *  authorizationUrl the UI redirects to. */
export interface InitializeSubscriptionResult {
  reference: string;
  authorizationUrl?: string;
}

export interface VerifySubscriptionResult {
  subscription: Subscription;
  storeIsLive: boolean;
}

/** Entitlements derived from the current plan, used for tier gating. */
export interface PlanEntitlements {
  maxProducts: number | null;
  allowCustomDomain: boolean;
  allowProTemplates: boolean;
  allowProPlusTemplates: boolean;
  allowBlog: boolean;
  commissionPercent: number;
}
