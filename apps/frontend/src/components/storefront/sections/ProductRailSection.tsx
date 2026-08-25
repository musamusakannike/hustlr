"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ProductRailSectionData, StorefrontInfo, StorefrontProduct } from "@/types/storefront";
import ProductCard from "@/components/storefront/ProductCard";
import { storeHref } from "@/lib/store-path";

interface ProductRailSectionProps {
  data: ProductRailSectionData;
  info: StorefrontInfo;
  products: StorefrontProduct[];
  onWish?: (id: string) => void;
}

export default function ProductRailSection({
  data,
  info,
  products,
  onWish,
}: ProductRailSectionProps) {
  const limit = data.limit || 8;
  const displayProducts = products.slice(0, limit);
  const cardVariant = info.themeSettings?.productCardVariant || "minimal";

  if (displayProducts.length === 0) return null;

  return (
    <section className="py-14 sm:py-18 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
        <div>
          {data.badge && (
            <span
              className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-2"
              style={{
                backgroundColor: "var(--store-accent, #FFEDE6)",
                color: "var(--store-primary, #E05315)",
              }}
            >
              {data.badge}
            </span>
          )}
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--store-text,#0A0E11)]">
            {data.heading}
          </h2>
          {data.subheading && (
            <p className="text-xs sm:text-sm text-[var(--store-text,#0A0E11)] opacity-70 mt-1">
              {data.subheading}
            </p>
          )}
        </div>

        <Link
          href={storeHref(info.slug, data.viewAllLink || "/products")}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold transition-all hover:gap-2 self-start sm:self-auto"
          style={{ color: "var(--store-primary, #E05315)" }}
        >
          View all collection
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {displayProducts.map((product) => (
          <ProductCard
            key={product.id}
            slug={info.slug}
            product={product}
            onWish={onWish}
            variant={cardVariant}
          />
        ))}
      </div>
    </section>
  );
}
