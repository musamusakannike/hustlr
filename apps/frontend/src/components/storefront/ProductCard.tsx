"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
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

  return (
    <article className="group flex flex-col">
      <Link href={href} className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-100">
        {cover ? (
          <Image
            src={cover}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(min-width:1024px) 25vw, 50vw"
          />
        ) : null}
        {onWish && (
          <button
            type="button"
            aria-label="Wishlist"
            onClick={(e) => {
              e.preventDefault();
              onWish(product.id);
            }}
            className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center"
          >
            <Heart
              className={`w-4 h-4 ${product.isWishlisted ? "fill-[var(--store-primary)] text-[var(--store-primary)]" : "text-neutral-700"}`}
            />
          </button>
        )}
      </Link>
      <Link href={href} className="mt-3">
        <h3 className="text-sm font-semibold line-clamp-2">{product.title}</h3>
        <p className="text-sm font-bold mt-1" style={{ color: "var(--store-primary)" }}>
          {formatNaira(product.price)}
          {product.compareAtPrice ? (
            <span className="ml-2 text-xs text-neutral-400 line-through font-normal">
              {formatNaira(product.compareAtPrice)}
            </span>
          ) : null}
        </p>
      </Link>
    </article>
  );
}
