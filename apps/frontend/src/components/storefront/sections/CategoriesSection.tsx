"use client";

import React from "react";
import Link from "next/link";
import { FolderTree } from "lucide-react";
import type { CategoriesSectionData, StorefrontInfo } from "@/types/storefront";
import { storeHref } from "@/lib/store-path";

interface CategoriesSectionProps {
  data: CategoriesSectionData;
  info: StorefrontInfo;
  categories: { id: string; name: string }[];
}

export default function CategoriesSection({
  data,
  info,
  categories,
}: CategoriesSectionProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-6 sm:py-8 border-b transition-colors"
      style={{
        borderColor: "color-mix(in srgb, var(--store-text, #0A0E11) 10%, transparent)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
          <Link
            href={storeHref(info.slug, "/products")}
            className="shrink-0 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold border transition-all hover:scale-105"
            style={{
              backgroundColor: "var(--store-primary, #E05315)",
              borderColor: "var(--store-primary, #E05315)",
              color: "#FFFFFF",
            }}
          >
            All Collections
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={storeHref(
                info.slug,
                `/products?category=${encodeURIComponent(c.name)}`
              )}
              className="shrink-0 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold border transition-all hover:border-[var(--store-primary,#E05315)] hover:text-[var(--store-primary,#E05315)] shadow-2xs"
              style={{
                backgroundColor: "var(--store-bg, #FFFFFF)",
                borderColor: "color-mix(in srgb, var(--store-text, #0A0E11) 15%, transparent)",
                color: "var(--store-text, #0A0E11)",
              }}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
