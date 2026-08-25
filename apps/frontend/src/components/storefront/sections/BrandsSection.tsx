"use client";

import React from "react";
import type { BrandsSectionData } from "@/types/storefront";

export default function BrandsSection({ data }: { data: BrandsSectionData }) {
  const items = data.items || [];
  if (!items.length) return null;

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto">
      {data.heading && <h2 className="text-center text-sm font-bold uppercase tracking-widest mb-6 opacity-60">{data.heading}</h2>}
      <div className="flex flex-wrap items-center justify-center gap-8 opacity-70">
        {items.map((item, i) =>
          item.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={item.id || i} src={item.image} alt={item.name} className="h-8 object-contain grayscale" />
          ) : (
            <span key={item.id || i} className="text-sm font-bold tracking-wide">
              {item.name}
            </span>
          ),
        )}
      </div>
    </section>
  );
}
