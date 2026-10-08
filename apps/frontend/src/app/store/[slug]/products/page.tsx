"use client";

import React, { Suspense, useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import ProductCard from "@/components/storefront/ProductCard";
import { Spinner } from "@/components/ui/Spinner";
import {
  useStorefrontCategories,
  useStorefrontInfo,
  useStorefrontProducts,
  useToggleWish,
} from "@/hooks/useStorefront";
import { useBuyerAuth } from "@/context/BuyerAuthContext";
import { storeHref } from "@/lib/store-path";
import type { StorefrontFilters, StorefrontProduct } from "@/types/storefront";
import { formatNaira } from "@/lib/utils";

const COLOR_SWATCHES = [
  { name: "Green", hex: "#00C12B" },
  { name: "Red", hex: "#F50606" },
  { name: "Yellow", hex: "#F5DD06" },
  { name: "Orange", hex: "#F57906" },
  { name: "Cyan", hex: "#06CAF5" },
  { name: "Blue", hex: "#063AF5" },
  { name: "Purple", hex: "#7D06F5" },
  { name: "Pink", hex: "#F506A4" },
  { name: "White", hex: "#FFFFFF", isLight: true },
  { name: "Black", hex: "#000000" },
];

const SIZES = [
  "XX-Small",
  "X-Small",
  "Small",
  "Medium",
  "Large",
  "X-Large",
  "XX-Large",
  "3X-Large",
];

const DRESS_STYLES = ["Casual", "Formal", "Party", "Gym"];

function Catalog() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useBuyerAuth();
  const { data: info } = useStorefrontInfo(slug);
  const wish = useToggleWish();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<number>(200000);

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

  const onWish = (productId: string, product?: StorefrontProduct) => {
    const foundProduct = product || allItems.find((p) => p.id === productId);
    wish.mutate({ productId, product: foundProduct });
  };

  const allItems = data?.items ?? [];
  const filteredProducts = useMemo(() => {
    return allItems.filter((p) => {
      if (p.price > maxPrice) return false;
      return true;
    });
  }, [allItems, maxPrice]);

  const itemsPerPage = 9;
  const currentPage = filters.page || 1;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const displayedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const pageTitle = activeCategory || (filters.search ? `Search: "${filters.search}"` : "Casual");

  const sidebarContent = (
    <div className="border border-gray-200 rounded-[20px] p-5 sm:p-6 bg-white space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-black tracking-tight">Filters</h2>
        <div className="flex items-center gap-2">
          {(activeCategory || selectedColor || selectedSize || maxPrice < 200000) && (
            <button
              onClick={() => {
                set("category", "");
                setSelectedColor("");
                setSelectedSize("");
                setMaxPrice(200000);
              }}
              className="text-xs text-red-500 hover:underline font-medium"
              type="button"
            >
              Clear All
            </button>
          )}
          {mobileFilterOpen && (
            <button
              onClick={() => setMobileFilterOpen(false)}
              aria-label="Close filters"
              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Category List */}
      <div className="py-2 border-b border-gray-200 space-y-2">
        <button
          onClick={() => set("category", "")}
          className={`w-full flex justify-between items-center text-sm py-1 transition-colors ${
            !activeCategory
              ? "font-bold text-black"
              : "text-gray-600 hover:text-black font-normal"
          }`}
          type="button"
        >
          <span>All Products</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        {(cats ?? []).map((cat) => (
          <button
            key={cat.id}
            onClick={() => set("category", activeCategory === cat.name ? "" : cat.name)}
            className={`w-full flex justify-between items-center text-sm py-1 transition-colors ${
              activeCategory === cat.name
                ? "font-bold text-black"
                : "text-gray-600 hover:text-black font-normal"
            }`}
            type="button"
          >
            <span>{cat.name}</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        ))}
      </div>

      {/* Price Slider */}
      <div className="py-2 border-b border-gray-200">
        <h3 className="text-base font-bold text-black mb-3">Price Range</h3>
        <input
          type="range"
          min="5000"
          max="200000"
          step="5000"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-black cursor-pointer"
        />
        <div className="flex justify-between items-center text-xs font-semibold text-gray-700 mt-2">
          <span>{formatNaira(5000)}</span>
          <span className="font-bold text-black">{formatNaira(maxPrice)}</span>
        </div>
      </div>

      {/* Colors Swatches */}
      <div className="py-2 border-b border-gray-200">
        <h3 className="text-base font-bold text-black mb-3">Colors</h3>
        <div className="flex flex-wrap gap-2.5">
          {COLOR_SWATCHES.map((color) => {
            const isSelected = selectedColor === color.hex;
            return (
              <button
                key={color.name}
                onClick={() => setSelectedColor(isSelected ? "" : color.hex)}
                aria-label={color.name}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform cursor-pointer shadow-xs ${
                  color.isLight ? "border border-gray-300" : ""
                } ${isSelected ? "ring-2 ring-offset-2 ring-black scale-105" : "hover:scale-105"}`}
                style={{ backgroundColor: color.hex }}
                type="button"
              >
                {isSelected && (
                  <Check className={`w-3.5 h-3.5 ${color.isLight ? "text-black" : "text-white"}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Size Buttons */}
      <div className="py-2 border-b border-gray-200">
        <h3 className="text-base font-bold text-black mb-3">Size</h3>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((sz) => {
            const isSelected = selectedSize === sz;
            return (
              <button
                key={sz}
                onClick={() => setSelectedSize(isSelected ? "" : sz)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? "text-white font-semibold"
                    : "bg-[#F0F0F0] text-gray-700 hover:bg-gray-200"
                }`}
                style={
                  isSelected
                    ? { backgroundColor: "var(--store-primary, #000000)" }
                    : undefined
                }
                type="button"
              >
                {sz}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dress Style Quick Links */}
      <div className="py-2">
        <h3 className="text-base font-bold text-black mb-3">Dress Style</h3>
        <div className="space-y-2">
          {DRESS_STYLES.map((style) => (
            <button
              key={style}
              onClick={() => set("category", style)}
              className={`w-full flex justify-between items-center text-sm py-1 transition-colors ${
                activeCategory === style
                  ? "font-bold text-black"
                  : "text-gray-600 hover:text-black font-normal"
              }`}
              type="button"
            >
              <span>{style}</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          ))}
        </div>
      </div>

      {/* Apply Filter Button */}
      <button
        onClick={() => setMobileFilterOpen(false)}
        className="w-full text-white font-medium py-3 rounded-full text-sm transition-opacity hover:opacity-90"
        style={{ backgroundColor: "var(--store-primary, #000000)" }}
        type="button"
      >
        Apply Filter
      </button>
    </div>
  );

  return (
    <div className="bg-white min-h-screen text-black">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-6 w-full">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center text-sm text-gray-500 font-normal"
        >
          <Link href={storeHref(slug, "/")} className="hover:text-black transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
          <span className="text-black font-medium">{pageTitle}</span>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 flex-1 w-full">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block w-72 shrink-0">
            {sidebarContent}
          </div>

          {/* Mobile Filter Modal */}
          {mobileFilterOpen && (
            <div className="fixed inset-0 z-50 flex">
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-xs"
                onClick={() => setMobileFilterOpen(false)}
              />
              <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl z-10 p-5 overflow-y-auto ml-auto">
                {sidebarContent}
              </div>
            </div>
          )}

          {/* Products Listing Section */}
          <section className="flex-1 w-full" aria-label="Product Catalog">
            {/* Catalog Info & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 gap-3 border-b border-gray-100 mb-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight font-sans capitalize">
                  {pageTitle}
                </h1>
                {/* Mobile Filter Toggle Button */}
                <button
                  onClick={() => setMobileFilterOpen(true)}
                  aria-label="Open Filter"
                  className="lg:hidden w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors ml-3"
                  type="button"
                >
                  <SlidersHorizontal className="w-4 h-4 text-black" />
                </button>
              </div>

              <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-500 justify-between sm:justify-end">
                <span>
                  Showing{" "}
                  {displayedProducts.length > 0
                    ? `${(currentPage - 1) * itemsPerPage + 1}-${Math.min(
                        currentPage * itemsPerPage,
                        filteredProducts.length
                      )}`
                    : "0"}{" "}
                  of {filteredProducts.length} Products
                </span>

                <div className="flex items-center gap-1.5">
                  <span className="hidden sm:inline">Sort by:</span>
                  <select
                    value={filters.sort || "newest"}
                    onChange={(e) => set("sort", e.target.value)}
                    className="font-semibold text-black bg-transparent border-none py-1 pl-2 pr-4 text-xs sm:text-sm focus:outline-none cursor-pointer"
                  >
                    <option value="newest">Most Popular</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            {isLoading ? (
              <div className="py-20 flex justify-center">
                <Spinner label="Loading products..." />
              </div>
            ) : displayedProducts.length === 0 ? (
              <div className="text-center py-16 bg-[#F0EEED]/50 rounded-3xl p-8 border border-gray-200">
                <p className="text-lg font-bold text-gray-700 mb-2">No products found</p>
                <p className="text-sm text-gray-500 mb-6">
                  Try adjusting or resetting your active filters to see more clothing items.
                </p>
                <button
                  onClick={() => {
                    set("category", "");
                    setSelectedColor("");
                    setSelectedSize("");
                    setMaxPrice(200000);
                  }}
                  className="text-white px-6 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition"
                  style={{ backgroundColor: "var(--store-primary, #000000)" }}
                  type="button"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                {displayedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    slug={slug}
                    product={product}
                    onWish={onWish}
                  />
                ))}
              </div>
            )}

            {/* ShopCo Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 mt-10 pt-5">
                <button
                  onClick={() => set("page", String(Math.max(1, currentPage - 1)))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 border border-gray-200 px-3.5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  type="button"
                >
                  <span className="hidden sm:inline">Previous</span>
                </button>

                <div className="flex items-center gap-1 text-sm font-medium">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => set("page", String(page))}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                        currentPage === page
                          ? "bg-[#F0EEED] text-black font-bold"
                          : "text-gray-500 hover:bg-gray-100 hover:text-black"
                      }`}
                      type="button"
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => set("page", String(Math.min(totalPages, currentPage + 1)))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 border border-gray-200 px-3.5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  type="button"
                >
                  <span className="hidden sm:inline">Next</span>
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Spinner label="Loading catalog..." />
        </div>
      }
    >
      <Catalog />
    </Suspense>
  );
}
