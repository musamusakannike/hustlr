"use client";

import React from "react";
import type { BrandsSectionData } from "@/types/storefront";

export default function BrandsSection({ data }: { data: BrandsSectionData }) {
  const items = data.items && data.items.length > 0
    ? data.items
    : [
        { name: "VERSACE" },
        { name: "ZARA" },
        { name: "GUCCI" },
        { name: "PRADA" },
        { name: "Calvin Klein" },
      ];

  return (
    <section
      id="brands"
      className="py-8 sm:py-10 transition-colors"
      style={{
        backgroundColor: "var(--store-primary, #000000)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-around sm:justify-between gap-6 sm:gap-8 text-white font-integral tracking-widest text-lg sm:text-2xl md:text-3xl opacity-90">
          {items.map((item, i) =>
            item.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={item.id || i}
                src={item.image}
                alt={item.name}
                className="h-7 sm:h-9 object-contain brightness-0 invert opacity-90 hover:opacity-100 transition-opacity"
              />
            ) : item.name === "ZARA" ? (
              <span
                key={item.id || i}
                className="hover:opacity-100 transition-opacity font-serif italic tracking-normal cursor-pointer"
              >
                {item.name}
              </span>
            ) : item.name === "Calvin Klein" ? (
              <span
                key={item.id || i}
                className="hover:opacity-100 transition-opacity font-sans tracking-tight text-xl sm:text-2xl cursor-pointer"
              >
                {item.name}
              </span>
            ) : (
              <span
                key={item.id || i}
                className="hover:opacity-100 transition-opacity cursor-pointer uppercase"
              >
                {item.name}
              </span>
            )
          )}
        </div>
      </div>
    </section>
  );
}
