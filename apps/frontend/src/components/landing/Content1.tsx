"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Store, CreditCard, TrendingUp } from "lucide-react";

interface Feature {
  id: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    id: "storefront",
    icon: Store,
    iconBg: "bg-primary-light",
    iconColor: "text-primary",
    title: "Instant Storefront Setup",
    description:
      "Launch your customized digital storefront in minutes with zero code and start selling right away.",
  },
  {
    id: "payments",
    icon: CreditCard,
    iconBg: "bg-success-light",
    iconColor: "text-success",
    title: "Seamless Local Payments",
    description:
      "Accept instant payments via Card, Bank Transfer, and USSD with automated settlement to your bank.",
  },
  {
    id: "tracking",
    icon: TrendingUp,
    iconBg: "bg-info-light",
    iconColor: "text-info",
    title: "Live Order & Delivery Tracking",
    description:
      "Track every order from checkout to doorstep with real-time customer notifications and dispatch status.",
  },
];


export default function Content1() {
  const [activeFeature, setActiveFeature] = useState<string>(FEATURES[0].id);

  return (
    <section
      aria-label="Platform Highlights"
      className="w-full bg-bg py-16 sm:py-20 lg:py-24 font-space-grotesk overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 lg:mb-20">
          <p className="text-xs sm:text-sm font-bold tracking-widest uppercase text-primary mb-3">
            ALL-IN-ONE COMMERCE PLATFORM
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-dark leading-tight">
            Hustlr helps you manage and scale your store
          </h2>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Feature Highlights */}
          <div className="lg:col-span-5 flex flex-col gap-3 sm:gap-4">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              const isActive = activeFeature === feature.id;

              return (
                <div
                  key={feature.id}
                  onClick={() => setActiveFeature(feature.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveFeature(feature.id);
                    }
                  }}
                  className={`flex items-start gap-4 sm:gap-5 p-5 sm:p-6 rounded-2xl transition-all duration-300 text-left cursor-pointer select-none ${
                    isActive
                      ? "bg-bg shadow-[0_10px_30px_rgba(10,14,17,0.06)] border border-border"
                      : "border border-transparent hover:bg-bg-soft/70"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform ${feature.iconBg} ${feature.iconColor}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="flex flex-col">
                    <h3 className="text-lg sm:text-xl font-bold text-dark tracking-tight leading-snug">
                      {feature.title}
                    </h3>
                    <p className="mt-1.5 text-sm sm:text-base text-muted leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Phone-like Device Mockup */}
          <div className="lg:col-span-7 relative w-full flex justify-center items-center">
            {/* Device Outer Frame (Phone / Tablet border) */}
            <div className="relative w-full max-w-xl lg:max-w-none rounded-[28px] sm:rounded-[36px] lg:rounded-[44px] bg-dark p-2.5 sm:p-3.5 lg:p-4.5 shadow-2xl shadow-dark/20 border border-dark-secondary">
              {/* Front Camera / Sensor Pill */}
              <div
                className="absolute top-2 sm:top-2.5 right-8 sm:right-12 w-2.5 h-2.5 rounded-full bg-dark-secondary ring-1 ring-light/15 flex items-center justify-center pointer-events-none"
                aria-hidden="true"
              >
                <div className="w-1 h-1 rounded-full bg-neutral-status" />
              </div>

              {/* Screen Area */}
              <div className="relative w-full overflow-hidden rounded-[18px] sm:rounded-[24px] lg:rounded-[30px] bg-bg aspect-[1717/916]">
                <Image
                  src="/landing/hero-dashboard.webp"
                  alt="Hustlr seller dashboard preview"
                  width={1717}
                  height={916}
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 58vw, 750px"
                  className="w-full h-full object-cover select-none pointer-events-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}