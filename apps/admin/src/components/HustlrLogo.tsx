"use client";

import React from "react";
import Image from "next/image";

interface HustlrLogoProps {
  variant?: "default" | "white" | "iconOnly";
  className?: string;
}

export default function HustlrLogo({
  variant = "default",
  className = "",
}: HustlrLogoProps) {
  if (variant === "iconOnly") {
    return (
      <div
        className={`relative w-8 h-8 flex items-center justify-center shrink-0 ${className}`}
      >
        <Image
          src="/nav-icon.webp"
          alt="Hustlr Logo"
          width={32}
          height={32}
          className="object-contain"
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
        <Image
          src="/nav-icon.webp"
          alt="Hustlr Logo"
          width={32}
          height={32}
          className="object-contain"
        />
      </div>
      <div className="flex flex-col">
        <span
          className={`text-xl font-bold tracking-tight ${
            variant === "white" ? "text-white" : "text-primary"
          }`}
        >
          Hustlr
        </span>
        <span
          className={`text-[9px] uppercase tracking-wider font-semibold -mt-1 ${
            variant === "white" ? "text-white/80" : "text-gray-400"
          }`}
        >
          Admin Console
        </span>
      </div>
    </div>
  );
}
