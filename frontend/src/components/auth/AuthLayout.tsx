"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  FiChevronLeft,
  FiShield,
  FiTrendingUp,
  FiShoppingBag,
  FiCheckCircle,
} from "react-icons/fi";
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
    <div className="h-screen w-full flex overflow-hidden bg-[#FFFFFF] text-[#0A0E11] font-space-grotesk">
      {/* LEFT COLUMN: Form Container */}
      <div className="w-full lg:w-1/2 h-screen overflow-y-auto flex flex-col justify-between px-4 sm:px-8 md:px-12 lg:px-16 py-6 md:py-10">
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
        <div className="w-full max-w-md mx-auto my-auto py-4">{children}</div>

        {/* Footer info */}
        <div className="w-full max-w-md mx-auto pt-6 text-center text-xs text-neutral-400 border-t border-neutral-100 flex items-center justify-between">
          <span>
            © {new Date().getFullYear()} {APP_NAME} Inc.
          </span>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="hover:text-neutral-700 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="hover:text-neutral-700 transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/help"
              className="hover:text-neutral-700 transition-colors"
            >
              Support
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 sticky top-0 h-screen relative bg-[#0A0E11] overflow-hidden flex-col justify-between p-12 lg:p-16">
        <div className="absolute inset-0 z-0">
          <Image
            src="/auth.jpg"
            alt="Modern Merchant Storefront"
            fill
            priority
            className="object-cover opacity-35 scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-linear-to-t from-primary/90 via-[#0A0E11]/80 to-[#0A0E11]/60 mix-blend-multiply" />
          <div className="absolute inset-0 bg-radial from-transparent via-primary/30 to-black/80" />
        </div>
        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <div className="space-y-3">
            <h2 className="text-3xl xl:text-4xl font-bold text-white tracking-tight leading-tight">
              {bannerTitle}
            </h2>
            <p className="text-white/80 text-sm xl:text-base leading-relaxed font-light">
              {bannerSubtitle}
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
}
