"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import StartStoreModal from "@/components/StartStoreModal";
import { APP_NAME, LOGO_PATH } from "@/constants/app.constants";

const HEADER_LINKS = [
  { name: "Features", href: "/#features" },
  { name: "Templates", href: "/templates" },
  { name: "Pricing", href: "/pricing" },
];

const MORE_LINKS = [
  { name: "About Us", href: "/about" },
  { name: "Contact Us", href: "/contact" },
  { name: "FAQs", href: "/#faqs" },
  { name: "Sign In", href: "/login" },
];

/**
 * Shared header for secondary marketing pages, mirroring the landing page's
 * nav pattern: centered logo on top, centered nav links (with More dropdown
 * and Get Started CTA) below. Hidden on `/` where the Hero section provides
 * its own inline nav.
 */
export default function MarketingHeader() {
  const pathname = usePathname();
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

  if (pathname === "/") return null;

  return (
    <>
      <header className="relative w-full font-space-grotesk overflow-hidden bg-bg-soft">
        <div className="w-full flex flex-col items-center px-6 sm:px-10 lg:px-16 pt-4 sm:pt-5 pb-6 sm:pb-8 border-b border-black/5">
          {/* Centered Logo */}
          <Link href="/" className="group flex flex-col items-center">
            <div className="relative h-12 sm:h-14 w-auto group-hover:scale-105 transition-transform">
              <Image
                src={LOGO_PATH}
                alt={`${APP_NAME} Logo`}
                width={180}
                height={120}
                className="w-auto h-12 sm:h-14 object-contain"
                priority
              />
            </div>
          </Link>

          {/* Centered Nav Links */}
          <nav className="mt-2 sm:mt-3 flex flex-wrap items-center justify-center gap-x-10 sm:gap-x-14 gap-y-2 text-sm sm:text-lg font-bold text-text/80">
            {HEADER_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
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
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMoreOpen(false)}
                    className="block px-4 py-2.5 text-sm font-medium text-text/80 hover:text-primary hover:bg-primary-light/40 transition-colors"
                  >
                    {link.name}
                  </Link>
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
        </div>
      </header>

      <StartStoreModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
