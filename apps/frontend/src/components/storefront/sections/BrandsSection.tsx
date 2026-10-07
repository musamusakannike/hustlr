"use client";

import React from "react";
import type { BrandsSectionData } from "@/types/storefront";
import EditableText from "@/components/dashboard/customizer/EditableText";
import EditableImage from "@/components/dashboard/customizer/EditableImage";

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
              <EditableImage
                key={item.id || i}
                path={`items.${i}.image`}
                src={item.image}
                alt={item.name}
                className="h-7 sm:h-9"
                imgClassName="h-7 sm:h-9 object-contain brightness-0 invert opacity-90"
              />
            ) : (
              <EditableText
                key={item.id || i}
                as="span"
                path={`items.${i}.name`}
                value={item.name}
                className={`hover:opacity-100 transition-opacity cursor-pointer ${
                  item.name === "ZARA"
                    ? "font-serif italic tracking-normal"
                    : item.name === "Calvin Klein"
                    ? "font-sans tracking-tight text-xl sm:text-2xl"
                    : "uppercase"
                }`}
              />
            )
          )}
        </div>
      </div>
    </section>
  );
}
