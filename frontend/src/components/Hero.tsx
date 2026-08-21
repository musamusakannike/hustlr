"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import StartStoreModal from "./StartStoreModal";
import { APP_NAME, LOGO_PATH, SUPPORT_EMAIL } from "@/constants/app.constants";

const HERO_NAV_LINKS = [
  { name: "Home", href: "#hero" },
  { name: "Features", href: "#features" },
  { name: "Templates", href: "#templates" },
];

const MORE_LINKS = [
  { name: "FAQs", href: "#faqs" },
  { name: "Contact Us", href: `mailto:${SUPPORT_EMAIL}` },
  { name: "About Us", href: "#about" },
];

export default function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <section
      id="hero"
      className="relative w-full font-space-grotesk overflow-hidden bg-bg-soft"
    >
      <div className="w-full flex flex-col items-center px-6 sm:px-10 lg:px-16 pt-4 sm:pt-5 pb-14 sm:pb-20">
        {/* Centered Logo */}
        <Link href="/" className="group flex flex-col items-center">
          <div className="relative h-12 sm:h-14 w-auto group-hover:scale-105 transition-transform">
            <Image
              src={LOGO_PATH}
              alt={`${APP_NAME} Logo`}
              width={180}
              height={120}
              className="w-auto h-12 sm:h-14 object-contain"
            />
          </div>
        </Link>

        {/* Centered Nav Links */}
        <nav className="mt-2 sm:mt-3 flex flex-wrap items-center justify-center gap-x-10 sm:gap-x-14 gap-y-2 text-sm sm:text-lg font-bold text-text/80">
          {HERO_NAV_LINKS.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="hover:text-primary transition-colors"
            >
              {link.name}
            </a>
          ))}

          {/* More Dropdown */}
          <div ref={moreRef} className="relative">
            <button
              onClick={() => setIsMoreOpen((open) => !open)}
              aria-expanded={isMoreOpen}
              aria-haspopup="true"
              className="inline-flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer"
            >
              <span>More</span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${
                  isMoreOpen ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <div
              className={`absolute left-1/2 -translate-x-1/2 top-full mt-3 w-48 z-50 bg-light rounded-xl shadow-lg border border-black/5 py-2 transition-all duration-200 origin-top ${
                isMoreOpen
                  ? "opacity-100 scale-100 pointer-events-auto"
                  : "opacity-0 scale-95 pointer-events-none"
              }`}
            >
              {MORE_LINKS.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMoreOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium text-text/80 hover:text-primary hover:bg-primary-light/40 transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Get Started — desktop only */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="hidden sm:inline-flex bg-primary hover:bg-primary-hover text-white font-semibold text-sm sm:text-base px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm cursor-pointer"
          >
            Get Started
          </button>
        </nav>

        {/* Content + Image Row on PC */}
        <div className="w-full mt-10 sm:mt-14 lg:mt-16 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12 xl:gap-16">
          {/* Left - Hero Content */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <h1 className="text-text text-[34px] sm:text-[44px] lg:text-[42px] xl:text-[48px] font-bold leading-[1.14] tracking-tight max-w-xl">
              Your Multi-Tenant{" "}
              <span className="inline-block align-middle ml-1">
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8 text-primary inline-block mb-1"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h6v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z" />
                </svg>
              </span>{" "}
              Platform for Online Stores, Payments &{" "}
              <span className="relative inline-block px-3 py-0.5 mt-1 bg-primary-light text-primary rounded-md shadow-xs font-semibold">
                Custom Domains
              </span>
            </h1>

            {/* Maroon Zig-Zag Graphic Icon */}
            <div className="my-5 sm:my-6">
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

            <p className="text-text/60 text-base sm:text-lg leading-[1.65] font-normal mb-8 max-w-xl">
              Empowering merchants across Africa to launch customized e-commerce
              storefronts in minutes. Accept Paystack escrow payments, manage
              inventory, and scale your brand with zero technical hassle.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <button
                onClick={() => setIsModalOpen(true)}
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
              </button>

              <a
                href="#templates"
                className="inline-flex items-center gap-2 bg-light text-text hover:bg-black/5 border border-black/10 px-6 py-3.5 rounded-xl font-semibold text-base transition-all duration-200 shadow-xs"
              >
                <span>Explore Templates</span>
              </a>
            </div>
          </div>

          {/* Right - Hero Image */}
          <div className="relative w-full mt-10 sm:mt-12 lg:mt-0 aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-xl">
            <Image
              src="/hero.png"
              alt={`${APP_NAME} Multi-Tenant E-Commerce Dashboard`}
              fill
              className="object-cover object-center"
              preload
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>

      <StartStoreModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
}
