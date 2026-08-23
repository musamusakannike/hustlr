"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Check,
  CreditCard,
  ExternalLink,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useKyc } from "@/hooks";
import {
  usePlans,
  useCurrentSubscription,
  useSubscribeFree,
  useInitializeSubscription,
  useVerifySubscription,
  useCancelSubscription,
  useChangePlan,
} from "@/hooks/useSubscription";
import { useStore } from "@/hooks/useStore";
import { formatNaira, formatDate, getErrorMessage, cn } from "@/lib/utils";
import type { SubscriptionPlan, PlanName } from "@/types/subscription";
import { APP_DOMAIN } from "@/constants/app.constants";

const TIER_RANK: Record<PlanName, number> = { free: 0, pro: 1, "pro+": 2 };

export default function BillingPage() {
  const { toast } = useToast();
  const { data: kyc } = useKyc();
  const { data: store } = useStore();
  const { data: plans, isLoading: plansLoading } = usePlans();
  const { data: subscription } = useCurrentSubscription();

  const subscribeFree = useSubscribeFree();
  const initialize = useInitializeSubscription();
  const verify = useVerifySubscription();
  const cancelSub = useCancelSubscription();
  const changePlan = useChangePlan();

  const [isYearly, setIsYearly] = useState(false);
  const [payingPlan, setPayingPlan] = useState<SubscriptionPlan | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [justWentLive, setJustWentLive] = useState(false);

  const kycApproved = kyc?.status === "approved";
  const currentPlanName = subscription?.planName ?? null;

  const handleSubscribeFree = () => {
    subscribeFree.mutate(undefined, {
      onSuccess: () => {
        setJustWentLive(true);
        toast("You're live! Your free store is now accepting orders.", "success");
      },
      onError: (err) => toast(getErrorMessage(err), "error"),
    });
  };

  const openCheckout = (plan: SubscriptionPlan) => setPayingPlan(plan);

  const handlePay = () => {
    if (!payingPlan) return;
    const input = {
      planId: payingPlan.id,
      billingCycle: (isYearly ? "yearly" : "monthly") as "yearly" | "monthly",
    };
    const isUpgrade =
      currentPlanName !== null &&
      TIER_RANK[payingPlan.name] > TIER_RANK[currentPlanName] &&
      currentPlanName !== "free";

    const init = isUpgrade ? changePlan : initialize;
    init.mutate(input, {
      onSuccess: async ({ reference, authorizationUrl }) => {
        if (authorizationUrl) {
          window.location.href = authorizationUrl;
          return;
        }
        // Mock transport: simulate the hosted Paystack round-trip.
        try {
          await verify.mutateAsync(reference);
          setPayingPlan(null);
          setJustWentLive(true);
          toast(
            `Payment successful — ${payingPlan.name.toUpperCase()} activated. You're live!`,
            "success"
          );
        } catch (err) {
          toast(getErrorMessage(err), "error");
        }
      },
      onError: (err) => toast(getErrorMessage(err), "error"),
    });
  };

  const handleCancel = () => {
    cancelSub.mutate(undefined, {
      onSuccess: () => {
        setCancelOpen(false);
        toast(
          "Auto-renew cancelled. Your plan stays active until the end of the period.",
          "info"
        );
      },
      onError: (err) => toast(getErrorMessage(err), "error"),
    });
  };

  if (plansLoading) {
    return <Spinner size="lg" label="Loading plans…" />;
  }

  const isBusy =
    subscribeFree.isPending || initialize.isPending || verify.isPending || changePlan.isPending;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Billing & Plan</h2>
        <p className="text-sm text-muted mt-1">
          A subscription is required to take your storefront live. Pay securely
          via Paystack.
        </p>
      </div>

      {/* Go-live celebration */}
      {justWentLive && store?.isLive && (
        <div className="rounded-3xl bg-dark text-white p-6 sm:p-8 border border-primary/40 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">Your store is LIVE 🎉</h3>
            <p className="text-sm text-neutral-300 mt-0.5">
              Buyers can now shop at{" "}
              <span className="font-mono text-white font-semibold">
                {store.slug}.{APP_DOMAIN}
              </span>{" "}
              with escrow-protected payments.
            </p>
          </div>
          <Link href={`/store/${store.slug}`} target="_blank">
            <Button variant="primary">
              <ExternalLink className="w-4 h-4" />
              View Store
            </Button>
          </Link>
        </div>
      )}

      {/* Current subscription */}
      <Card>
        <CardHeader
          title="Current Subscription"
          description={
            subscription
              ? "Manage your plan, billing cycle and renewal."
              : "No subscription yet — choose a plan below to go live."
          }
          action={
            subscription && (
              <Badge
                variant={
                  subscription.status === "active"
                    ? "success"
                    : subscription.status === "grace_period"
                      ? "warning"
                      : "danger"
                }
              >
                {subscription.status.replace("_", " ")}
              </Badge>
            )
          }
        />
        {subscription ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted uppercase tracking-wider font-semibold mb-0.5">Plan</p>
              <p className="font-bold text-lg uppercase">{subscription.planName}</p>
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wider font-semibold mb-0.5">Amount</p>
              <p className="font-bold text-lg">
                {subscription.amount === 0 ? "Free" : formatNaira(subscription.amount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wider font-semibold mb-0.5">
                {subscription.autoRenew ? "Renews" : "Ends"}
              </p>
              <p className="font-bold text-lg">
                {subscription.endDate ? formatDate(subscription.endDate) : "—"}
              </p>
            </div>
            <div className="flex items-end">
              {subscription.status === "active" &&
                subscription.planName !== "free" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCancelOpen(true)}
                  >
                    {subscription.autoRenew ? "Cancel Renewal" : "Renewal Cancelled"}
                  </Button>
                )}
            </div>
            {subscription.status === "grace_period" && subscription.gracePeriodEnd && (
              <p className="col-span-2 sm:col-span-4 text-xs text-warning font-semibold bg-warning-light/50 rounded-xl px-4 py-3">
                Payment failed — your store stays live during the grace period
                until {formatDate(subscription.gracePeriodEnd)}. Update your
                payment method to avoid going offline.
              </p>
            )}
            {subscription.cancelledAt && (
              <p className="col-span-2 sm:col-span-4 text-xs text-muted">
                Auto-renew is off. Your plan benefits continue until{" "}
                {subscription.endDate
                  ? formatDate(subscription.endDate)
                  : "the end of the period"}
                .
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted">
            {kycApproved
              ? "Great — your KYC is approved. Pick a plan below to launch."
              : "Complete KYC verification first, then pick a plan to launch."}
          </p>
        )}
      </Card>

      {/* KYC gate */}
      {!kycApproved && (
        <div className="rounded-3xl border border-warning/30 bg-warning-light/40 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <ShieldCheck className="w-8 h-8 text-warning shrink-0" />
          <div className="flex-1">
            <p className="font-bold">KYC verification required</p>
            <p className="text-sm text-text/70 mt-0.5">
              Sellers must verify their identity before subscribing and going
              live. It only takes a few minutes.
            </p>
          </div>
          <Link href="/dashboard/kyc">
            <Button size="sm">Complete KYC</Button>
          </Link>
        </div>
      )}

      {/* Billing cycle toggle */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-xs border border-border">
          <button
            onClick={() => setIsYearly(false)}
            className={cn(
              "px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer",
              !isYearly ? "bg-primary text-white shadow-xs" : "text-muted hover:text-black"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={cn(
              "px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5",
              isYearly ? "bg-primary text-white shadow-xs" : "text-muted hover:text-black"
            )}
          >
            <span>Yearly</span>
            <span className="bg-primary-light text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
              SAVE 17%
            </span>
          </button>
        </div>
      </div>

      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {(plans ?? []).map((plan) => {
          const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
          const isCurrent = currentPlanName === plan.name;
          const isFree = plan.name === "free";
          return (
            <div
              key={plan.id}
              className={cn(
                "rounded-3xl p-7 flex flex-col justify-between relative transition-all",
                isCurrent
                  ? "bg-dark text-white shadow-2xl border-2 border-primary"
                  : plan.name === "pro"
                    ? "bg-white text-text shadow-xs border border-border"
                    : "bg-white text-text shadow-xs border border-border"
              )}
            >
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-md">
                  Current Plan
                </div>
              )}
              <div>
                <h3 className="text-2xl font-bold uppercase tracking-tight">
                  {plan.name}
                </h3>
                <p className="text-xs text-muted mt-1">
                  {plan.commissionPercent}% commission per order
                </p>
                <div className="flex items-baseline gap-1 my-5">
                  <span className="text-4xl font-bold font-archivo tracking-tight">
                    {price === 0 ? "₦0" : formatNaira(price)}
                  </span>
                  <span className="text-sm text-muted">
                    /{isFree ? "forever" : isYearly ? "year" : "month"}
                  </span>
                </div>
                <ul className="flex flex-col gap-2.5 mb-7">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm">
                      <span
                        className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold mt-0.5",
                          isCurrent
                            ? "bg-primary text-white"
                            : "bg-primary-light text-primary"
                        )}
                      >
                        ✓
                      </span>
                      <span className={isCurrent ? "text-neutral-200" : "text-text/80"}>
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {isCurrent ? (
                <Button variant="outline" fullWidth disabled>
                  <Check className="w-4 h-4" />
                  Active
                </Button>
              ) : isFree ? (
                <Button
                  variant="dark"
                  fullWidth
                  disabled={!kycApproved || isBusy}
                  loading={subscribeFree.isPending}
                  onClick={handleSubscribeFree}
                >
                  Start Free & Go Live
                </Button>
              ) : (
                <Button
                  variant={plan.name === "pro" ? "primary" : "dark"}
                  fullWidth
                  disabled={!kycApproved || isBusy}
                  onClick={() => openCheckout(plan)}
                >
                  <CreditCard className="w-4 h-4" />
                  {currentPlanName && currentPlanName !== "free"
                    ? TIER_RANK[plan.name] > TIER_RANK[currentPlanName as PlanName]
                      ? `Upgrade to ${plan.name.toUpperCase()}`
                      : `Switch to ${plan.name.toUpperCase()}`
                    : `Choose ${plan.name.toUpperCase()}`}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Mock Paystack checkout simulation */}
      <Modal
        isOpen={payingPlan !== null}
        onClose={() => setPayingPlan(null)}
        title="Paystack Secure Checkout"
        description="Payments are protected with 3D Secure."
        size="sm"
      >
        {payingPlan && (
          <div className="flex flex-col gap-5">
            <div className="rounded-2xl bg-bg-soft p-5 text-sm flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-muted">Plan</span>
                <span className="font-bold uppercase">{payingPlan.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Billing</span>
                <span className="font-semibold">{isYearly ? "Yearly" : "Monthly"}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-2">
                <span className="text-muted">Total due today</span>
                <span className="font-bold text-lg font-archivo">
                  {formatNaira(
                    isYearly ? payingPlan.yearlyPrice : payingPlan.monthlyPrice
                  )}
                </span>
              </div>
            </div>
            <Button fullWidth size="lg" onClick={handlePay} loading={isBusy}>
              {verify.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Confirming payment…
                </>
              ) : (
                "Pay Now"
              )}
            </Button>
            <p className="text-[11px] text-center text-muted">
              Funds for your store subscription are charged directly — buyer
              order payments are held in escrow until delivery is confirmed.
            </p>
          </div>
        )}
      </Modal>

      {/* Cancel confirmation */}
      <Modal
        isOpen={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Cancel auto-renewal?"
        size="sm"
      >
        <p className="text-sm text-muted leading-relaxed mb-6">
          Your plan stays active until the end of the current billing period,
          then your store moves to the free plan. You can re-subscribe
          anytime.
        </p>
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={() => setCancelOpen(false)}>
            Keep Plan
          </Button>
          <Button variant="danger" onClick={handleCancel} loading={cancelSub.isPending}>
            Cancel Renewal
          </Button>
        </div>
      </Modal>
    </div>
  );
}
