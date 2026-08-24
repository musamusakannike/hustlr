"use client";

import React from "react";
import { useParams } from "next/navigation";
import {
  useBestSellers,
  useFeatured,
  useNewArrivals,
  useStorefrontCategories,
  useStorefrontInfo,
  useToggleWish,
} from "@/hooks/useStorefront";
import { useBuyerAuth } from "@/context/BuyerAuthContext";
import GuestModal from "@/components/storefront/GuestModal";
import SectionRenderer from "@/components/storefront/sections/SectionRenderer";
import { Spinner } from "@/components/ui/Spinner";

export default function StoreHomePage() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useBuyerAuth();
  const { data: info, isLoading: infoLoading } = useStorefrontInfo(slug);
  const { data: featured, isLoading: featuredLoading } = useFeatured(slug);
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

  if (infoLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner label="Loading store..." />
      </div>
    );
  }

  if (!info) return null;

  return (
    <div className="w-full">
      <SectionRenderer
        sections={info.customSections}
        info={info}
        featuredProducts={featured ?? []}
        newArrivals={newest ?? []}
        bestSellers={best ?? []}
        categories={cats ?? []}
        onWish={onWish}
      />
      <GuestModal slug={slug} open={guest} onClose={() => setGuest(false)} />
    </div>
  );
}
