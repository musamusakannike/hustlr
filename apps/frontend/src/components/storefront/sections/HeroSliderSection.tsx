"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { HeroSliderSectionData, StorefrontInfo } from "@/types/storefront";
import { storeHref } from "@/lib/store-path";
import EditableText from "@/components/dashboard/customizer/EditableText";
import EditableImage from "@/components/dashboard/customizer/EditableImage";
import { useCustomizerEdit } from "@/components/dashboard/customizer/customizer-edit-context";

export default function HeroSliderSection({
  data,
  info,
}: {
  data: HeroSliderSectionData;
  info: StorefrontInfo;
}) {
  const editing = Boolean(useCustomizerEdit()?.enabled);
  const slides = (data.slides || []).filter((s) => s.heading || s.image);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!data.autoplay || slides.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => window.clearInterval(id);
  }, [data.autoplay, slides.length]);

  if (!slides.length) return null;
  const slide = slides[index];
  const bg = slide.image || info.banner || "/hero.png";

  return (
    <section className="relative overflow-hidden min-h-[420px] sm:min-h-[520px] lg:min-h-[620px] text-white">
      {editing ? (
        <EditableImage
          path={`slides.${index}.image`}
          src={bg}
          alt={slide.heading}
          className="absolute inset-0"
          imgClassName="w-full h-full object-cover"
        />
      ) : (
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{ backgroundImage: `url(${bg})` }}
      />
      )}
      <div className="absolute inset-0 bg-black/45" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 w-full">
        {slide.badge && (
          <EditableText as="p" path={`slides.${index}.badge`} value={slide.badge} className="text-xs font-bold uppercase tracking-widest mb-3 opacity-90" />
        )}
        <EditableText
          as="h1"
          path={`slides.${index}.heading`}
          value={slide.heading}
          className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-2xl leading-tight"
        />
        {slide.subheading && (
          <EditableText
            as="p"
            path={`slides.${index}.subheading`}
            multiline
            value={slide.subheading}
            className="mt-4 text-base sm:text-lg text-white/85 max-w-xl"
          />
        )}
        {slide.ctaText && (
          <Link
            href={storeHref(info.slug, slide.ctaLink || "/products")}
            onClick={(e) => {
              if (editing) e.preventDefault();
            }}
            className="inline-flex mt-8 px-7 py-3.5 text-sm font-bold text-white"
            style={{
              backgroundColor: "var(--store-primary)",
              borderRadius: "var(--store-button-radius, 9999px)",
            }}
          >
            <EditableText as="span" path={`slides.${index}.ctaText`} value={slide.ctaText} />
          </Link>
        )}
      </div>
      {slides.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30"
            onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
          >
            <ChevronLeft className="w-5 h-5 mx-auto" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30"
            onClick={() => setIndex((i) => (i + 1) % slides.length)}
          >
            <ChevronRight className="w-5 h-5 mx-auto" />
          </button>
          <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === index ? "w-8 bg-white" : "w-3 bg-white/40"}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
