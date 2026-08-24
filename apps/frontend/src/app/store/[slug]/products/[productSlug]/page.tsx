"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Heart,
  Minus,
  Package,
  Plus,
  RefreshCw,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import GuestModal from "@/components/storefront/GuestModal";
import {
  useAddToCart,
  useProductReviews,
  useStorefrontInfo,
  useStorefrontProduct,
  useToggleWish,
} from "@/hooks/useStorefront";
import { useBuyerAuth } from "@/context/BuyerAuthContext";
import { formatNaira, getErrorMessage } from "@/lib/utils";
import { storeHref } from "@/lib/store-path";

export default function ProductDetailPage() {
  const { slug, productSlug } = useParams<{ slug: string; productSlug: string }>();
  const { isAuthenticated } = useBuyerAuth();
  const { data: info } = useStorefrontInfo(slug);
  const { data: product, isLoading } = useStorefrontProduct(slug, productSlug);
  const { data: reviews } = useProductReviews(slug, productSlug);
  const add = useAddToCart();
  const wish = useToggleWish();
  const { toast } = useToast();
  const [guest, setGuest] = useState(false);
  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState<Record<string, string>>({});

  const combo = useMemo(() => {
    if (!product?.hasVariants) return null;
    return product.variantCombinations.find((c) =>
      Object.entries(c.combination).every(([k, v]) => selected[k] === v)
    );
  }, [product, selected]);

  if (isLoading || !product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner label="Loading product..." />
      </div>
    );
  }

  const price = combo?.price ?? product.price;
  const stock = combo?.stock ?? product.stock;
  const images = product.images.length
    ? product.images
    : ([combo?.image].filter(Boolean) as string[]);
  const img = images[active] ?? images[0];

  const discount =
    product.compareAtPrice && product.compareAtPrice > price
      ? Math.round(((product.compareAtPrice - price) / product.compareAtPrice) * 100)
      : null;

  const requireAuth = (fn: () => void) => {
    if (!isAuthenticated) {
      setGuest(true);
      return;
    }
    fn();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb back link */}
      <div className="mb-6">
        <Link
          href={storeHref(slug, "/products")}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold opacity-70 hover:opacity-100 transition-opacity"
          style={{ color: "var(--store-text, #0A0E11)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to collections
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Images Gallery Column */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div
            className="relative aspect-square rounded-3xl overflow-hidden bg-neutral-100 border shadow-xs"
            style={{
              borderColor: "color-mix(in srgb, var(--store-text, #0A0E11) 10%, transparent)",
            }}
          >
            {img ? (
              <Image
                src={img}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 50vw, 100vw"
                priority
              />
            ) : null}

            {discount && (
              <span
                className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-extrabold text-white shadow-md"
                style={{ backgroundColor: "var(--store-primary, #E05315)" }}
              >
                -{discount}% OFF
              </span>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  onClick={() => setActive(i)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                    i === active ? "scale-95 shadow-xs" : "opacity-70 hover:opacity-100"
                  }`}
                  style={{
                    borderColor:
                      i === active
                        ? "var(--store-primary, #E05315)"
                        : "transparent",
                  }}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info & Buy Action Column */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div>
            <span
              className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-3"
              style={{
                backgroundColor: "var(--store-accent, #FFEDE6)",
                color: "var(--store-primary, #E05315)",
              }}
            >
              {product.category || "Authentic Collection"}
            </span>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[var(--store-text,#0A0E11)] leading-tight font-space-grotesk">
              {product.title}
            </h1>

            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-baseline gap-3">
                <span
                  className="text-2xl sm:text-3xl font-extrabold"
                  style={{ color: "var(--store-primary, #E05315)" }}
                >
                  {formatNaira(price)}
                </span>
                {product.compareAtPrice && product.compareAtPrice > price ? (
                  <span className="text-sm text-neutral-400 line-through font-normal">
                    {formatNaira(product.compareAtPrice)}
                  </span>
                ) : null}
              </div>

              {product.reviewCount > 0 && (
                <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <span>{product.rating.toFixed(1)}</span>
                  <span className="opacity-70 font-normal">
                    ({product.reviewCount} reviews)
                  </span>
                </div>
              )}
            </div>
          </div>

          <p className="text-sm sm:text-base text-[var(--store-text,#0A0E11)] opacity-80 leading-relaxed whitespace-pre-wrap">
            {product.description}
          </p>

          {/* Variants Selectors */}
          {(product.variants ?? []).map((v) => (
            <div key={v.name} className="flex flex-col gap-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--store-text,#0A0E11)] opacity-70">
                {v.name}: {selected[v.name] || "Select one"}
              </p>
              <div className="flex flex-wrap gap-2">
                {v.options.map((opt) => {
                  const isOptSelected = selected[v.name] === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() =>
                        setSelected((s) => ({ ...s, [v.name]: opt }))
                      }
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                        isOptSelected
                          ? "text-white shadow-xs"
                          : "bg-white text-[var(--store-text,#0A0E11)] hover:border-black/30"
                      }`}
                      style={
                        isOptSelected
                          ? {
                              backgroundColor: "var(--store-primary, #E05315)",
                              borderColor: "var(--store-primary, #E05315)",
                            }
                          : {
                              borderColor:
                                "color-mix(in srgb, var(--store-text, #0A0E11) 15%, transparent)",
                            }
                      }
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quantity & Stock Status */}
          <div className="flex items-center gap-4 pt-2">
            <div
              className="flex items-center border rounded-full bg-white p-1 shadow-2xs"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--store-text, #0A0E11) 15%, transparent)",
              }}
            >
              <button
                type="button"
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center font-bold text-sm">{qty}</span>
              <button
                type="button"
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors"
                onClick={() => setQty((q) => q + 1)}
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              {stock > 0 ? `${stock} in stock` : "Out of stock"}
            </span>
          </div>

          {/* Add to cart / Wishlist button */}
          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1 py-4 text-base rounded-full shadow-lg transition-all"
              disabled={stock < 1}
              loading={add.isPending}
              onClick={() =>
                requireAuth(() =>
                  add.mutate(
                    {
                      productId: product.id,
                      quantity: qty,
                      selectedVariants: selected,
                    },
                    {
                      onSuccess: () => toast("Added to cart successfully.", "success"),
                      onError: (err) => toast(getErrorMessage(err), "error"),
                    }
                  )
                )
              }
            >
              Add to Cart • {formatNaira(price * qty)}
            </Button>
            <Button
              variant="outline"
              className="rounded-full px-5"
              onClick={() => requireAuth(() => wish.mutate(product.id))}
              aria-label="Wishlist"
            >
              <Heart
                className={`w-5 h-5 ${
                  product.isWishlisted
                    ? "fill-[var(--store-primary,#E05315)] text-[var(--store-primary,#E05315)]"
                    : ""
                }`}
              />
            </Button>
          </div>

          {/* Escrow & Trust Badges Box */}
          <div
            className="rounded-2xl p-5 border flex flex-col gap-3.5 text-xs text-[var(--store-text,#0A0E11)] opacity-85"
            style={{
              backgroundColor: "color-mix(in srgb, var(--store-bg, #FFFFFF) 96%, var(--store-text, #0A0E11) 2%)",
              borderColor: "color-mix(in srgb, var(--store-text, #0A0E11) 10%, transparent)",
            }}
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">100% Escrow Protection</p>
                <p className="opacity-70 text-[11px]">
                  Your payment is safely held in escrow until you confirm delivery.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <p className="font-bold">Nationwide Tracked Delivery</p>
                <p className="opacity-70 text-[11px]">
                  Estimated {product.estimatedDeliveryDays || "2-4 business days"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-bold">7-Day Return Policy</p>
                <p className="opacity-70 text-[11px]">
                  Easy hassle-free returns if item arrives damaged or not as described.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="mt-16 sm:mt-24 pt-12 border-t"
        style={{ borderColor: "color-mix(in srgb, var(--store-text, #0A0E11) 10%, transparent)" }}
      >
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--store-text,#0A0E11)]">
              Customer Reviews ({reviews?.total ?? 0})
            </h2>
            <p className="text-xs sm:text-sm text-[var(--store-text,#0A0E11)] opacity-70 mt-0.5">
              Verified feedback from buyers who purchased this product.
            </p>
          </div>
        </div>

        {(reviews?.items.length ?? 0) === 0 ? (
          <div className="rounded-2xl border p-8 text-center"
            style={{ borderColor: "color-mix(in srgb, var(--store-text, #0A0E11) 10%, transparent)" }}
          >
            <p className="text-sm opacity-70">
              No reviews yet for this product. Be the first to leave a review after your order!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {reviews!.items.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl p-5 border bg-white shadow-2xs flex flex-col gap-2"
                style={{
                  backgroundColor: "var(--store-bg, #FFFFFF)",
                  borderColor: "color-mix(in srgb, var(--store-text, #0A0E11) 10%, transparent)",
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: r.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </span>
                </div>
                <p className="font-bold text-sm text-[var(--store-text,#0A0E11)]">
                  {r.title || "Great product"}
                </p>
                <p className="text-xs sm:text-sm opacity-80 leading-relaxed">
                  {r.comment}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <GuestModal slug={slug} open={guest} onClose={() => setGuest(false)} />
    </div>
  );
}
