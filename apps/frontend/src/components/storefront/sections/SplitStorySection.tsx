"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import type { SplitStorySectionData, StorefrontInfo } from "@/types/storefront";
import { storeHref } from "@/lib/store-path";

interface SplitStorySectionProps {
  data: SplitStorySectionData;
  info: StorefrontInfo;
}

export default function SplitStorySection({ data, info }: SplitStorySectionProps) {
  const imgSrc = data.image || info.banner || info.logo || "/hero.png";
  const isRight = (data.imagePosition ?? "right") === "right";

  return (
    <section className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        {/* Story Text Column */}
        <div className={`flex flex-col items-start gap-6 ${isRight ? "lg:col-span-6 lg:order-1" : "lg:col-span-6 lg:order-2"}`}>
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

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--store-text,#0A0E11)] leading-tight">
            {data.heading}
          </h2>

          <p className="text-base text-[var(--store-text,#0A0E11)] opacity-75 leading-relaxed">
            {data.narrative}
          </p>

          {/* Bullet points */}
          {data.bullets && data.bullets.length > 0 && (
            <ul className="flex flex-col gap-3 my-2 w-full">
              {data.bullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-[var(--store-text,#0A0E11)] font-medium">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{
                      backgroundColor: "var(--store-accent, #FFEDE6)",
                      color: "var(--store-primary, #E05315)",
                    }}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          )}

          {/* CTA */}
          {data.ctaText && (
            <Link
              href={storeHref(info.slug, data.ctaLink || "/products")}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm text-white shadow-md transition-all hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] mt-2"
              style={{ backgroundColor: "var(--store-primary, #E05315)" }}
            >
              {data.ctaText}
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Visual Showcase Column */}
        <div className={`lg:col-span-6 ${isRight ? "lg:order-2" : "lg:order-1"}`}>
          <div className="relative aspect-[4/5] sm:aspect-[4/5] max-w-md mx-auto lg:max-w-none rounded-3xl overflow-hidden shadow-2xl border"
            style={{
              borderColor: "color-mix(in srgb, var(--store-text, #0A0E11) 10%, transparent)",
            }}
          >
            {imgSrc ? (
              <Image
                src={imgSrc}
                alt={data.heading}
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: "var(--store-accent, #FFEDE6)" }}
              >
                <span className="text-sm font-semibold opacity-60">Store Showcase</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
