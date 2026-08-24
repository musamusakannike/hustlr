"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import Button from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/Card";
import { PRICING_PLANS, APP_NAME } from "@/constants/app.constants";
import { formatNaira, cn } from "@/lib/utils";
import { usePlans } from "@/hooks/useSubscription";

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const { data: livePlans } = usePlans();
  const plans =
    livePlans && livePlans.length > 0
      ? livePlans.map((p) => ({
          name: p.name === "pro+" ? "Pro+" : p.name.charAt(0).toUpperCase() + p.name.slice(1),
          slug: p.slug,
          monthlyPrice: p.monthlyPrice,
          yearlyPrice: p.yearlyPrice,
          commissionPercent: `${p.commissionPercent}%`,
          description:
            PRICING_PLANS.find((c) => c.slug === p.slug)?.description ?? p.features[0] ?? "",
          isPopular: p.name === "pro",
          features: p.features,
        }))
      : PRICING_PLANS;

  return (
    <div className="flex-1 flex flex-col font-space-grotesk">
      {/* Header band */}
      <section className="bg-bg-soft py-14 md:py-20 px-6 sm:px-12 lg:px-16 xl:px-20 border-b border-black/5">
        <div className="max-w-7xl mx-auto flex flex-col gap-8 items-center">
          <SectionHeading
            eyebrow="Subscription Plans"
            title="Simple, Transparent Pricing for Every Merchant"
            description={`Start free on ${APP_NAME}, upgrade as your business grows. No hidden transaction fees.`}
          />

          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-xs border border-border">
              <button
                onClick={() => setIsYearly(false)}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer",
                  !isYearly
                    ? "bg-primary text-white shadow-xs"
                    : "text-muted hover:text-black"
                )}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5",
                  isYearly
                    ? "bg-primary text-white shadow-xs"
                    : "text-muted hover:text-black"
                )}
              >
                <span>Yearly Billing</span>
                <span className="bg-primary-light text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                  SAVE 17%
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Plans content */}
      <section className="flex-1 bg-white py-12 md:py-16 px-6 sm:px-12 lg:px-16 xl:px-20">
        <div className="max-w-7xl mx-auto flex flex-col gap-10 lg:gap-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {plans.map((plan) => {
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            return (
              <div
                key={plan.slug}
                className={cn(
                  "rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 relative",
                  plan.isPopular
                    ? "bg-dark text-white shadow-2xl border-2 border-primary"
                    : "bg-white text-text shadow-xs border border-border"
                )}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-md">
                    Most Popular
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-bold tracking-tight mb-2">
                    {plan.name}
                  </h3>
                  <p
                    className={cn(
                      "text-sm mb-6",
                      plan.isPopular ? "text-subtle" : "text-muted"
                    )}
                  >
                    {plan.description}
                  </p>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl sm:text-5xl font-bold font-archivo tracking-tight">
                      {price === 0 ? "₦0" : formatNaira(price)}
                    </span>
                    <span className="text-sm text-muted">
                      /{isYearly ? "year" : "month"}
                    </span>
                  </div>
                  <div className="inline-block text-xs font-bold text-primary bg-primary-light px-3 py-1 rounded-md mb-8">
                    {plan.commissionPercent} Platform Commission
                  </div>
                  <ul className="flex flex-col gap-3 mb-8">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-3 text-sm">
                        <span
                          className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold",
                            plan.isPopular
                              ? "bg-primary text-white"
                              : "bg-primary-light text-primary"
                          )}
                        >
                          <Check className="w-3 h-3" />
                        </span>
                        <span
                          className={
                            plan.isPopular ? "text-neutral-200" : "text-text/80"
                          }
                        >
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href="/auth/register">
                  <Button
                    fullWidth
                    variant={plan.isPopular ? "primary" : "dark"}
                    className="!py-3.5"
                  >
                    Get Started with {plan.name}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm text-muted max-w-2xl mx-auto leading-relaxed">
          All plans include Paystack escrow payments, a free {APP_NAME} subdomain,
          and secure payouts to any Nigerian bank account. Buyer payments are
          held in escrow until delivery is confirmed — on every plan.
        </p>
        </div>
      </section>
    </div>
  );
}
