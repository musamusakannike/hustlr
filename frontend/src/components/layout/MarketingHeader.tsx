"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import StartStoreModal from "@/components/StartStoreModal";
import { APP_NAME, LOGO_PATH } from "@/constants/app.constants";

const HEADER_LINKS = [
  { name: "Features", href: "/#features" },
  { name: "Templates", href: "/templates" },
  { name: "Pricing", href: "/pricing" },
  { name: "About", href: "/about" },
  { name: "FAQs", href: "/#faqs" },
];

export default function MarketingHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-border/80 font-space-grotesk transition-all">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 py-4 flex items-center justify-between">
          {/* Logo Branding */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl overflow-hidden shadow-xs group-hover:scale-105 transition-transform">
              <Image
                src={LOGO_PATH}
                alt={`${APP_NAME} Logo`}
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <span className="font-bold text-2xl tracking-tight text-text font-archivo">
              {APP_NAME}
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {HEADER_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-semibold text-neutral-700 hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-5">
            <Link
              href="/login"
              className="text-sm font-semibold text-neutral-600 hover:text-text transition-colors"
            >
              Sign In
            </Link>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-primary hover:bg-primary-hover text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <span>Start Your Free Store</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-text hover:text-neutral-600 focus:outline-none cursor-pointer"
            aria-label="Toggle navigation"
          >
            {isOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-white/95 backdrop-blur-md flex flex-col font-space-grotesk transition-all duration-300 ease-in-out lg:hidden ${
          isOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-full pointer-events-none"
        }`}
      >
        <div className="max-w-7xl mx-auto w-full px-6 py-4 flex items-center justify-between border-b border-border">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5"
          >
            <div className="relative w-8 h-8 flex items-center justify-center rounded-lg overflow-hidden">
              <Image
                src={LOGO_PATH}
                alt={`${APP_NAME} Logo`}
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <span className="font-bold text-2xl tracking-tight text-text font-archivo">
              {APP_NAME}
            </span>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-text cursor-pointer"
            aria-label="Close navigation"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-4 p-6 pt-8">
          {HEADER_LINKS.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="text-lg font-semibold text-neutral-700 hover:text-primary py-1"
            >
              {link.name}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setIsOpen(false)}
            className="text-lg font-semibold text-neutral-700 hover:text-primary py-1"
          >
            Sign In
          </Link>
        </div>

        <div className="mt-auto p-6 flex flex-col gap-3 border-t border-neutral-100">
          <button
            onClick={() => {
              setIsModalOpen(true);
              setIsOpen(false);
            }}
            className="w-full py-3.5 rounded-xl bg-primary text-white font-semibold text-base shadow-md"
          >
            Start Your Free Store
          </button>
        </div>
      </div>

      <StartStoreModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
