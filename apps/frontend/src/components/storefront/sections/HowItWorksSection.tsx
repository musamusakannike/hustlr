"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import type { HowItWorksSectionData, StorefrontInfo } from "@/types/storefront";
import { storeHref } from "@/lib/store-path";

interface HowItWorksSectionProps {
  data: HowItWorksSectionData;
  info: StorefrontInfo;
}

export default function HowItWorksSection({ data, info }: HowItWorksSectionProps) {
  const steps = data.steps || [];

  return (
    <section
      id="how-it-works"
      className="py-16 sm:py-20 lg:py-24 border-y transition-colors"
      style={{
        backgroundColor: "color-mix(in srgb, var(--store-bg, #FFFFFF) 96%, var(--store-text, #0A0E11) 2%)",
        borderColor: "color-mix(in srgb, var(--store-text, #0A0E11) 8%, transparent)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Heading & CTA */}
          <div className="lg:col-span-5 flex flex-col items-start gap-6 lg:sticky lg:top-28">
            {data.badge && (
              <span
                className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                style={{
                  backgroundColor: "var(--store-accent, #FFEDE6)",
                  color: "var(--store-primary, #E05315)",
                }}
              >
                {data.badge}
              </span>
            )}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--store-text,#0A0E11)] leading-tight">
              {data.heading}
            </h2>
            {data.subheading && (
              <p className="text-base text-[var(--store-text,#0A0E11)] opacity-75 leading-relaxed">
                {data.subheading}
              </p>
            )}
            {data.ctaText && (
              <Link
                href={storeHref(info.slug, data.ctaLink || "/products")}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm text-white shadow-md transition-all hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] mt-2"
                style={{ backgroundColor: "var(--store-primary, #E05315)" }}
              >
                {data.ctaText}
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* Right Column: 3 Numbered Step Cards */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {steps.map((step) => (
              <div
                key={step.id || step.stepNumber}
                className="rounded-3xl p-6 sm:p-8 bg-white border shadow-xs transition-all duration-300 hover:shadow-md"
                style={{
                  backgroundColor: "var(--store-bg, #FFFFFF)",
                  borderColor: "color-mix(in srgb, var(--store-text, #0A0E11) 10%, transparent)",
                }}
              >
                <div className="flex items-start gap-4 sm:gap-5">
                  {/* Step Number Circle Badge */}
                  <div
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-extrabold text-white text-base sm:text-lg shrink-0 shadow-xs"
                    style={{ backgroundColor: "var(--store-primary, #E05315)" }}
                  >
                    {step.stepNumber}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <h3 className="text-lg sm:text-xl font-bold text-[var(--store-text,#0A0E11)] mb-3">
                      {step.title}
                    </h3>
                    <ul className="flex flex-col gap-2">
                      {step.bullets.map((bullet, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2 text-xs sm:text-sm text-[var(--store-text,#0A0E11)] opacity-80 leading-relaxed">
                          <span
                            className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                            style={{
                              backgroundColor: "var(--store-accent, #FFEDE6)",
                              color: "var(--store-primary, #E05315)",
                            }}
                          >
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
