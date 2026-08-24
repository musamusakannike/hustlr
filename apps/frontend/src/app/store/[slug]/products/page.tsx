"use client";

import React, { Suspense, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, Filter, Search, SlidersHorizontal, X } from "lucide-react";
import ProductCard from "@/components/storefront/ProductCard";
import GuestModal from "@/components/storefront/GuestModal";
import { Spinner } from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import {
  useStorefrontCategories,
  useStorefrontInfo,
  useStorefrontProducts,
  useToggleWish,
} from "@/hooks/useStorefront";
import { useBuyerAuth } from "@/context/BuyerAuthContext";
import { storeHref } from "@/lib/store-path";
import type { StorefrontFilters } from "@/types/storefront";

function Catalog() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useBuyerAuth();
  const { data: info } = useStorefrontInfo(slug);
  const wish = useToggleWish();
  const [guest, setGuest] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

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

  const activeCategory = filters.category || "";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header Banner */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b"
        style={{ borderColor: "color-mix(in srgb, var(--store-text, #0A0E11) 10%, transparent)" }}
      >
        <div>
          <span
            className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-2"
            style={{
              backgroundColor: "var(--store-accent, #FFEDE6)",
              color: "var(--store-primary, #E05315)",
            }}
          >
            CATALOG & STORE
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--store-text,#0A0E11)]">
            {filters.category ? filters.category : "All Collections"}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--store-text,#0A0E11)] opacity-70 mt-1">
            Showing {data?.items.length ?? 0} {data?.items.length === 1 ? "item" : "items"} available
          </p>
        </div>

        {/* Filter Controls (Search + Sort + Mobile Toggle) */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-bold shadow-2xs"
            style={{
              borderColor: "color-mix(in srgb, var(--store-text, #0A0E11) 15%, transparent)",
              color: "var(--store-text, #0A0E11)",
            }}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filter
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider opacity-60 hidden sm:inline">
              Sort:
            </span>
            <select
              className="border rounded-full px-4 py-2 text-xs sm:text-sm bg-white font-medium focus:outline-none shadow-2xs"
              style={{
                borderColor: "color-mix(in srgb, var(--store-text, #0A0E11) 15%, transparent)",
                color: "var(--store-text, #0A0E11)",
              }}
              value={filters.sort}
              onChange={(e) => set("sort", e.target.value)}
            >
              <option value="newest">Newest Arrivals</option>
              <option value="popular">Most Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Sidebar Filter */}
        <aside className="hidden lg:flex lg:w-64 shrink-0 flex-col gap-6">
          {/* Categories Box */}
          <div
            className="rounded-2xl p-5 border"
            style={{
              backgroundColor: "var(--store-bg, #FFFFFF)",
              borderColor: "color-mix(in srgb, var(--store-text, #0A0E11) 10%, transparent)",
            }}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--store-text,#0A0E11)] opacity-50 mb-3">
              Categories
            </p>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                className={`text-left text-sm py-2 px-3 rounded-xl transition-all font-medium flex items-center justify-between ${
                  !activeCategory
                    ? "font-bold text-white shadow-xs"
                    : "text-[var(--store-text,#0A0E11)] opacity-75 hover:opacity-100 hover:bg-black/5"
                }`}
                style={
                  !activeCategory
                    ? { backgroundColor: "var(--store-primary, #E05315)" }
                    : undefined
                }
                onClick={() => set("category", "")}
              >
                <span>All Collections</span>
              </button>
              {(cats ?? []).map((c) => {
                const isActive = activeCategory === c.name;
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={`text-left text-sm py-2 px-3 rounded-xl transition-all font-medium flex items-center justify-between ${
                      isActive
                        ? "font-bold text-white shadow-xs"
                        : "text-[var(--store-text,#0A0E11)] opacity-75 hover:opacity-100 hover:bg-black/5"
                    }`}
                    style={
                      isActive
                        ? { backgroundColor: "var(--store-primary, #E05315)" }
                        : undefined
                    }
                    onClick={() => set("category", c.name)}
                  >
                    <span>{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="min-h-[40vh] flex items-center justify-center">
              <Spinner label="Loading items..." />
            </div>
          ) : (data?.items.length ?? 0) === 0 ? (
            <div className="rounded-3xl border p-12 text-center"
              style={{
                borderColor: "color-mix(in srgb, var(--store-text, #0A0E11) 10%, transparent)",
              }}
            >
              <EmptyState
                title="No products found"
                description={
                  filters.category || filters.search
                    ? "Try adjusting your filters or search terms."
                    : "This store has not published any products yet."
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
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

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end"
          onClick={() => setMobileFilterOpen(false)}
        >
          <div
            className="w-80 max-w-[85vw] h-full p-6 flex flex-col gap-6 shadow-2xl overflow-y-auto"
            style={{
              backgroundColor: "var(--store-bg, #FFFFFF)",
              color: "var(--store-text, #0A0E11)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b">
              <span className="font-bold text-lg">Filter Products</span>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="p-2 rounded-lg hover:bg-black/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest opacity-50 mb-3">
                Categories
              </p>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  className={`text-left text-sm py-2.5 px-3.5 rounded-xl font-medium ${
                    !activeCategory
                      ? "font-bold text-white shadow-xs"
                      : "opacity-75 hover:bg-black/5"
                  }`}
                  style={
                    !activeCategory
                      ? { backgroundColor: "var(--store-primary, #E05315)" }
                      : undefined
                  }
                  onClick={() => {
                    set("category", "");
                    setMobileFilterOpen(false);
                  }}
                >
                  All Collections
                </button>
                {(cats ?? []).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`text-left text-sm py-2.5 px-3.5 rounded-xl font-medium ${
                      activeCategory === c.name
                        ? "font-bold text-white shadow-xs"
                        : "opacity-75 hover:bg-black/5"
                    }`}
                    style={
                      activeCategory === c.name
                        ? { backgroundColor: "var(--store-primary, #E05315)" }
                        : undefined
                    }
                    onClick={() => {
                      set("category", c.name);
                      setMobileFilterOpen(false);
                    }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <GuestModal slug={slug} open={guest} onClose={() => setGuest(false)} />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <Catalog />
    </Suspense>
  );
}
