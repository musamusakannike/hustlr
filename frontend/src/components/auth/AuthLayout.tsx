"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FiChevronLeft, FiShield, FiTrendingUp, FiShoppingBag, FiCheckCircle } from "react-icons/fi";
import { APP_NAME, LOGO_PATH } from "@/constants/app.constants";

interface AuthLayoutProps {
  children: ReactNode;
  backUrl?: string;
  onBack?: () => void;
  bannerTitle?: string;
  bannerSubtitle?: string;
  bannerQuote?: string;
}

export default function AuthLayout({
  children,
  backUrl,
  onBack,
  bannerTitle = "Turn your passion into a thriving online brand.",
  bannerSubtitle = "Join over 5,000+ ambitious African merchants launching high-converting storefronts with instant Paystack escrow payouts.",
  bannerQuote = "“Hustlr gave our boutique store instant trust and custom branding. Sales doubled within 30 days.”",
}: AuthLayoutProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backUrl) {
      router.push(backUrl);
    } else if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#FFFFFF] text-[#0A0E11] font-space-grotesk">
      {/* LEFT COLUMN: Form Container */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col justify-between px-4 sm:px-8 md:px-12 lg:px-16 py-6 md:py-10">
        {/* Top Header / Back Button & Brand Logo */}
        <div className="flex items-center justify-between w-full max-w-md mx-auto mb-6">
          <button
            onClick={handleBack}
            type="button"
            className="w-11 h-11 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 flex items-center justify-center text-neutral-800 transition-all shadow-xs hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Go back"
          >
            <FiChevronLeft className="w-5 h-5 text-neutral-700" />
          </button>

          <Link
            href="/"
            className="flex items-center gap-2.5 group"
            title={`${APP_NAME} Home`}
          >
            <div className="w-9 h-9 rounded-lg overflow-hidden relative border border-neutral-200/80 shadow-xs">
              <Image
                src={LOGO_PATH}
                alt={`${APP_NAME} Logo`}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <span className="font-archivo text-xl font-bold tracking-tight text-[#0A0E11]">
              {APP_NAME}
            </span>
          </Link>
        </div>

        {/* Form Body */}
        <div className="w-full max-w-md mx-auto my-auto py-4">
          {children}
        </div>

        {/* Footer info */}
        <div className="w-full max-w-md mx-auto pt-6 text-center text-xs text-neutral-400 border-t border-neutral-100 flex items-center justify-between">
          <span>© {new Date().getFullYear()} {APP_NAME} Inc.</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-neutral-700 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-neutral-700 transition-colors">
              Terms
            </Link>
            <Link href="/help" className="hover:text-neutral-700 transition-colors">
              Support
            </Link>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Rich Hero Banner (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0A0E11] overflow-hidden flex-col justify-between p-12 lg:p-16">
        {/* Background Image with Deep Maroon gradient overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1556742049-0a67c57750c9?q=80&w=1600&auto=format&fit=crop"
            alt="Modern Merchant Storefront"
            fill
            priority
            className="object-cover opacity-35 scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#800A1D]/90 via-[#0A0E11]/80 to-[#0A0E11]/60 mix-blend-multiply" />
          <div className="absolute inset-0 bg-radial from-transparent via-[#800A1D]/30 to-black/80" />
        </div>

        {/* Floating Top Badge */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-xs font-medium tracking-wide shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Escrow Protected Platform</span>
          </div>

          <div className="flex items-center gap-1.5 text-white/80 text-xs font-medium bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
            <FiShield className="w-3.5 h-3.5 text-[#FAD4D8]" />
            <span>Verified Merchants</span>
          </div>
        </div>

        {/* Center Content & Testimonial Card */}
        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <div className="space-y-3">
            <h2 className="text-3xl xl:text-4xl font-bold text-white tracking-tight leading-tight">
              {bannerTitle}
            </h2>
            <p className="text-white/80 text-sm xl:text-base leading-relaxed font-light">
              {bannerSubtitle}
            </p>
          </div>

          {/* Testimonial Quote Pill */}
          <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xl text-white space-y-3">
            <p className="text-sm italic text-white/95 leading-relaxed font-normal">
              {bannerQuote}
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#800A1D] border border-white/30 flex items-center justify-center font-bold text-xs text-white">
                  AM
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Amina & Musa</h4>
                  <p className="text-[11px] text-[#FAD4D8]">Lagos Couture • Pro Merchant</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-amber-300 text-xs">
                {"★".repeat(5)}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Metrics Bar */}
        <div className="relative z-10 grid grid-cols-3 gap-4 pt-6 border-t border-white/15">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-white/70 text-xs">
              <FiTrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Avg. Setup</span>
            </div>
            <p className="text-lg font-bold text-white">&lt; 5 mins</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-white/70 text-xs">
              <FiShoppingBag className="w-3.5 h-3.5 text-[#FAD4D8]" />
              <span>Escrow Rate</span>
            </div>
            <p className="text-lg font-bold text-white">100% Secure</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-white/70 text-xs">
              <FiCheckCircle className="w-3.5 h-3.5 text-sky-400" />
              <span>Payouts</span>
            </div>
            <p className="text-lg font-bold text-white">Instant</p>
          </div>
        </div>
      </div>
    </div>
  );
}
