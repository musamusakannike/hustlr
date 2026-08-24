"use client";

import React from "react";
import {
  CheckCircle,
  Clock,
  Heart,
  Lock,
  PackageCheck,
  Percent,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Users,
} from "lucide-react";
import type { StatsSectionData } from "@/types/storefront";

const ICON_MAP: Record<string, React.ElementType> = {
  Star,
  Users,
  PackageCheck,
  ShieldCheck,
  CheckCircle,
  Truck,
  Lock,
  Heart,
  Sparkles,
  Percent,
  Clock,
};

interface StatsSectionProps {
  data: StatsSectionData;
}

export default function StatsSection({ data }: StatsSectionProps) {
  const items = data.items || [];
  if (items.length === 0) return null;

  return (
    <section
      className="border-b relative z-10 transition-colors"
      style={{
        backgroundColor: "var(--store-bg, #FFFFFF)",
        borderColor: "color-mix(in srgb, var(--store-text, #0A0E11) 10%, transparent)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-border/60">
          {items.map((item, idx) => {
            const Icon = ICON_MAP[item.icon] || Star;
            return (
              <div
                key={item.id || item.label || idx}
                className={`flex items-center gap-3.5 ${
                  idx > 0 ? "pt-3 sm:pt-0 sm:pl-6" : ""
                }`}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: "var(--store-accent, #FFEDE6)",
                    color: "var(--store-primary, #E05315)",
                  }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-base sm:text-lg font-bold tracking-tight text-[var(--store-text,#0A0E11)]">
                    {item.value}
                  </p>
                  <p className="text-xs sm:text-sm text-[var(--store-text,#0A0E11)] opacity-70 truncate">
                    {item.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
