"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Menu, X } from "lucide-react";
import { APP_NAME, LOGO_PATH } from "@/constants/app.constants";

interface NavLinkItem {
  name: string;
  href: string;
}

const NAV_LINKS: NavLinkItem[] = [
  { name: "Templates", href: "/templates" },
  { name: "Demos", href: "#demos" },
  { name: "About", href: "/about" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

export default function Hero() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isVideoOpen, setIsVideoOpen] = useState<boolean>(false);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsVideoOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <section className="relative w-full bg-dark text-light overflow-hidden font-space-grotesk">
      {/* Ambient background lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-primary/15 via-primary/5 to-transparent blur-3xl opacity-50"
      />

      {/* Navigation Bar */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-6 sm:pt-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-light group transition-opacity hover:opacity-90"
          aria-label={APP_NAME}
        >
          <div className="relative w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-dark-secondary border border-light/10">
            <Image
              src={LOGO_PATH}
              alt={APP_NAME}
              width={32}
              height={32}
              className="w-full h-full object-contain p-1"
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-light">
            {APP_NAME}
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          className="hidden md:flex items-center gap-8 text-sm font-medium text-light/80"
          aria-label="Main Navigation"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="hover:text-light transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Right Action Area */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/auth/login"
            className="text-sm font-medium text-light/85 hover:text-light transition-colors"
          >
            Login
          </Link>
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-light bg-primary hover:bg-primary-hover active:scale-[0.98] transition-all shadow-sm"
          >
            Start Selling
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex md:hidden items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
            className="p-2 text-light/80 hover:text-light focus:outline-none focus:ring-2 focus:ring-primary rounded-md"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden relative z-30 px-6 pt-4 pb-6 bg-dark-secondary/95 border-b border-light/10 backdrop-blur-md">
          <nav className="flex flex-col gap-4 text-base font-medium text-light/90">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-light transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-light/10 flex flex-col gap-3">
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-center text-light/90 hover:text-light font-medium"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-sm font-medium rounded-md text-light bg-primary hover:bg-primary-hover transition-colors"
              >
                Get Started Free
              </Link>
            </div>
          </nav>
        </div>
      )}

      {/* Hero Content Section */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-16 sm:pt-20 lg:pt-24 text-center">
        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-light max-w-4xl mx-auto leading-[1.12]">
          Your Hustle Deserves an Online Store
        </h1>

        {/* Subtitle description */}
        <p className="mt-6 sm:mt-7 text-base sm:text-lg text-subtle max-w-2xl mx-auto leading-relaxed font-normal">
          Launch your online shop in 5 minutes. Get payments, manage orders, and
          deliver anywhere in Nigeria — all in one place.
        </p>

        {/* Action Buttons Row */}
        <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-5 sm:gap-6">
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center px-6 sm:px-7 py-3 sm:py-3.5 text-sm sm:text-base font-medium rounded-md text-light bg-primary hover:bg-primary-hover active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
          >
            Start Selling
          </Link>

          <button
            type="button"
            onClick={() => setIsVideoOpen(true)}
            className="group inline-flex items-center gap-3 text-light/90 hover:text-light transition-colors cursor-pointer"
          >
            <span className="w-10 h-10 rounded-full border border-light/30 flex items-center justify-center group-hover:border-light transition-colors">
              <Play className="w-4 h-4 text-light fill-light ml-0.5" />
            </span>
            <span className="text-sm sm:text-base font-medium">
              Watch our video
            </span>
          </button>
        </div>

        {/* Dashboard Preview Container */}
        <div className="mt-14 sm:mt-18 lg:mt-20 w-full max-w-5xl lg:max-w-6xl mx-auto">
          <div className="relative rounded-t-2xl sm:rounded-t-3xl overflow-hidden border-t border-x border-light/10 shadow-2xl bg-light">
            <Image
              src="/landing/hero-dashboard.png"
              alt="Hustlr dashboard interface preview"
              width={1717}
              height={700}
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1152px"
              className="w-full h-auto object-cover object-top block select-none pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* Video Modal Dialog */}
      {isVideoOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="video-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-dark/80 backdrop-blur-sm"
          onClick={() => setIsVideoOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl bg-dark-secondary rounded-2xl border border-light/10 overflow-hidden shadow-2xl p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-light/10">
              <h2
                id="video-modal-title"
                className="text-lg font-semibold text-light"
              >
                Platform Overview
              </h2>
              <button
                type="button"
                onClick={() => setIsVideoOpen(false)}
                aria-label="Close modal"
                className="p-1.5 text-light/70 hover:text-light rounded-lg hover:bg-light/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-6 aspect-video w-full rounded-xl overflow-hidden bg-dark flex flex-col items-center justify-center border border-light/10 relative">
              <Image
                src="/landing/hero-dashboard.webp"
                alt="Video preview placeholder"
                fill
                className="object-cover opacity-40 blur-xs"
              />
              <div className="relative z-10 flex flex-col items-center text-center p-6">
                <span className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-lg mb-3">
                  <Play className="w-7 h-7 text-light fill-light ml-1" />
                </span>
                <p className="text-light font-medium text-base">
                  Product Walkthrough &amp; Demo
                </p>
                <p className="text-subtle text-sm mt-1 max-w-sm">
                  Discover how Hustlr streamlines your storefront setup and
                  operations in under five minutes.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
