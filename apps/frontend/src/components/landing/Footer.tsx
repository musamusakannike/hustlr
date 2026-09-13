import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full font-space-grotesk overflow-hidden">
      {/* Banner Section with split background (White top, Dark bottom) */}
      <div className="relative">
        {/* Top half light background */}
        <div className="absolute top-0 inset-x-0 h-1/2 bg-bg" />
        {/* Bottom half dark background */}
        <div className="absolute bottom-0 inset-x-0 h-1/2 bg-dark" />

        {/* CTA Banner Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10 sm:py-14">
          <div className="w-full bg-primary rounded-2xl sm:rounded-3xl py-14 sm:py-18 lg:py-20 px-6 sm:px-12 text-center text-light shadow-2xl shadow-dark/20">
            {/* Main Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-light max-w-2xl mx-auto leading-tight">
              Start selling online <br className="hidden sm:inline" />
              &amp; grow your business today
            </h2>

            {/* Subtitle */}
            <p className="mt-4 sm:mt-5 text-sm sm:text-base lg:text-lg text-light/85 max-w-lg mx-auto font-normal">
              Build your branded storefront fast &amp; start accepting orders in minutes.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-5">
              <Link
                href="/templates"
                className="inline-flex items-center justify-center px-6 sm:px-7 py-3 sm:py-3.5 text-sm sm:text-base font-semibold rounded-lg text-dark bg-light hover:bg-bg-soft active:scale-[0.98] transition-all shadow-sm"
              >
                Explore Templates
              </Link>

              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 text-sm sm:text-base font-semibold rounded-lg text-light bg-dark hover:bg-dark-secondary active:scale-[0.98] transition-all shadow-sm"
              >
                <span>Get Started Now</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Dark Footer Bottom Row */}
      <div className="w-full bg-dark py-10 sm:py-12 text-light border-t border-light/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-xs sm:text-sm text-subtle">
            &copy; Copyright {currentYear}, All Rights Reserved
          </p>

          <nav
            aria-label="Footer Navigation"
            className="flex items-center gap-6 sm:gap-8 text-xs sm:text-sm font-medium text-light/75"
          >
            <Link
              href="/support"
              className="hover:text-light transition-colors"
            >
              Support
            </Link>
            <Link
              href="/terms"
              className="hover:text-light transition-colors"
            >
              Terms &amp; Conditions
            </Link>
            <Link
              href="/privacy"
              className="hover:text-light transition-colors"
            >
              Privacy Policy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
