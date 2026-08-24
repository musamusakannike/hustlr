"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, ShoppingBag, Sparkles, Tag, Users, Zap } from "lucide-react";
import type { FeaturesSectionData, StorefrontInfo } from "@/types/storefront";
import { storeHref } from "@/lib/store-path";

const ICON_MAP: Record<string, React.ElementType> = {
  ShoppingBag,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
  Tag,
  CheckCircle2,
};

interface FeaturesSectionProps {
  data: FeaturesSectionData;
  info: StorefrontInfo;
}

export default function FeaturesSection({ data, info }: FeaturesSectionProps) {
  const cards = data.cards || [];

  return (
    <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 flex flex-col items-center gap-3">
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
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[var(--store-text,#0A0E11)]">
          {data.heading}
        </h2>
        {data.subheading && (
          <p className="text-sm sm:text-base text-[var(--store-text,#0A0E11)] opacity-75 max-w-2xl leading-relaxed">
            {data.subheading}
          </p>
        )}
      </div>

      {/* 3 Value Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {cards.map((card, idx) => {
          const Icon = (card.icon && ICON_MAP[card.icon]) || ShoppingBag;
          return (
            <div
              key={card.id || card.title || idx}
              className="rounded-3xl p-7 sm:p-8 flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border"
              style={{
                backgroundColor: "color-mix(in srgb, var(--store-bg, #FFFFFF) 92%, var(--store-text, #0A0E11) 2%)",
                borderColor: "color-mix(in srgb, var(--store-text, #0A0E11) 8%, transparent)",
              }}
            >
              {/* Card Icon / Illustration */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-xs"
                style={{
                  backgroundColor: "var(--store-accent, #FFEDE6)",
                  color: "var(--store-primary, #E05315)",
                }}
              >
                <Icon className="w-8 h-8" />
              </div>

              {/* Title & Description */}
              <h3 className="text-xl font-bold text-[var(--store-text,#0A0E11)] mb-3">
                {card.title}
              </h3>
              <p className="text-sm text-[var(--store-text,#0A0E11)] opacity-70 leading-relaxed mb-8 flex-1">
                {card.description}
              </p>

              {/* Action Button */}
              {card.buttonText && (
                <Link
                  href={storeHref(info.slug, card.buttonLink || "/products")}
                  className="w-full py-3 px-5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-95 shadow-sm active:scale-[0.98]"
                  style={{ backgroundColor: "var(--store-primary, #E05315)" }}
                >
                  {card.buttonText}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
