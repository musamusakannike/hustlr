"use client";

import React from "react";
import Link from "next/link";
import type { ProductRailSectionData, StorefrontInfo, StorefrontProduct } from "@/types/storefront";
import ProductCard from "@/components/storefront/ProductCard";
import { storeHref } from "@/lib/store-path";
import EditableText from "@/components/dashboard/customizer/EditableText";

interface ProductRailSectionProps {
  data: ProductRailSectionData;
  info: StorefrontInfo;
  products: StorefrontProduct[];
  onWish?: (id: string, product?: StorefrontProduct) => void;
}

export default function ProductRailSection({
  data,
  info,
  products,
  onWish,
}: ProductRailSectionProps) {
  const limit = data.limit || 4;
  const displayProducts = products.slice(0, limit);

  if (displayProducts.length === 0) return null;

  return (
    <section className="py-14 sm:py-20 border-b border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Centered Integral Section Heading */}
        <EditableText
          as="h2"
          path="heading"
          value={data.heading}
          className="font-integral text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-black mb-10"
        />

        {/* 4-column Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-left">
          {displayProducts.map((product) => (
            <ProductCard
              key={product.id}
              slug={info.slug}
              product={product}
              onWish={onWish}
            />
          ))}
        </div>

        {/* View All Pill Button */}
        <div className="mt-10">
          <Link
            href={storeHref(info.slug, data.viewAllLink || "/products")}
            className="inline-block w-full sm:w-56 py-3 border border-gray-200 hover:border-black rounded-full text-sm font-medium text-black transition-colors"
          >
            View All
          </Link>
        </div>
      </div>
    </section>
  );
}
