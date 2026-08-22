"use client";

import React, { useState } from "react";
import StartStoreModal from "./StartStoreModal";
import { PRICING_PLANS } from "@/constants/app.constants";

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section
        id="pricing"
        className="py-16 md:py-24 px-6 sm:px-12 lg:px-16 xl:px-20 bg-bg-soft font-space-grotesk"
      >
        <div className="max-w-7xl mx-auto flex flex-col gap-12 lg:gap-14">
          {/* Section Header */}
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <span className="inline-block text-xs font-bold text-primary uppercase tracking-widest bg-primary-light px-3.5 py-1 rounded-md mb-3">
              Subscription Plans
            </span>
            <h2 className="text-[#0A0E11] text-3xl sm:text-4xl lg:text-[42px] font-bold leading-[1.2] tracking-tight">
              Simple, Transparent Pricing for Every Merchant
            </h2>
            <p className="text-[#666666] text-base sm:text-lg leading-relaxed mt-3">
              Start free, upgrade as your business grows. No hidden transaction
              fees.
            </p>

            {/* Monthly / Yearly Billing Toggle */}
            <div className="flex items-center gap-3 mt-8 bg-white p-1.5 rounded-2xl shadow-xs border border-neutral-200">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  !isYearly
                    ? "bg-primary text-white shadow-xs"
                    : "text-neutral-600 hover:text-black"
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isYearly
                    ? "bg-primary text-white shadow-xs"
                    : "text-neutral-600 hover:text-black"
                }`}
              >
                <span>Yearly Billing</span>
                <span className="bg-primary-light text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                  SAVE 17%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {PRICING_PLANS.map((plan) => {
              const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
              const formattedPrice =
                price === 0 ? "₦0" : `₦${price.toLocaleString("en-NG")}`;

              return (
                <div
                  key={plan.slug}
                  className={`rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 relative ${
                    plan.isPopular
                      ? "bg-[#0A0E11] text-white shadow-2xl border-2 border-primary scale-102"
                      : "bg-white text-[#0A0E11] shadow-xs border border-neutral-200"
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-md">
                      Most Popular
                    </div>
                  )}

                  <div>
                    {/* Plan Name & Tagline */}
                    <h3 className="text-2xl font-bold tracking-tight mb-2">
                      {plan.name}
                    </h3>
                    <p
                      className={`text-sm mb-6 ${
                        plan.isPopular ? "text-[#AAAAAA]" : "text-[#666666]"
                      }`}
                    >
                      {plan.description}
                    </p>

                    {/* Price Header */}
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-4xl sm:text-5xl font-bold font-archivo tracking-tight">
                        {formattedPrice}
                      </span>
                      <span
                        className={`text-sm ${
                          plan.isPopular
                            ? "text-neutral-400"
                            : "text-neutral-500"
                        }`}
                      >
                        /{isYearly ? "year" : "month"}
                      </span>
                    </div>

                    <div className="inline-block text-xs font-bold text-primary bg-primary-light px-3 py-1 rounded-md mb-8">
                      {plan.commissionPercent} Platform Commission
                    </div>

                    {/* Feature List */}
                    <ul className="flex flex-col gap-3 mb-8">
                      {plan.features.map((feat, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-3 text-sm"
                        >
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                              plan.isPopular
                                ? "bg-primary text-white"
                                : "bg-primary-light text-primary"
                            }`}
                          >
                            ✓
                          </span>
                          <span
                            className={
                              plan.isPopular
                                ? "text-neutral-200"
                                : "text-[#333333]"
                            }
                          >
                            {feat}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => setIsModalOpen(true)}
                    className={`w-full py-3.5 rounded-xl font-semibold text-base transition-all duration-200 cursor-pointer shadow-sm ${
                      plan.isPopular
                        ? "bg-primary hover:bg-[#660817] text-white"
                        : "bg-[#0A0E11] hover:bg-neutral-800 text-white"
                    }`}
                  >
                    Get Started with {plan.name}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <StartStoreModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
