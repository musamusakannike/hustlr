"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import type { HeroSectionData, StorefrontInfo } from "@/types/storefront";
import { storeHref } from "@/lib/store-path";

interface HeroSectionProps {
  data: HeroSectionData;
  info: StorefrontInfo;
}

export default function HeroSection({ data, info }: HeroSectionProps) {
  const bgImage = data.backgroundImage || info.banner || "/hero.png";
  const overlayOpacity = (data.overlayOpacity ?? 45) / 100;

  return (
    <section className="relative overflow-hidden bg-neutral-900 text-white min-h-[480px] sm:min-h-[560px] lg:min-h-[640px] flex items-center">
      {/* Background Image & Layered Gradients */}
      {bgImage && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 scale-105"
          style={{
            backgroundImage: `url(${bgImage})`,
          }}
        />
      )}

      {/* Dark & Brand Warm Overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: `rgba(15, 12, 10, ${overlayOpacity})`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/40" />

      {/* Content Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28 w-full">
        <div
          className={`max-w-2xl flex flex-col gap-6 ${
            data.align === "center" ? "mx-auto text-center items-center" : "items-start text-left"
          }`}
        >
          {/* Eyebrow Badge */}
          {data.badge && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-xs font-semibold tracking-wider text-white/95 uppercase">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "var(--store-primary, #E05315)" }} />
              {data.badge}
            </div>
          )}

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] drop-shadow-sm font-space-grotesk">
            {data.heading || info.name}
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg lg:text-xl text-white/85 leading-relaxed drop-shadow-xs max-w-xl font-normal">
            {data.subheading || info.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            {data.primaryCtaText && (
              <Link
                href={storeHref(info.slug, data.primaryCtaLink || "/products")}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm sm:text-base text-white shadow-lg transition-all duration-200 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: "var(--store-primary, #E05315)" }}
              >
                <ShoppingBag className="w-4 h-4" />
                {data.primaryCtaText}
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            {data.secondaryCtaText && (
              <Link
                href={storeHref(info.slug, data.secondaryCtaLink || "#how-it-works")}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-semibold text-sm sm:text-base text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 transition-all duration-200"
              >
                {data.secondaryCtaText}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
