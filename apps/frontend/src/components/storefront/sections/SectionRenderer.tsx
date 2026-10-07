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
import HeroSliderSection from "./HeroSliderSection";
import BannerGridSection from "./BannerGridSection";
import IconBoxesSection from "./IconBoxesSection";
import BrandsSection from "./BrandsSection";
import LookbookGridSection from "./LookbookGridSection";
import HtmlBlockSection from "./HtmlBlockSection";
import { DEFAULT_STOREFRONT_SECTIONS } from "@/fixtures/storefront-defaults";
import { CustomizerSectionFrame } from "@/components/dashboard/customizer/customizer-edit-context";

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
        const wrap = (node: React.ReactNode) => (
          <CustomizerSectionFrame key={section.id} id={section.id}>
            {node}
          </CustomizerSectionFrame>
        );
        switch (section.type) {
          case "hero":
            return wrap(<HeroSection data={section.data} info={info} />);

          case "stats":
            return wrap(<StatsSection data={section.data} />);
          case "features":
            return wrap(<FeaturesSection data={section.data} info={info} />);
          case "how-it-works":
            return wrap(<HowItWorksSection data={section.data} info={info} />);
          case "split-story":
            return wrap(<SplitStorySection data={section.data} info={info} />);
          case "categories":
            return wrap(
              <CategoriesSection data={section.data} info={info} categories={categories} />,
            );
          case "featured-products":
            return wrap(
              <ProductRailSection
                data={section.data}
                info={info}
                products={featuredProducts}
                onWish={onWish}
              />,
            );
          case "new-arrivals":
            return wrap(
              <ProductRailSection
                data={section.data}
                info={info}
                products={newArrivals}
                onWish={onWish}
              />,
            );
          case "best-sellers":
            return wrap(
              <ProductRailSection
                data={section.data}
                info={info}
                products={bestSellers}
                onWish={onWish}
              />,
            );
          case "testimonials":
            return wrap(<TestimonialsSection data={section.data} />);
          case "cta-banner":
            return wrap(<CtaBannerSection data={section.data} info={info} />);
          case "newsletter":
            return wrap(<NewsletterSection data={section.data} />);
          case "hero-slider":
            return wrap(<HeroSliderSection data={section.data} info={info} />);
          case "banner-grid":
            return wrap(<BannerGridSection data={section.data} info={info} />);
          case "icon-boxes":
            return wrap(<IconBoxesSection data={section.data} />);
          case "brands":
            return wrap(<BrandsSection data={section.data} />);
          case "lookbook-grid":
            return wrap(<LookbookGridSection data={section.data} info={info} />);
          case "html-block":
            return wrap(
              <HtmlBlockSection
                id={section.id}
                data={section.data}
                info={info}
                featuredProducts={featuredProducts}
                newArrivals={newArrivals}
                bestSellers={bestSellers}
                categories={categories}
              />,
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
