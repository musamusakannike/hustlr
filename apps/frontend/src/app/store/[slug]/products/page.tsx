"use client";

import React, { Suspense, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/storefront/ProductCard";
import GuestModal from "@/components/storefront/GuestModal";
import { Spinner } from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import { useStorefrontCategories, useStorefrontProducts, useToggleWish } from "@/hooks/useStorefront";
import { useBuyerAuth } from "@/context/BuyerAuthContext";
import { storeHref } from "@/lib/store-path";
import type { StorefrontFilters } from "@/types/storefront";

function Catalog() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useBuyerAuth();
  const wish = useToggleWish();
  const [guest, setGuest] = useState(false);

  const filters: StorefrontFilters = {
    category: searchParams.get("category") ?? undefined,
    search: searchParams.get("q") ?? undefined,
    sort: (searchParams.get("sort") as StorefrontFilters["sort"]) ?? "newest",
    page: Number(searchParams.get("page") ?? "1"),
    limit: 24,
  };
  const { data, isLoading } = useStorefrontProducts(slug, filters);
  const { data: cats } = useStorefrontCategories(slug);

  const set = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== "page") params.delete("page");
    router.replace(storeHref(slug, `/products?${params.toString()}`));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Shop</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-56 shrink-0 flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-wider opacity-60">Categories</p>
          <button
            className={`text-left text-sm py-1 ${!filters.category ? "font-bold" : ""}`}
            onClick={() => set("category", "")}
          >
            All
          </button>
          {(cats ?? []).map((c) => (
            <button
              key={c.id}
              className={`text-left text-sm py-1 ${filters.category === c.name ? "font-bold" : ""}`}
              onClick={() => set("category", c.name)}
            >
              {c.name}
            </button>
          ))}
          <label className="text-xs font-bold uppercase tracking-wider opacity-60 mt-4">
            Sort
          </label>
          <select
            className="border rounded-xl px-3 py-2 text-sm bg-transparent"
            value={filters.sort}
            onChange={(e) => set("sort", e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="popular">Popular</option>
          </select>
        </aside>
        <div className="flex-1">
          {isLoading ? (
            <Spinner />
          ) : (data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No products" description="Try another category or search." />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {data!.items.map((p) => (
                <ProductCard
                  key={p.id}
                  slug={slug}
                  product={p}
                  onWish={(id) => {
                    if (!isAuthenticated) setGuest(true);
                    else wish.mutate(id);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <GuestModal slug={slug} open={guest} onClose={() => setGuest(false)} />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <Catalog />
    </Suspense>
  );
}
