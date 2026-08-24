"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Minus, Plus, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
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

  if (authLoading) return <Spinner />;
  if (!isAuthenticated) {
    router.replace(storeHref(slug, "/auth/login"));
    return <Spinner />;
  }

  const items = cart?.items ?? [];
  const subtotal =
    cart?.subtotal ??
    items.reduce((sum, item) => sum + (item.priceSnapshot || item.product?.price || 0) * item.quantity, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Cart</h1>
      {isLoading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          action={
            <Link href={storeHref(slug, "/products")}>
              <Button>Continue shopping</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <ul className="lg:col-span-2 flex flex-col gap-4">
            {items.map((item) => {
              const price = item.priceSnapshot || item.product?.price || 0;
              return (
                <li key={item.id} className="flex gap-3 border rounded-2xl p-3">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                    {item.product?.images?.[0] && (
                      <Image src={item.product.images[0]} alt="" fill className="object-cover" sizes="80px" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{item.product?.title ?? "Item"}</p>
                    <p className="text-sm font-bold mt-1">{formatNaira(price)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          item.quantity > 1 &&
                          update.mutate({ itemId: item.id, quantity: item.quantity - 1 })
                        }
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-semibold">{item.quantity}</span>
                      <button onClick={() => update.mutate({ itemId: item.id, quantity: item.quantity + 1 })}>
                        <Plus className="w-4 h-4" />
                      </button>
                      <button className="ml-auto" onClick={() => remove.mutate(item.id)} aria-label="Remove">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <aside className="border rounded-2xl p-5 h-fit">
            <p className="flex justify-between font-semibold">
              <span>Subtotal</span>
              <span>{formatNaira(subtotal)}</span>
            </p>
            <Link href={storeHref(slug, "/checkout")}>
              <Button fullWidth className="mt-4">
                Checkout
              </Button>
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
