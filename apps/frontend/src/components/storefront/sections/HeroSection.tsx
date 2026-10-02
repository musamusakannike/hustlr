"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { HeroSectionData, StorefrontInfo } from "@/types/storefront";
import { storeHref } from "@/lib/store-path";

interface HeroSectionProps {
  data: HeroSectionData;
  info: StorefrontInfo;
}

export default function HeroSection({ data, info }: HeroSectionProps) {
  const bgImage = data.backgroundImage || info.banner;

  return (
    <section className="bg-[#F2F0F1] relative overflow-hidden pt-8 md:pt-14 pb-0 text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 pb-8 lg:pb-24 z-10">
            <h1 className="font-integral text-4xl sm:text-5xl lg:text-[58px] leading-[1.05] tracking-tight uppercase font-black text-black">
              {data.heading || "FIND CLOTHES THAT MATCHES YOUR STYLE"}
            </h1>
            <p className="mt-5 sm:mt-6 text-gray-600 text-sm sm:text-base leading-relaxed max-w-xl font-normal">
              {data.subheading ||
                "Browse through our diverse range of meticulously crafted garments, designed to bring out your individuality and cater to your sense of style."}
            </p>
            <div className="mt-8">
              <Link
                href={storeHref(info.slug, data.primaryCtaLink || "/products")}
                className="inline-block w-full sm:w-auto text-center font-medium py-3.5 px-14 rounded-full transition-all duration-200 text-sm sm:text-base shadow-sm hover:shadow-md cursor-pointer text-white"
                style={{
                  backgroundColor: "var(--store-primary, #000000)",
                }}
              >
                {data.primaryCtaText || "Shop Now"}
              </Link>
            </div>

            {/* Hero Metrics */}
            <div className="mt-10 sm:mt-12 flex flex-wrap items-center justify-between sm:justify-start gap-6 sm:gap-12">
              <div>
                <p className="text-2xl sm:text-4xl font-bold font-sans text-black">
                  200+
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  International Brands
                </p>
              </div>
              <div className="h-10 w-px bg-gray-300"></div>
              <div>
                <p className="text-2xl sm:text-4xl font-bold font-sans text-black">
                  2,000+
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  High-Quality Products
                </p>
              </div>
              <div className="hidden sm:block h-10 w-px bg-gray-300"></div>
              <div className="w-full sm:w-auto text-center sm:text-left mt-2 sm:mt-0">
                <p className="text-2xl sm:text-4xl font-bold font-sans text-black">
                  30,000+
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Happy Customers
                </p>
              </div>
            </div>
          </div>

          {/* Right Hero Visuals with Models & Decorative Star Accents */}
          <div className="lg:col-span-5 relative flex justify-center items-end self-end h-[360px] sm:h-[480px] lg:h-[600px]">
            {/* Large Decorative 4-point Star */}
            <div className="absolute top-6 sm:top-8 right-2 sm:right-6 z-10 animate-pulse">
              <svg
                className="w-16 h-16 sm:w-24 sm:h-24"
                style={{ fill: "var(--store-primary, #000000)" }}
                viewBox="0 0 100 100"
              >
                <path d="M50 0 C50 30 70 50 100 50 C70 50 50 70 50 100 C50 70 30 50 0 50 C30 50 50 30 50 0 Z"></path>
              </svg>
            </div>
            {/* Small Decorative 4-point Star */}
            <div className="absolute top-1/3 left-2 sm:left-4 z-10 animate-pulse">
              <svg
                className="w-9 h-9 sm:w-14 sm:h-14"
                style={{ fill: "var(--store-primary, #000000)" }}
                viewBox="0 0 100 100"
              >
                <path d="M50 0 C50 30 70 50 100 50 C70 50 50 70 50 100 C50 70 30 50 0 50 C30 50 50 30 50 0 Z"></path>
              </svg>
            </div>

            {/* Hero Image */}
            {bgImage ? (
              <div className="relative w-full h-full">
                <Image
                  src={bgImage}
                  alt={info.name}
                  fill
                  className="object-contain object-bottom"
                  priority
                />
              </div>
            ) : (
              <img
                alt="Stylish models wearing contemporary streetwear"
                className="relative z-0 max-h-full object-cover object-top w-full"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDN3VT5_tWdS068qBu7y_BJYlbwMhpe7DOmejQkoWfoiCqLWAUTTHbiVK5ttLbTScZjk2qSghJFTKU4w2W-V94i4GfAgw4HGtEnBpYSgmZzjbaKRVQcEvGK-FSXaC_l61sQ-XIaB8xZHcTjqpQvE7dxvoHGf54au9_cuiTtkm2jS5G0k6bqcOSugFuYzWgso__yOEOkhuMT29kP7RYKxX5i23duIz4Y7MNDHS7liPKtWrqCeGhmKFzc"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
