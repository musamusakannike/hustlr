"use client";

import React, { useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Star } from "lucide-react";
import type { TestimonialsSectionData } from "@/types/storefront";

interface TestimonialsSectionProps {
  data: TestimonialsSectionData;
}

export default function TestimonialsSection({ data }: TestimonialsSectionProps) {
  const items = data.items && data.items.length > 0
    ? data.items
    : [
        {
          name: "Sarah M.",
          role: "Verified Buyer",
          rating: 5,
          comment: "I'm blown away by the quality and style of the clothes I received from this store. From casual wear to elegant dresses, every item I've bought has exceeded my expectations.",
        },
        {
          name: "Alex K.",
          role: "Verified Buyer",
          rating: 5,
          comment: "Finding clothes that align with my personal style used to be a challenge until I discovered this store. The range of options they offer is truly remarkable, catering to a variety of tastes and occasions.",
        },
        {
          name: "James L.",
          role: "Verified Buyer",
          rating: 5,
          comment: "As someone who's always on the lookout for unique fashion pieces, I'm thrilled to have stumbled upon this store. The selection of clothes is not only diverse but also on-point with the latest trends.",
        },
      ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const prev = () => {
    setCurrentIndex((p) => (p === 0 ? Math.max(0, items.length - 3) : p - 1));
  };

  const next = () => {
    setCurrentIndex((p) => (p + 1) % Math.max(1, items.length - 2));
  };

  const visible = items.slice(currentIndex, currentIndex + 3);

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Arrows */}
        <div className="flex items-center justify-between mb-8 sm:mb-10">
          <h2 className="font-integral text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-black">
            {data.heading || "OUR HAPPY CUSTOMERS"}
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={prev}
              aria-label="Previous testimonial"
              className="p-2 text-black hover:opacity-60 transition-opacity cursor-pointer rounded-full border border-gray-200"
              type="button"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              aria-label="Next testimonial"
              className="p-2 text-black hover:opacity-60 transition-opacity cursor-pointer rounded-full border border-gray-200"
              type="button"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Testimonials 3-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {visible.map((review, idx) => (
            <div
              key={review.id || idx}
              className="border border-gray-200 rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:shadow-xs transition-shadow bg-white"
            >
              <div>
                {/* 5 Yellow Stars */}
                <div className="flex items-center gap-1 mb-3 text-[#FFC633]">
                  {Array.from({ length: review.rating || 5 }).map((_, sIdx) => (
                    <Star key={sIdx} className="w-4 h-4 fill-[#FFC633] text-[#FFC633]" />
                  ))}
                </div>

                {/* Reviewer Name & Verified Badge */}
                <div className="flex items-center gap-1.5 mb-2">
                  <h3 className="font-bold text-black text-lg">
                    {review.name}
                  </h3>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500 text-white" />
                </div>

                {/* Comment */}
                <p className="text-sm text-gray-600 leading-relaxed font-normal">
                  &ldquo;{review.comment}&rdquo;
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
