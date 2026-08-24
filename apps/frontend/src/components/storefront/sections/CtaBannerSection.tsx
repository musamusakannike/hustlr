"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import type { CtaBannerSectionData, StorefrontInfo } from "@/types/storefront";
import { storeHref } from "@/lib/store-path";

interface CtaBannerSectionProps {
  data: CtaBannerSectionData;
  info: StorefrontInfo;
}

export default function CtaBannerSection({ data, info }: CtaBannerSectionProps) {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div
        className="rounded-3xl sm:rounded-[36px] p-8 sm:p-14 lg:p-18 text-white relative overflow-hidden shadow-2xl flex flex-col items-center text-center"
        style={{
          backgroundColor: "var(--store-primary, #E05315)",
        }}
      >
        {/* Subtle decorative background circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-black/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl flex flex-col items-center gap-5">
          {data.badge && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30">
              <Sparkles className="w-3.5 h-3.5" />
              {data.badge}
            </span>
          )}

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight font-space-grotesk">
            {data.heading}
          </h2>

          {data.subheading && (
            <p className="text-base sm:text-lg text-white/90 leading-relaxed max-w-2xl font-normal">
              {data.subheading}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {data.buttonText && (
              <Link
                href={storeHref(info.slug, data.buttonLink || "/products")}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm sm:text-base bg-white shadow-lg transition-all hover:bg-neutral-100 hover:scale-[1.02] active:scale-[0.98]"
                style={{ color: "var(--store-primary, #E05315)" }}
              >
                {data.buttonText}
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            {data.secondaryButtonText && (
              <Link
                href={storeHref(info.slug, data.secondaryButtonLink || "/products")}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm sm:text-base text-white bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/40 transition-all"
              >
                {data.secondaryButtonText}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
