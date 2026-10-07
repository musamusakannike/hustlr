"use client";

import React from "react";
import Link from "next/link";
import type { BannerGridSectionData, StorefrontInfo } from "@/types/storefront";
import { storeHref } from "@/lib/store-path";
import EditableText from "@/components/dashboard/customizer/EditableText";
import EditableImage from "@/components/dashboard/customizer/EditableImage";
import { useCustomizerEdit } from "@/components/dashboard/customizer/customizer-edit-context";

export default function BannerGridSection({
  data,
  info,
}: {
  data: BannerGridSectionData;
  info: StorefrontInfo;
}) {
  const editing = Boolean(useCustomizerEdit()?.enabled);
  const items = data.items && data.items.length > 0
    ? data.items
    : [
        {
          title: "Casual",
          image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80",
          link: "/products?category=Casual",
        },
        {
          title: "Formal",
          image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80",
          link: "/products?category=Formal",
        },
        {
          title: "Party",
          image: "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=800&auto=format&fit=crop&q=80",
          link: "/products?category=Party",
        },
        {
          title: "Gym",
          image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
          link: "/products?category=Gym",
        },
      ];

  // Asymmetric ShopCo column spans: Item 0 (4 cols), Item 1 (8 cols), Item 2 (8 cols), Item 3 (4 cols)
  const getColSpan = (index: number) => {
    if (index % 4 === 0) return "md:col-span-5";
    if (index % 4 === 1) return "md:col-span-7";
    if (index % 4 === 2) return "md:col-span-7";
    return "md:col-span-5";
  };

  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#F0EEED] rounded-[32px] sm:rounded-[40px] px-6 sm:px-12 py-10 sm:py-16">
          <EditableText
            as="h2"
            path="heading"
            value={data.heading || "BROWSE BY DRESS STYLE"}
            className="font-integral text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center uppercase tracking-tight text-black mb-8 sm:mb-12"
          />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {items.map((item, i) => {
              const href = storeHref(info.slug, item.link || "/products");
              return (
                <Link
                  key={item.id || i}
                  href={href}
                  onClick={(e) => {
                    if (editing) e.preventDefault();
                  }}
                  className={`${getColSpan(i)} bg-white rounded-3xl overflow-hidden relative h-[220px] sm:h-[280px] p-6 sm:p-8 flex flex-col justify-between group cursor-pointer shadow-xs hover:shadow-md transition-shadow`}
                >
                  <EditableText
                    as="span"
                    path={`items.${i}.title`}
                    value={item.title}
                    className="text-2xl sm:text-3xl font-bold text-black z-10"
                  />
                  {item.image && (
                    <EditableImage
                      path={`items.${i}.image`}
                      src={item.image}
                      alt={item.title}
                      className="absolute right-0 bottom-0 top-0 h-full w-2/3"
                      imgClassName="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
