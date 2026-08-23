"use client";

import React from "react";
import { CreditCard, Check, Plus } from "lucide-react";

export default function PlansPage() {
  const plans = [
    {
      name: "Free",
      slug: "free",
      priceMonthly: "₦0",
      commission: "10%",
      subdomains: "1 Storefront Subdomain",
      features: [
        "Up to 25 Products Listing",
        "Access to Free Store Templates",
        "Paystack Escrow Protection",
        "Standard Email Support",
      ],
    },
    {
      name: "Pro",
      slug: "pro",
      priceMonthly: "₦15,000 / mo",
      commission: "7%",
      subdomains: "Custom Subdomain",
      features: [
        "Unlimited Product Listings",
        "Access to All Pro Templates",
        "Discount Coupons & Promotions",
        "Custom Storefront Colors",
        "Priority Support",
      ],
      isPopular: true,
    },
    {
      name: "Pro+",
      slug: "pro-plus",
      priceMonthly: "₦35,000 / mo",
      commission: "5%",
      subdomains: "Custom Domain Mapping (yourname.com)",
      features: [
        "Everything in Pro",
        "Zero Escrow Hold Delay Options",
        "Lowest Platform Commission (5%)",
        "Dedicated Account Manager",
      ],
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0A0E11] tracking-tight">
            Subscription Plans & Pricing Tiers
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Configure merchant subscription tiers, commission rates, and feature
            limits.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.slug}
            className={`bg-white rounded-3xl p-6 border shadow-xs flex flex-col justify-between ${
              plan.isPopular
                ? "border-primary ring-2 ring-primary/10"
                : "border-gray-200/70"
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">
                  {plan.name}
                </h3>
                {plan.isPopular && (
                  <span className="px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary-bg text-primary">
                    Popular
                  </span>
                )}
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-[#0A0E11]">
                  {plan.priceMonthly}
                </span>
              </div>
              <p className="mt-2 text-xs font-semibold text-primary">
                Platform commission: {plan.commission}
              </p>

              <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                {plan.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 text-xs text-gray-600 font-medium"
                  >
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4">
              <button className="w-full py-2.5 rounded-full bg-gray-100 hover:bg-primary hover:text-white text-slate-800 text-xs font-bold transition-all">
                Edit Plan Config
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
