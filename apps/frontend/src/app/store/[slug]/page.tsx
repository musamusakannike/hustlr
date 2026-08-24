"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ProductCard from "@/components/storefront/ProductCard";
import { useBestSellers, useFeatured, useNewArrivals, useStorefrontCategories, useStorefrontInfo, useToggleWish } from "@/hooks/useStorefront";
import { useBuyerAuth } from "@/context/BuyerAuthContext";
import GuestModal from "@/components/storefront/GuestModal";
import { storeHref } from "@/lib/store-path";
import { Spinner } from "@/components/ui/Spinner";

function Row({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h2 className="text-xl sm:text-2xl font-bold mb-5">{title}</h2>
      {children}
    </section>
  );
}

export default function StoreHomePage() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useBuyerAuth();
  const { data: info } = useStorefrontInfo(slug);
  const { data: featured, isLoading } = useFeatured(slug);
  const { data: newest } = useNewArrivals(slug);
  const { data: best } = useBestSellers(slug);
  const { data: cats } = useStorefrontCategories(slug);
  const wish = useToggleWish();
  const [guest, setGuest] = React.useState(false);

  const onWish = (id: string) => {
    if (!isAuthenticated) {
      setGuest(true);
      return;
    }
    wish.mutate(id);
  };

  return (
    <div>
      <section
        className="relative min-h-[280px] sm:min-h-[380px] flex items-end"
        style={{
          backgroundImage: info?.banner ? `url(${info.banner})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "var(--store-secondary)",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 text-white">
          <h1 className="text-3xl sm:text-5xl font-bold">{info?.name}</h1>
          <p className="mt-3 max-w-xl text-sm sm:text-base opacity-90 line-clamp-3">
            {info?.description}
          </p>
          <Link
            href={storeHref(slug, "/products")}
            className="inline-flex mt-6 px-6 py-3 rounded-xl font-semibold text-white"
            style={{ background: "var(--store-primary)" }}
          >
            Shop now
          </Link>
        </div>
      </section>

      {(cats ?? []).length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex gap-2 overflow-x-auto no-scrollbar">
          {cats!.map((c) => (
            <Link
              key={c.id}
              href={storeHref(slug, `/products?category=${encodeURIComponent(c.name)}`)}
              className="shrink-0 px-4 py-2 rounded-full text-sm font-semibold border"
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

      {isLoading ? (
        <Spinner />
      ) : (
        <>
          {(featured ?? []).length > 0 && (
            <Row title="Featured">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {featured!.map((p) => (
                  <ProductCard key={p.id} slug={slug} product={p} onWish={onWish} />
                ))}
              </div>
            </Row>
          )}
          {(newest ?? []).length > 0 && (
            <Row title="New arrivals">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {newest!.map((p) => (
                  <ProductCard key={p.id} slug={slug} product={p} onWish={onWish} />
                ))}
              </div>
            </Row>
          )}
          {(best ?? []).length > 0 && (
            <Row title="Best sellers">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {best!.map((p) => (
                  <ProductCard key={p.id} slug={slug} product={p} onWish={onWish} />
                ))}
              </div>
            </Row>
          )}
        </>
      )}
      <GuestModal slug={slug} open={guest} onClose={() => setGuest(false)} />
    </div>
  );
}
