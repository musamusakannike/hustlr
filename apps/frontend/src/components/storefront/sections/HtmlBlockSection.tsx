"use client";

import React, { useMemo } from "react";
import type { HtmlBlockSectionData, StorefrontInfo, StorefrontProduct } from "@/types/storefront";
import { compileHtmlSection, scopeCss } from "@/lib/html-section";
import { formatNaira } from "@/lib/utils";
import { storeHref } from "@/lib/store-path";

export default function HtmlBlockSection({
  id,
  data,
  info,
  featuredProducts = [],
  newArrivals = [],
  bestSellers = [],
  categories = [],
}: {
  id: string;
  data: HtmlBlockSectionData;
  info: StorefrontInfo;
  featuredProducts?: StorefrontProduct[];
  newArrivals?: StorefrontProduct[];
  bestSellers?: StorefrontProduct[];
  categories?: { id: string; name: string }[];
}) {
  const scope = `hustlr-html-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const mapProduct = (p: StorefrontProduct) => ({
    title: p.title,
    image: p.images[0] || "",
    price: formatNaira(p.price),
    url: storeHref(info.slug, `/products/${p.slug}`),
    name: p.title,
  });

  const html = useMemo(
    () =>
      compileHtmlSection(String(data.html || ""), {
        data: data as Record<string, unknown>,
        store: { name: info.name, logo: info.logo, url: storeHref(info.slug, "/"), slug: info.slug },
        products: {
          featured: featuredProducts.map(mapProduct),
          new: newArrivals.map(mapProduct),
          best: bestSellers.map(mapProduct),
        },
        categories: categories.map((c) => ({
          name: c.name,
          title: c.name,
          url: storeHref(info.slug, `/products?category=${encodeURIComponent(c.name)}`),
        })),
      }),
    [data, info, featuredProducts, newArrivals, bestSellers, categories],
  );

  const css = useMemo(() => scopeCss(String(data.css || ""), `.${scope}`), [data.css, scope]);

  if (!html.trim()) return null;

  return (
    <section className={scope}>
      {css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  );
}
