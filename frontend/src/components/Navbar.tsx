"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import StartStoreModal from "./StartStoreModal";
import { APP_NAME, NAV_LINKS, LOGO_PATH } from "@/constants/app.constants";

export default function Navbar() {
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
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200/80 font-space-grotesk transition-all">
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
            <span className="font-bold text-2xl tracking-tight text-[#0A0E11] font-archivo">
              {APP_NAME}
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-semibold text-neutral-700 hover:text-[#800A1D] transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-5">
            <Link
              href="/auth/login"
              className="text-sm font-semibold text-neutral-600 hover:text-[#800A1D] transition-colors"
            >
              Sign In
            </Link>

            <Link
              href="/auth/register"
              className="bg-[#800A1D] hover:bg-[#660817] text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <span>Start Your Free Store</span>
              <svg
                className="w-4 h-4"
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
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-[#0A0E11] hover:text-neutral-600 focus:outline-none cursor-pointer"
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
        <div className="max-w-7xl mx-auto w-full px-6 py-4 flex items-center justify-between border-b border-neutral-200">
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
            <span className="font-bold text-2xl tracking-tight text-[#0A0E11] font-archivo">
              {APP_NAME}
            </span>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-[#0A0E11] cursor-pointer"
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
          {NAV_LINKS.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="text-lg font-semibold text-neutral-700 hover:text-[#800A1D] py-1"
            >
              {link.name}
            </a>
          ))}
        </div>

        <div className="mt-auto p-6 flex flex-col gap-3 border-t border-neutral-100">
          <Link
            href="/auth/login"
            onClick={() => setIsOpen(false)}
            className="w-full py-3 rounded-xl border border-neutral-200 text-[#0A0E11] font-semibold text-center text-sm hover:bg-neutral-50 transition-colors"
          >
            Sign In to Merchant Account
          </Link>
          <Link
            href="/auth/register"
            onClick={() => setIsOpen(false)}
            className="w-full py-3.5 rounded-xl bg-[#800A1D] text-white font-semibold text-center text-base shadow-md hover:bg-[#660817] transition-colors"
          >
            Start Your Free Store
          </Link>
        </div>
      </div>

      <StartStoreModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
