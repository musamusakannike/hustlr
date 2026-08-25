"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  CheckCircle2,
  Filter,
  Heart,
  Minus,
  Plus,
  RefreshCw,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";
import type { ColorScheme, Store } from "@/types/store";
import type {
  StorefrontInfo,
  StorefrontProduct,
  StorefrontSection,
} from "@/types/storefront";
import SectionRenderer from "@/components/storefront/sections/SectionRenderer";
import {
  StorefrontFooter,
  StorefrontHeader,
} from "@/components/storefront/StorefrontChrome";
import ProductCard from "@/components/storefront/ProductCard";
import { DEMO_PRODUCTS } from "@/fixtures/products";
import { resolveTheme, type StoreThemeSettings } from "@/lib/storefront-theme";
import { formatNaira } from "@/lib/utils";

interface LiveStorefrontPreviewProps {
  store: Store;
  colorScheme: ColorScheme;
  sections: StorefrontSection[];
  themeSettings: StoreThemeSettings;
  viewport: "desktop" | "tablet" | "mobile";
  previewPage?: "home" | "shop" | "product";
}

export default function LiveStorefrontPreview({
  store,
  colorScheme,
  sections,
  themeSettings,
  viewport,
  previewPage = "home",
}: LiveStorefrontPreviewProps) {
  const resolved = resolveTheme(themeSettings);

  const info: StorefrontInfo = {
    name: store.name || "My Store",
    slug: store.slug || "my-store",
    description: store.description || "",
    logo: store.logo || "",
    banner: store.banner || "",
    favicon: store.favicon || "",
    socialLinks: store.socialLinks || {},
    colorScheme,
    contactEmail: store.contactEmail || "",
    contactPhone: store.contactPhone || "",
    address: store.address || "",
    shippingPolicy: store.shippingPolicy || "",
    returnPolicy: store.returnPolicy || "",
    termsOfService: store.termsOfService || "",
    privacyPolicy: store.privacyPolicy || "",
    metaTitle: store.metaTitle || store.name,
    metaDescription: store.metaDescription || store.description,
    currency: store.currency || "NGN",
    currencySymbol: store.currencySymbol || "₦",
    templateId: typeof store.templateId === "string" ? store.templateId : null,
    customSections: sections,
    themeSettings: resolved,
    url: `https://${store.slug || "preview"}.hustlr.store`,
    customDomain: null,
  };

  const dummyProducts: StorefrontProduct[] = DEMO_PRODUCTS.map((p) => ({
    id: p.id,
    storeId: store.id,
    title: p.title,
    slug: p.slug,
    description: p.description,
    category: p.category,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    stock: p.stock,
    images: p.images,
    hasVariants: p.hasVariants,
    variants: p.variants,
    variantCombinations: p.variantCombinations,
    tags: p.tags,
    shippingFee: 1500,
    estimatedDeliveryDays: "2-4 business days",
    rating: 4.9,
    reviewCount: 18,
    isFeatured: true,
    isWishlisted: false,
    createdAt: new Date().toISOString(),
  }));

  const sampleProduct = dummyProducts[0];
  const [activeThumb, setActiveThumb] = useState(0);

  const style = {
    ["--store-primary" as string]: colorScheme?.primary || "#E05315",
    ["--store-secondary" as string]: colorScheme?.secondary || "#1F1610",
    ["--store-accent" as string]: colorScheme?.accent || "#FFEDE6",
    ["--store-bg" as string]: colorScheme?.background || "#FFFBF9",
    ["--store-text" as string]: colorScheme?.text || "#1F1610",
    ["--store-card-radius" as string]: resolved.cardRadius || "16px",
    ["--store-button-radius" as string]: resolved.buttonRadius || "9999px",
    backgroundColor: "var(--store-bg)",
    color: "var(--store-text)",
  } as React.CSSProperties;

  const viewportWidth =
    viewport === "mobile"
      ? "max-w-[390px] border-[6px] border-neutral-800 rounded-[40px] shadow-2xl my-4"
      : viewport === "tablet"
      ? "max-w-[768px] border-[4px] border-neutral-700 rounded-[28px] shadow-2xl my-4"
      : "w-full rounded-2xl shadow-sm border border-border";

  const shopLayout = resolved.shopLayout;
  const showSidebar = shopLayout === "boxed-sidebar";
  const gridClass =
    shopLayout === "grid-2"
      ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
      : shopLayout === "grid-4"
      ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
      : shopLayout === "list"
      ? "flex flex-col gap-3"
      : "grid grid-cols-2 md:grid-cols-3 gap-4";
  const cardVariant = shopLayout === "list" ? "list" : resolved.productCardVariant;

  const isCentered = resolved.productLayout === "centered";
  const isSticky = resolved.productLayout === "sticky";
  const isExtended = resolved.productLayout === "extended";

  return (
    <div className="w-full h-full flex justify-center items-start overflow-y-auto bg-neutral-100/70 p-4 sm:p-6">
      <div
        className={`${viewportWidth} overflow-hidden flex flex-col font-space-grotesk transition-all duration-300 relative`}
        style={style}
      >
        <StorefrontHeader info={info} />

        <main className="flex-1 w-full">
          {previewPage === "home" && (
            <SectionRenderer
              sections={sections}
              info={info}
              featuredProducts={dummyProducts}
              newArrivals={dummyProducts}
              bestSellers={dummyProducts}
              categories={[
                { id: "1", name: "Fashion" },
                { id: "2", name: "Beauty" },
                { id: "3", name: "Accessories" },
                { id: "4", name: "Home & Craft" },
              ]}
            />
          )}

          {previewPage === "shop" && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
              <div className="mb-6 pb-4 border-b flex items-center justify-between"
                style={{ borderColor: "color-mix(in srgb, var(--store-text) 10%, transparent)" }}
              >
                <div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full inline-block mb-1"
                    style={{
                      backgroundColor: "var(--store-accent)",
                      color: "var(--store-primary)",
                    }}
                  >
                    PREVIEW: SHOP CATALOG
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold">All Collections</h2>
                </div>
                <div className="text-xs opacity-70">
                  Layout: <span className="font-bold">{resolved.shopLayout}</span> • Card: <span className="font-bold">{resolved.productCardVariant}</span>
                </div>
              </div>

              <div className="flex gap-6">
                {showSidebar && (
                  <aside className="w-48 shrink-0 hidden sm:flex flex-col gap-2 p-3 rounded-2xl border"
                    style={{ borderColor: "color-mix(in srgb, var(--store-text) 10%, transparent)" }}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">Categories</p>
                    {["All Products", "New Arrivals", "Best Sellers", "Sale Items"].map((cat, i) => (
                      <span
                        key={cat}
                        className={`text-xs py-1.5 px-2 rounded-lg font-medium cursor-pointer ${
                          i === 0 ? "font-bold text-white" : "opacity-75"
                        }`}
                        style={i === 0 ? { backgroundColor: "var(--store-primary)" } : undefined}
                      >
                        {cat}
                      </span>
                    ))}
                  </aside>
                )}

                <div className="flex-1">
                  <div className={gridClass}>
                    {dummyProducts.slice(0, 6).map((p) => (
                      <ProductCard
                        key={p.id}
                        slug={store.slug || "preview"}
                        product={p}
                        variant={cardVariant}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {previewPage === "product" && sampleProduct && (
            <div className={`${isCentered ? "max-w-3xl" : "max-w-7xl"} mx-auto px-4 sm:px-6 py-8`}>
              <div className="mb-4">
                <span
                  className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full inline-block mb-2"
                  style={{
                    backgroundColor: "var(--store-accent)",
                    color: "var(--store-primary)",
                  }}
                >
                  PREVIEW: PRODUCT DETAIL ({resolved.productLayout})
                </span>
              </div>

              <div className={isCentered || isExtended ? "flex flex-col gap-8" : "grid grid-cols-1 md:grid-cols-2 gap-8"}>
                {/* Images */}
                <div className="flex flex-col gap-3">
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-100 border"
                    style={{ borderColor: "color-mix(in srgb, var(--store-text) 10%, transparent)" }}
                  >
                    <Image
                      src={sampleProduct.images[activeThumb] || sampleProduct.images[0]}
                      alt={sampleProduct.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  {sampleProduct.images.length > 1 && (
                    <div className="flex gap-2">
                      {sampleProduct.images.map((src, i) => (
                        <button
                          key={src + i}
                          type="button"
                          onClick={() => setActiveThumb(i)}
                          className="relative w-14 h-14 rounded-xl overflow-hidden border-2"
                          style={{
                            borderColor: i === activeThumb ? "var(--store-primary)" : "transparent",
                          }}
                        >
                          <Image src={src} alt="" fill className="object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className={`flex flex-col gap-4 ${isSticky ? "md:sticky md:top-20 self-start" : ""}`}>
                  <div>
                    <p className="text-xs uppercase font-bold tracking-wider opacity-60">{sampleProduct.category}</p>
                    <h1 className="text-xl sm:text-2xl font-extrabold mt-1">{sampleProduct.title}</h1>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-xl font-extrabold" style={{ color: "var(--store-primary)" }}>
                        {formatNaira(sampleProduct.price)}
                      </span>
                      {sampleProduct.compareAtPrice && (
                        <span className="text-xs opacity-50 line-through">
                          {formatNaira(sampleProduct.compareAtPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs opacity-75 leading-relaxed">{sampleProduct.description}</p>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="flex-1 py-3 px-4 text-xs font-bold text-white shadow-md"
                      style={{
                        backgroundColor: "var(--store-primary)",
                        borderRadius: "var(--store-button-radius)",
                      }}
                    >
                      Add to Cart • {formatNaira(sampleProduct.price)}
                    </button>
                    <button
                      type="button"
                      className="p-3 rounded-full border flex items-center justify-center"
                      style={{
                        borderColor: "color-mix(in srgb, var(--store-text) 15%, transparent)",
                        borderRadius: "var(--store-button-radius)",
                      }}
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-3 rounded-xl border flex flex-col gap-2 text-[11px] opacity-80"
                    style={{ borderColor: "color-mix(in srgb, var(--store-text) 10%, transparent)" }}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Escrow payment protection guaranteed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Estimated delivery: 2-4 business days</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <StorefrontFooter info={info} />
      </div>
    </div>
  );
}
