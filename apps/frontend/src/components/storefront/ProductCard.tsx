"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Star } from "lucide-react";
import type { StorefrontProduct } from "@/types/storefront";
import { formatNaira } from "@/lib/utils";
import { storeHref } from "@/lib/store-path";

export default function ProductCard({
  slug,
  product,
  onWish,
}: {
  slug: string;
  product: StorefrontProduct;
  onWish?: (productId: string) => void;
}) {
  const href = storeHref(slug, `/products/${product.slug}`);
  const cover = product.images[0];

  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
        )
      : null;

  return (
    <article className="group flex flex-col rounded-2xl bg-white border p-3 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
      style={{
        backgroundColor: "var(--store-bg, #FFFFFF)",
        borderColor: "color-mix(in srgb, var(--store-text, #0A0E11) 10%, transparent)",
      }}
    >
      {/* Product Image Frame */}
      <Link
        href={href}
        className="relative aspect-[4/5] rounded-xl overflow-hidden bg-neutral-100 block"
      >
        {cover ? (
          <Image
            src={cover}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(min-width: 1024px) 25vw, 50vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-xs text-neutral-400">
            No Image
          </div>
        )}

        {/* Discount Badge */}
        {discount && (
          <span
            className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[11px] font-extrabold text-white shadow-xs"
            style={{ backgroundColor: "var(--store-primary, #E05315)" }}
          >
            -{discount}%
          </span>
        )}

        {/* Wishlist Button */}
        {onWish && (
          <button
            type="button"
            aria-label="Wishlist"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onWish(product.id);
            }}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs transition-transform hover:scale-110 active:scale-95"
          >
            <Heart
              className={`w-4 h-4 ${
                product.isWishlisted
                  ? "fill-[var(--store-primary,#E05315)] text-[var(--store-primary,#E05315)]"
                  : "text-neutral-700"
              }`}
            />
          </button>
        )}
      </Link>

      {/* Product Details */}
      <div className="mt-3 flex flex-col flex-1 gap-1.5">
        {/* Category & Rating */}
        <div className="flex items-center justify-between gap-2 text-xs text-neutral-500">
          <span className="truncate capitalize font-medium">
            {product.category || "General"}
          </span>
          {product.rating > 0 && (
            <span className="flex items-center gap-0.5 font-bold text-amber-500 shrink-0">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              {product.rating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Title */}
        <Link href={href} className="hover:underline">
          <h3 className="text-sm font-bold text-[var(--store-text,#0A0E11)] line-clamp-2 leading-snug">
            {product.title}
          </h3>
        </Link>

        {/* Price & Compare Price */}
        <div className="mt-auto pt-1 flex items-baseline gap-2">
          <span
            className="text-sm sm:text-base font-extrabold"
            style={{ color: "var(--store-primary, #E05315)" }}
          >
            {formatNaira(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price ? (
            <span className="text-xs text-neutral-400 line-through font-normal">
              {formatNaira(product.compareAtPrice)}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
