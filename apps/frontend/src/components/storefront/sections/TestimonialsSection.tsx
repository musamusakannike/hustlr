"use client";

import React from "react";
import { CheckCircle, Star } from "lucide-react";
import type { TestimonialsSectionData } from "@/types/storefront";

interface TestimonialsSectionProps {
  data: TestimonialsSectionData;
}

export default function TestimonialsSection({ data }: TestimonialsSectionProps) {
  const items = data.items || [];
  if (items.length === 0) return null;

  return (
    <section
      className="py-16 sm:py-20 lg:py-24 border-t transition-colors"
      style={{
        backgroundColor: "color-mix(in srgb, var(--store-bg, #FFFFFF) 97%, var(--store-text, #0A0E11) 2%)",
        borderColor: "color-mix(in srgb, var(--store-text, #0A0E11) 8%, transparent)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 flex flex-col items-center gap-3">
          {data.badge && (
            <span
              className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
              style={{
                backgroundColor: "var(--store-accent, #FFEDE6)",
                color: "var(--store-primary, #E05315)",
              }}
            >
              {data.badge}
            </span>
          )}
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[var(--store-text,#0A0E11)]">
            {data.heading}
          </h2>
          {data.subheading && (
            <p className="text-sm sm:text-base text-[var(--store-text,#0A0E11)] opacity-75 max-w-2xl leading-relaxed">
              {data.subheading}
            </p>
          )}
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {items.map((item, idx) => (
            <div
              key={item.id || item.name || idx}
              className="rounded-3xl p-7 sm:p-8 bg-white border shadow-xs flex flex-col justify-between transition-all duration-300 hover:shadow-md"
              style={{
                backgroundColor: "var(--store-bg, #FFFFFF)",
                borderColor: "color-mix(in srgb, var(--store-text, #0A0E11) 10%, transparent)",
              }}
            >
              <div>
                {/* Rating stars */}
                <div className="flex items-center gap-1 mb-4 text-amber-500">
                  {Array.from({ length: item.rating || 5 }).map((_, sIdx) => (
                    <Star key={sIdx} className="w-4 h-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm sm:text-base text-[var(--store-text,#0A0E11)] opacity-85 leading-relaxed italic mb-6">
                  &ldquo;{item.comment}&rdquo;
                </p>
              </div>

              {/* Reviewer Details */}
              <div className="flex items-center gap-3 pt-4 border-t"
                style={{ borderColor: "color-mix(in srgb, var(--store-text, #0A0E11) 8%, transparent)" }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0"
                  style={{ backgroundColor: "var(--store-primary, #E05315)" }}
                >
                  {item.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--store-text,#0A0E11)]">
                    {item.name}
                  </p>
                  <p className="text-xs text-[var(--store-text,#0A0E11)] opacity-60 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    {item.role || "Verified Buyer"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
