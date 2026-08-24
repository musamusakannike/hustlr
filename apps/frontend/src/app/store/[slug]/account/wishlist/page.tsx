"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import ProductCard from "@/components/storefront/ProductCard";
import EmptyState from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useBuyerAuth } from "@/context/BuyerAuthContext";
import { useToggleWish, useWishlist } from "@/hooks/useStorefront";
import { storeHref } from "@/lib/store-path";

export default function WishlistPage() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated, isLoading: authLoading } = useBuyerAuth();
  const router = useRouter();
  const { data, isLoading } = useWishlist();
  const wish = useToggleWish();

  if (authLoading) return <Spinner />;
  if (!isAuthenticated) {
    router.replace(storeHref(slug, "/auth/login"));
    return <Spinner />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Wishlist</h1>
      {isLoading ? (
        <Spinner />
      ) : (data?.length ?? 0) === 0 ? (
        <EmptyState title="Nothing saved yet" />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data!.map((p) => (
            <ProductCard key={p.id} slug={slug} product={{ ...p, isWishlisted: true }} onWish={(id) => wish.mutate(id)} />
          ))}
        </div>
      )}
    </div>
  );
}
