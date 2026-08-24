"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Heart, Minus, Plus, Star } from "lucide-react";
import Button from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import GuestModal from "@/components/storefront/GuestModal";
import {
  useAddToCart,
  useProductReviews,
  useStorefrontProduct,
  useToggleWish,
} from "@/hooks/useStorefront";
import { useBuyerAuth } from "@/context/BuyerAuthContext";
import { formatNaira, getErrorMessage } from "@/lib/utils";

export default function ProductDetailPage() {
  const { slug, productSlug } = useParams<{ slug: string; productSlug: string }>();
  const { isAuthenticated } = useBuyerAuth();
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

  if (isLoading || !product) return <Spinner label="Loading product…" />;

  const price = combo?.price ?? product.price;
  const stock = combo?.stock ?? product.stock;
  const images = product.images.length ? product.images : [combo?.image].filter(Boolean) as string[];
  const img = images[active] ?? images[0];

  const requireAuth = (fn: () => void) => {
    if (!isAuthenticated) {
      setGuest(true);
      return;
    }
    fn();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-neutral-100">
            {img ? <Image src={img} alt={product.title} fill className="object-cover" sizes="50vw" /> : null}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  onClick={() => setActive(i)}
                  className={`relative w-16 h-16 rounded-xl overflow-hidden border ${i === active ? "border-[var(--store-primary)]" : "border-transparent"}`}
                >
                  <Image src={src} alt="" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{product.title}</h1>
          <p className="mt-2 text-2xl font-bold" style={{ color: "var(--store-primary)" }}>
            {formatNaira(price)}
          </p>
          {product.reviewCount > 0 && (
            <p className="text-sm mt-2 inline-flex items-center gap-1">
              <Star className="w-4 h-4 fill-current" /> {product.rating.toFixed(1)} ({product.reviewCount})
            </p>
          )}
          <p className="text-sm mt-4 leading-relaxed whitespace-pre-wrap opacity-80">
            {product.description}
          </p>

          {(product.variants ?? []).map((v) => (
            <div key={v.name} className="mt-5">
              <p className="text-xs font-bold uppercase tracking-wider mb-2">{v.name}</p>
              <div className="flex flex-wrap gap-2">
                {v.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSelected((s) => ({ ...s, [v.name]: opt }))}
                    className={`px-3 py-1.5 rounded-full text-sm border ${
                      selected[v.name] === opt ? "font-bold" : ""
                    }`}
                    style={
                      selected[v.name] === opt
                        ? { borderColor: "var(--store-primary)", color: "var(--store-primary)" }
                        : undefined
                    }
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="flex items-center gap-3 mt-6">
            <div className="flex items-center border rounded-xl">
              <button className="p-3" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-semibold">{qty}</span>
              <button className="p-3" onClick={() => setQty((q) => q + 1)} aria-label="Increase">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs opacity-60">{stock} in stock</p>
          </div>

          <div className="flex gap-2 mt-6">
            <Button
              className="flex-1"
              disabled={stock < 1}
              loading={add.isPending}
              onClick={() =>
                requireAuth(() =>
                  add.mutate(
                    { productId: product.id, quantity: qty, selectedVariants: selected },
                    {
                      onSuccess: () => toast("Added to cart.", "success"),
                      onError: (err) => toast(getErrorMessage(err), "error"),
                    }
                  )
                )
              }
            >
              Add to cart
            </Button>
            <Button
              variant="outline"
              onClick={() => requireAuth(() => wish.mutate(product.id))}
              aria-label="Wishlist"
            >
              <Heart className={`w-4 h-4 ${product.isWishlisted ? "fill-current" : ""}`} />
            </Button>
          </div>
          <p className="text-xs opacity-60 mt-3">Shipping: {product.estimatedDeliveryDays}</p>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-bold mb-4">Reviews</h2>
        {(reviews?.items.length ?? 0) === 0 ? (
          <p className="text-sm opacity-70">No reviews yet.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {reviews!.items.map((r) => (
              <li key={r.id} className="border-t pt-4">
                <p className="font-semibold text-sm">
                  {r.rating}/5 {r.title}
                </p>
                <p className="text-sm opacity-80 mt-1">{r.comment}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
      <GuestModal slug={slug} open={guest} onClose={() => setGuest(false)} />
    </div>
  );
}
