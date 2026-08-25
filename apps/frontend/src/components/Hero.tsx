"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { APP_NAME } from "@/constants/app.constants";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative w-full font-space-grotesk overflow-hidden bg-bg-soft"
    >
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center text-center px-6 sm:px-10 lg:px-16 pt-10 sm:pt-14 pb-14 sm:pb-20">
        {/* Heading — exactly 2 lines, left-aligned */}
        <h1 className="self-start w-full text-left text-text text-[34px] sm:text-[44px] lg:text-[48px] xl:text-[54px] font-bold leading-[1.14] tracking-tight">
          <span className="block">
            Your Multi-Tenant Platform{" "}
            <span className="inline-block align-middle ml-1">
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 text-primary inline-block mb-1"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h6v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z" />
              </svg>
            </span>
          </span>
          <span className="block mt-1 sm:mt-2">
            for Online Stores, Payments &amp;{" "}
            <span className="relative inline-block px-3 py-0.5 bg-primary-light text-primary rounded-md shadow-xs font-semibold">
              Custom Domains
            </span>
          </span>
        </h1>

        {/* Maroon Zig-Zag Graphic Icon */}
        <div className="my-6 sm:my-8">
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

        {/* Hero Image — full container width */}
        <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-xl">
          <Image
            src="/hero.png"
            alt={`${APP_NAME} Multi-Tenant E-Commerce Dashboard`}
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
        </div>

        {/* Body text — below image, centered */}
        <p className="text-text/60 text-base sm:text-lg leading-[1.65] font-normal mt-8 sm:mt-10 max-w-2xl mx-auto">
          Empowering merchants across Africa to launch customized e-commerce
          storefronts in minutes. Accept Paystack escrow payments, manage
          inventory, and scale your brand with zero technical hassle.
        </p>

        {/* CTA row — spread edge-to-edge, aligned with body text width */}
        <div className="w-full max-w-2xl mx-auto mt-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-3 bg-primary hover:bg-primary-hover text-white px-7 py-3.5 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 shadow-md group cursor-pointer"
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
          </Link>

          <a
            href="#templates"
            className="inline-flex items-center gap-2 bg-light text-text hover:bg-black/5 border border-black/10 px-6 py-3.5 rounded-xl font-semibold text-base transition-all duration-200 shadow-xs"
          >
            <span>Explore Templates</span>
          </a>
        </div>
      </div>
    </section>
  );
}
