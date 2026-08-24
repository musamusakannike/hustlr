"use client";

import React from "react";
import type {
  ColorScheme,
  Store,
} from "@/types/store";
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
import { DEMO_PRODUCTS } from "@/fixtures/products";

interface LiveStorefrontPreviewProps {
  store: Store;
  colorScheme: ColorScheme;
  sections: StorefrontSection[];
  viewport: "desktop" | "tablet" | "mobile";
}

export default function LiveStorefrontPreview({
  store,
  colorScheme,
  sections,
  viewport,
}: LiveStorefrontPreviewProps) {
  // Construct real-time StorefrontInfo
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

  const style = {
    ["--store-primary" as string]: colorScheme?.primary || "#E05315",
    ["--store-secondary" as string]: colorScheme?.secondary || "#1F1610",
    ["--store-accent" as string]: colorScheme?.accent || "#FFEDE6",
    ["--store-bg" as string]: colorScheme?.background || "#FFFBF9",
    ["--store-text" as string]: colorScheme?.text || "#1F1610",
    backgroundColor: "var(--store-bg)",
    color: "var(--store-text)",
  } as React.CSSProperties;

  const viewportWidth =
    viewport === "mobile"
      ? "max-w-[390px] border-[6px] border-neutral-800 rounded-[40px] shadow-2xl my-4"
      : viewport === "tablet"
      ? "max-w-[768px] border-[4px] border-neutral-700 rounded-[28px] shadow-2xl my-4"
      : "w-full rounded-2xl shadow-sm border border-border";

  return (
    <div className="w-full h-full flex justify-center items-start overflow-y-auto bg-neutral-100/70 p-4 sm:p-6">
      <div
        className={`${viewportWidth} overflow-hidden flex flex-col font-space-grotesk transition-all duration-300 relative`}
        style={style}
      >
        <StorefrontHeader info={info} />
        <main className="flex-1 w-full">
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
        </main>
        <StorefrontFooter info={info} />
      </div>
    </div>
  );
}
