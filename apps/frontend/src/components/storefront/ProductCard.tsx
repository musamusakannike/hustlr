"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import type { StorefrontProduct } from "@/types/storefront";
import { formatNaira } from "@/lib/utils";
import { storeHref } from "@/lib/store-path";
import { isGuestWishlisted } from "@/lib/guest-commerce";

function StarRating({ rating = 4.5 }: { rating?: number }) {
  const stars = [];
  const maxRating = 5;

  for (let i = 1; i <= maxRating; i++) {
    if (rating >= i) {
      stars.push(
        <svg key={i} className="w-4 h-4 text-[#FFC633] fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    } else if (rating >= i - 0.5) {
      stars.push(
        <svg key={i} className="w-4 h-4 text-[#FFC633] fill-current" viewBox="0 0 20 20">
          <defs>
            <linearGradient id={`star-half-${i}`}>
              <stop offset="50%" stopColor="#FFC633" />
              <stop offset="50%" stopColor="#E5E7EB" />
            </linearGradient>
          </defs>
          <path
            fill={`url(#star-half-${i})`}
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      );
    } else {
      stars.push(
        <svg key={i} className="w-4 h-4 text-gray-200 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">{stars}</div>
      <span className="text-xs text-gray-600 font-medium">
        {rating.toFixed(1)}/<span className="text-gray-400">5</span>
      </span>
    </div>
  );
}

export default function ProductCard({
  slug,
  product,
  onWish,
  className = "",
}: {
  slug: string;
  product: StorefrontProduct;
  onWish?: (productId: string, product?: StorefrontProduct) => void;
  className?: string;
  variant?: "minimal" | "overlay" | "boxed" | "list";
}) {
  const [localWish, setLocalWish] = React.useState<boolean | null>(null);
  const isWish =
    localWish !== null
      ? localWish
      : product.isWishlisted || isGuestWishlisted(slug, product.id);

  const href = storeHref(slug, `/products/${product.slug}`);
  const cover = product.images[0];

  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
        )
      : null;

  return (
    <Link
      href={href}
      className={`group cursor-pointer block relative ${className}`}
    >
      {/* ShopCo Rounded [20px] Background Frame */}
      <div className="bg-[#F0EEED] rounded-[20px] overflow-hidden aspect-square flex items-center justify-center p-4 sm:p-6 mb-3 sm:mb-4 transition-all duration-300 group-hover:shadow-md relative">
        {cover ? (
          <Image
            src={cover}
            alt={product.title}
            fill
            className="object-contain p-3 mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
            sizes="(min-width: 1024px) 25vw, 50vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">
            No Image
          </div>
        )}

        {/* Wishlist Button Overlay */}
        {onWish && (
          <button
            type="button"
            aria-label="Wishlist"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setLocalWish(!isWish);
              onWish(product.id, product);
            }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs transition-transform hover:scale-110 active:scale-95 z-10 cursor-pointer"
          >
            <Heart
              className={`w-4 h-4 ${
                isWish
                  ? "fill-[var(--store-primary,#000000)] text-[var(--store-primary,#000000)]"
                  : "text-neutral-700"
              }`}
            />
          </button>
        )}
      </div>

      {/* Product Title */}
      <h3 className="font-bold text-sm sm:text-base text-black truncate mb-1 group-hover:opacity-75 transition-opacity">
        {product.title}
      </h3>

      {/* Star Rating */}
      <div className="mb-1.5">
        <StarRating rating={product.rating > 0 ? product.rating : 4.5} />
      </div>

      {/* Price & Discount Pill */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        <span className="text-lg sm:text-xl font-bold text-black">
          {formatNaira(product.price)}
        </span>
        {product.compareAtPrice && product.compareAtPrice > product.price ? (
          <span className="text-base sm:text-xl font-bold text-gray-400 line-through">
            {formatNaira(product.compareAtPrice)}
          </span>
        ) : null}
        {discount && (
          <span className="text-xs font-semibold text-[#FF3333] bg-[#FF3333]/10 px-2 py-0.5 rounded-full">
            -{discount}%
          </span>
        )}
      </div>
    </Link>
  );
}
