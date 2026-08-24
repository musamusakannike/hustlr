"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function WhatWeDo() {
  return (
    <section className="py-16 md:py-24 px-6 sm:px-12 lg:px-16 xl:px-20 bg-white font-space-grotesk border-t border-neutral-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column - Content & Feature Sub-columns */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col items-start">
            {/* Main Headline */}
            <h2 className="text-[#0A0E11] text-3xl sm:text-4xl lg:text-[42px] font-bold leading-[1.18] tracking-tight max-w-xl mb-10 lg:mb-14">
              Shaping the future of Multi-Tenant{" "}
              <br className="hidden sm:inline" />
              E-Commerce in Africa
            </h2>

            {/* Sub-feature Columns Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10 w-full">
              {/* Column 1 - Custom Storefronts & Subdomains */}
              <div className="flex flex-col items-start gap-4 pr-0 sm:pr-8 sm:border-r border-neutral-200">
                <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary">
                  <svg
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                </div>

                <h3 className="font-bold text-xl text-[#0A0E11] tracking-tight">
                  Custom Storefronts & Subdomains
                </h3>

                <p className="text-[#666666] text-sm sm:text-base leading-relaxed">
                  Every seller gets a dedicated store URL (e.g.
                  musa-store.hustlr.shop) or custom domain, with personalized
                  colors, logo, and templates.
                </p>

                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-1.5 text-primary font-semibold text-sm sm:text-base hover:underline mt-1 group cursor-pointer"
                >
                  <span>Build Your Store</span>
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </Link>
              </div>

              {/* Column 2 - Escrow Wallet & Paystack */}
              <div className="flex flex-col items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary">
                  <svg
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                </div>

                <h3 className="font-bold text-xl text-[#0A0E11] tracking-tight">
                  Escrow Wallet & Paystack Checkout
                </h3>

                <p className="text-[#666666] text-sm sm:text-base leading-relaxed">
                  Seamless checkout via Paystack with escrow protection.
                  Earnings land in your seller wallet for instant bank
                  withdrawals upon delivery.
                </p>

                <a
                  href="#features"
                  className="inline-flex items-center gap-1.5 text-primary font-semibold text-sm sm:text-base hover:underline mt-1 group"
                >
                  <span>Learn Escrow Workflow</span>
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column - Image Framed in Black Blob Element */}
          <div className="lg:col-span-5 xl:col-span-5 w-full flex justify-center">
            <div className="relative w-full max-w-115 p-3 sm:p-4 bg-[#0A0E11] rounded-[28px] sm:rounded-[34px] shadow-2xl">
              <div className="relative w-full aspect-4/4.5 rounded-[20px] sm:rounded-3xl overflow-hidden">
                <Image
                  src="/whatwedo.jpg"
                  alt="Hustlr Platform Capabilities Overview"
                  fill
                  className="object-cover object-center"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
    </section>
  );
}
