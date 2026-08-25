"use client";

import React from "react";
import Link from "next/link";
import type { BannerGridSectionData, StorefrontInfo } from "@/types/storefront";
import { storeHref } from "@/lib/store-path";

export default function BannerGridSection({
  data,
  info,
}: {
  data: BannerGridSectionData;
  info: StorefrontInfo;
}) {
  const items = data.items || [];
  if (!items.length) return null;
  const cols = data.columns === 2 ? "sm:grid-cols-2" : data.columns === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3";

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto">
      <div className={`grid grid-cols-1 ${cols} gap-4`}>
        {items.map((item, i) => {
          const href = storeHref(info.slug, item.link || "/products");
          return (
            <Link
              key={item.id || i}
              href={href}
              className="relative min-h-[220px] overflow-hidden group"
              style={{ borderRadius: "var(--store-card-radius, 16px)" }}
            >
              {item.image ? (
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${item.image})` }}
                />
              ) : (
                <div className="absolute inset-0" style={{ backgroundColor: "var(--store-accent)" }} />
              )}
              <div className="absolute inset-0 bg-black/35 group-hover:bg-black/45 transition-colors" />
              <div className="relative h-full min-h-[220px] p-6 flex flex-col justify-end text-white">
                {item.subtitle && (
                  <p className="text-[11px] uppercase tracking-widest font-bold opacity-90">{item.subtitle}</p>
                )}
                <h3 className="text-xl font-extrabold">{item.title}</h3>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
