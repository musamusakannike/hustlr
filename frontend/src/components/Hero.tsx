"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import StartStoreModal from "./StartStoreModal";
import { APP_NAME } from "@/constants/app.constants";

export default function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section
      id="hero"
      className="relative w-full font-space-grotesk overflow-hidden bg-[#EFEFEF]"
    >
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-80px)] lg:min-h-screen">
        {/* Left Column - Light Content Section */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col justify-between p-6 sm:p-10 md:p-12 lg:p-14 xl:p-18 bg-[#EFEFEF] text-[#0A0E11] z-10">
          {/* Top Header / Inline Navigation */}
          <div className="flex items-center justify-between gap-4 w-full mb-10 lg:mb-14">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl overflow-hidden shadow-xs group-hover:scale-105 transition-transform">
                <Image
                  src="/nav-icon-large.png"
                  alt={`${APP_NAME} Logo`}
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <span className="font-bold text-2xl tracking-tight text-[#0A0E11] font-archivo">
                {APP_NAME}
              </span>
            </Link>

            {/* Inline Nav Links */}
            <nav className="flex items-center gap-2.5 sm:gap-3.5 text-sm sm:text-base font-medium text-[#222222]">
              <a href="#hero" className="hover:text-[#800A1D] transition-colors">
                Home
              </a>

              <span className="text-neutral-400 font-bold select-none">•</span>

              <a
                href="#features"
                className="hover:text-[#800A1D] transition-colors"
              >
                Features
              </a>

              <span className="text-neutral-400 font-bold select-none">•</span>

              <a
                href="#templates"
                className="hover:text-[#800A1D] transition-colors inline-flex items-center gap-1"
              >
                Templates
                <svg
                  className="w-3.5 h-3.5 ml-0.5 inline-block"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 17L17 7M17 7H7M17 7V17"
                  />
                </svg>
              </a>
            </nav>
          </div>

          {/* Main Hero Content */}
          <div className="flex flex-col items-start my-auto py-4 max-w-xl">
            {/* Main Headline */}
            <h1 className="text-[#0A0E11] text-[36px] sm:text-[46px] md:text-[52px] lg:text-[50px] xl:text-[56px] font-bold leading-[1.12] tracking-tight">
              Your Multi-Tenant{" "}
              <span className="inline-block align-middle ml-1">
                {/* Store Shopping Bag Icon */}
                <svg
                  className="w-7 h-7 sm:w-9 sm:h-9 text-[#800A1D] inline-block mb-1"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h6v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z" />
                </svg>
              </span>
              <br />
              Platform for Online Stores,
              <br />
              Payments &{" "}
              <span className="relative inline-block px-3 py-0.5 mt-1 bg-[#FAD4D8] text-[#800A1D] rounded-md shadow-xs font-semibold">
                Custom Domains
              </span>
            </h1>

            {/* Maroon Zig-Zag Graphic Icon */}
            <div className="my-6">
              <svg
                width="46"
                height="16"
                viewBox="0 0 46 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 13.5L8.5 3.5L15 13.5L21.5 3.5L28 13.5L34.5 3.5L41 13.5"
                  stroke="#800A1D"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Paragraph Description */}
            <p className="text-[#525252] text-base sm:text-lg md:text-[19px] leading-[1.65] font-normal mb-8 max-w-lg">
              Empowering merchants across Africa to launch customized e-commerce
              storefronts in minutes. Accept Paystack escrow payments, manage
              inventory, and scale your brand with zero technical hassle.
            </p>

            {/* Call to Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-3 bg-[#800A1D] hover:bg-[#660817] text-white px-7 py-3.5 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 shadow-md group cursor-pointer"
              >
                <span>Start Your Free Store</span>
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>

              <a
                href="#templates"
                className="inline-flex items-center gap-2 bg-white text-[#0A0E11] hover:bg-neutral-100 border border-neutral-300 px-6 py-3.5 rounded-xl font-semibold text-base transition-all duration-200 shadow-xs"
              >
                <span>Explore Templates</span>
              </a>
            </div>
          </div>

          {/* Footer spacer */}
          <div className="hidden lg:block pt-4" />
        </div>

        {/* Right Column - Dark Hero Image Container */}
        <div className="lg:col-span-6 xl:col-span-6 relative w-full min-h-[420px] sm:min-h-[520px] lg:min-h-full bg-[#0A0E11] flex items-center justify-center overflow-hidden">
          <Image
            src="/hero.png"
            alt={`${APP_NAME} Multi-Tenant E-Commerce Dashboard`}
            fill
            className="object-cover object-center"
            priority
          />
        </div>
      </div>

      <StartStoreModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
}
