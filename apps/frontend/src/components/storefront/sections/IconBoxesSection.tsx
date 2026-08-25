"use client";

import React from "react";
import { Headphones, RefreshCw, ShieldCheck, Truck } from "lucide-react";
import type { IconBoxesSectionData } from "@/types/storefront";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Truck,
  RefreshCw,
  ShieldCheck,
  Headphones,
};

export default function IconBoxesSection({ data }: { data: IconBoxesSectionData }) {
  const items = data.items || [];
  if (!items.length) return null;

  return (
    <section
      className="border-y"
      style={{ borderColor: "color-mix(in srgb, var(--store-text) 10%, transparent)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item, i) => {
          const Icon = ICONS[item.icon || ""] || Truck;
          return (
            <div key={item.id || i} className="flex items-start gap-3">
              <span className="shrink-0" style={{ color: "var(--store-primary)" }}>
                <Icon className="w-6 h-6" />
              </span>
              <div>
                <p className="text-sm font-bold">{item.title}</p>
                {item.description && <p className="text-xs opacity-70 mt-1">{item.description}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
