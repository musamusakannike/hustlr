"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, ChevronRight, Minus, Plus, Tag, Trash2 } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { useBuyerAuth } from "@/context/BuyerAuthContext";
import { useCart, useRemoveCartItem, useUpdateCart } from "@/hooks/useStorefront";
import { formatNaira } from "@/lib/utils";
import { storeHref } from "@/lib/store-path";

export default function CartPage() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated, isLoading: authLoading } = useBuyerAuth();
  const router = useRouter();
  const { data: cart, isLoading } = useCart();
  const update = useUpdateCart();
  const remove = useRemoveCartItem();

  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner label="Loading cart..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    router.replace(storeHref(slug, "/auth/login"));
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner label="Redirecting..." />
      </div>
    );
  }

  const items = cart?.items ?? [];
  const rawSubtotal =
    cart?.subtotal ??
    items.reduce(
      (sum, item) => sum + (item.priceSnapshot || item.product?.price || 0) * item.quantity,
      0
    );

  const discountAmount = promoApplied ? Math.round(rawSubtotal * 0.2) : 0;
  const deliveryFee = items.length > 0 ? 1500 : 0;
  const total = rawSubtotal - discountAmount + deliveryFee;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "SHOPCO20" || promoCode.trim().length > 0) {
      setPromoApplied(true);
    }
  };

  return (
    <div className="bg-white min-h-screen text-black">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 w-full">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 font-normal"
        >
          <Link href={storeHref(slug, "/")} className="hover:text-black transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-black font-medium">Cart</span>
        </nav>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-20 w-full flex-1">
        {/* Page Heading */}
        <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-integral font-extrabold uppercase tracking-tight text-black mb-6 sm:mb-8">
          YOUR CART
        </h1>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Spinner label="Loading cart items..." />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 px-4 bg-[#F0EEED]/50 rounded-[28px] max-w-2xl mx-auto border border-gray-200">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-xs">
              🛍️
            </div>
            <h2 className="text-2xl font-bold font-integral uppercase text-black mb-2">
              Your Cart is Empty
            </h2>
            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
              Looks like you haven&apos;t added any clothes to your shopping cart yet. Explore our fresh collections now!
            </p>
            <Link
              href={storeHref(slug, "/products")}
              className="inline-block text-white font-medium py-3.5 px-8 rounded-full transition-colors text-sm hover:opacity-90"
              style={{ backgroundColor: "var(--store-primary, #000000)" }}
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Left: Cart Items Card */}
            <section
              className="lg:col-span-7 border border-gray-200 rounded-[20px] p-4 sm:p-6 divide-y divide-gray-200 bg-white shadow-xs"
              aria-label="Cart Items"
            >
              {items.map((item) => {
                const price = item.priceSnapshot || item.product?.price || 0;
                return (
                  <article key={item.id} className="py-5 first:pt-0 last:pb-1 flex gap-4 sm:gap-5">
                    {/* Thumbnail */}
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-[#F0EEED] rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden p-2 relative">
                      {item.product?.images?.[0] ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.title}
                          fill
                          className="object-contain p-2 mix-blend-multiply"
                          sizes="128px"
                        />
                      ) : (
                        <span className="text-xs text-gray-400">No Image</span>
                      )}
                    </div>

                    {/* Product Details & Actions */}
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <Link
                            href={storeHref(slug, `/products/${item.product?.slug}`)}
                            className="text-base sm:text-lg lg:text-xl font-bold text-black tracking-tight leading-tight hover:underline"
                          >
                            {item.product?.title ?? "Product Item"}
                          </Link>
                          {/* Trash button */}
                          <button
                            onClick={() => remove.mutate(item.id)}
                            aria-label={`Remove ${item.product?.title}`}
                            className="text-red-500 hover:text-red-700 transition-colors p-1 cursor-pointer shrink-0"
                            type="button"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                      </div>

                      {/* Price and Quantity Stepper */}
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-lg sm:text-xl lg:text-2xl font-bold text-black">
                          {formatNaira(price)}
                        </span>

                        {/* ShopCo Quantity Counter Pill */}
                        <div className="bg-[#F0F0F0] rounded-full flex items-center justify-between px-3 py-1.5 sm:px-4 sm:py-2 w-28 sm:w-32">
                          <button
                            onClick={() =>
                              item.quantity > 1 &&
                              update.mutate({ itemId: item.id, quantity: item.quantity - 1 })
                            }
                            className="text-lg font-bold text-black hover:opacity-70 focus:outline-none cursor-pointer"
                            type="button"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-semibold text-xs sm:text-sm text-black select-none">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              update.mutate({ itemId: item.id, quantity: item.quantity + 1 })
                            }
                            className="text-lg font-bold text-black hover:opacity-70 focus:outline-none cursor-pointer"
                            type="button"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>

            {/* Right: Order Summary Card */}
            <aside
              className="lg:col-span-5 border border-gray-200 rounded-[20px] p-5 sm:p-6 bg-white shadow-xs sticky top-28"
              aria-label="Order Summary"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-5">
                Order Summary
              </h2>

              <div className="space-y-3.5 text-sm sm:text-base border-b border-gray-200 pb-5">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-black">{formatNaira(rawSubtotal)}</span>
                </div>

                <div className="flex justify-between items-center text-gray-600">
                  <span>Discount {promoApplied ? "(-20%)" : "(-0%)"}</span>
                  <span className="font-bold text-red-500">
                    -{formatNaira(discountAmount)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-black">{formatNaira(deliveryFee)}</span>
                </div>
              </div>

              {/* Total Price */}
              <div className="flex justify-between items-center py-5 text-base sm:text-lg">
                <span className="font-bold text-black">Total</span>
                <span className="font-bold text-black text-xl sm:text-2xl">
                  {formatNaira(total)}
                </span>
              </div>

              {/* Promo Code Input & Button */}
              <form onSubmit={handleApplyPromo} className="flex gap-2 sm:gap-3 mb-5">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                    <Tag className="w-4 h-4" />
                  </span>
                  <input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Add promo code"
                    className="w-full bg-[#F0F0F0] rounded-full py-2.5 sm:py-3 pl-10 pr-3 text-xs sm:text-sm text-black placeholder-gray-400 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold hover:opacity-90 transition cursor-pointer"
                  style={{ backgroundColor: "var(--store-primary, #000000)" }}
                >
                  Apply
                </button>
              </form>

              {/* Go to Checkout Button (Powered by var(--store-primary, #000000)) */}
              <Link
                href={storeHref(slug, "/checkout")}
                className="w-full text-white font-medium py-3.5 px-6 rounded-full text-sm sm:text-base flex items-center justify-center gap-2 hover:opacity-90 transition shadow-xs"
                style={{ backgroundColor: "var(--store-primary, #000000)" }}
              >
                <span>Go to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
