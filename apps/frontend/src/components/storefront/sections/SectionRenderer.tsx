"use client";

import React from "react";
import type { StorefrontInfo, StorefrontProduct, StorefrontSection } from "@/types/storefront";
import HeroSection from "./HeroSection";
import StatsSection from "./StatsSection";
import FeaturesSection from "./FeaturesSection";
import HowItWorksSection from "./HowItWorksSection";
import SplitStorySection from "./SplitStorySection";
import ProductRailSection from "./ProductRailSection";
import CategoriesSection from "./CategoriesSection";
import TestimonialsSection from "./TestimonialsSection";
import CtaBannerSection from "./CtaBannerSection";
import NewsletterSection from "./NewsletterSection";
import { DEFAULT_STOREFRONT_SECTIONS } from "@/fixtures/storefront-defaults";

interface SectionRendererProps {
  sections?: StorefrontSection[];
  info: StorefrontInfo;
  featuredProducts?: StorefrontProduct[];
  newArrivals?: StorefrontProduct[];
  bestSellers?: StorefrontProduct[];
  categories?: { id: string; name: string }[];
  onWish?: (id: string) => void;
}

export default function SectionRenderer({
  sections,
  info,
  featuredProducts = [],
  newArrivals = [],
  bestSellers = [],
  categories = [],
  onWish,
}: SectionRendererProps) {
  // Use provided customSections if available and non-empty, otherwise default to full marketplace template
  const activeSections = (sections && sections.length > 0
    ? sections
    : DEFAULT_STOREFRONT_SECTIONS
  )
    .filter((s) => s.isEnabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="flex flex-col w-full">
      {activeSections.map((section) => {
        switch (section.type) {
          case "hero":
            return (
              <HeroSection
                key={section.id}
                data={section.data}
                info={info}
              />
            );

          case "stats":
            return (
              <StatsSection
                key={section.id}
                data={section.data}
              />
            );

          case "features":
            return (
              <FeaturesSection
                key={section.id}
                data={section.data}
                info={info}
              />
            );

          case "how-it-works":
            return (
              <HowItWorksSection
                key={section.id}
                data={section.data}
                info={info}
              />
            );

          case "split-story":
            return (
              <SplitStorySection
                key={section.id}
                data={section.data}
                info={info}
              />
            );

          case "categories":
            return (
              <CategoriesSection
                key={section.id}
                data={section.data}
                info={info}
                categories={categories}
              />
            );

          case "featured-products":
            return (
              <ProductRailSection
                key={section.id}
                data={section.data}
                info={info}
                products={featuredProducts}
                onWish={onWish}
              />
            );

          case "new-arrivals":
            return (
              <ProductRailSection
                key={section.id}
                data={section.data}
                info={info}
                products={newArrivals}
                onWish={onWish}
              />
            );

          case "best-sellers":
            return (
              <ProductRailSection
                key={section.id}
                data={section.data}
                info={info}
                products={bestSellers}
                onWish={onWish}
              />
            );

          case "testimonials":
            return (
              <TestimonialsSection
                key={section.id}
                data={section.data}
              />
            );

          case "cta-banner":
            return (
              <CtaBannerSection
                key={section.id}
                data={section.data}
                info={info}
              />
            );

          case "newsletter":
            return (
              <NewsletterSection
                key={section.id}
                data={section.data}
              />
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
