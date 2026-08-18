import React from "react";
import { FEATURE_CARDS } from "@/constants/app.constants";

const icons = [
  // Icon 1: Rocket / Store Setup
  <svg
    key="1"
    className="w-8 h-8 text-[#800A1D]"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-3.05 11a22.35 22.35 0 0 1-3.95 2z" />
  </svg>,

  // Icon 2: Shield / Escrow Lock
  <svg
    key="2"
    className="w-8 h-8 text-white"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>,

  // Icon 3: Domain & Custom Themes
  <svg
    key="3"
    className="w-8 h-8 text-[#800A1D]"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>,
];

export default function Features() {
  return (
    <section
      id="features"
      className="py-16 md:py-24 px-6 sm:px-12 lg:px-16 xl:px-20 bg-[#EFEFEF] font-space-grotesk"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* Left Column - Section Title & Controls */}
        <div className="lg:col-span-4 flex flex-col justify-between">
          <div>
            <span className="inline-block text-xs font-bold text-[#800A1D] uppercase tracking-widest bg-[#FAD4D8] px-3 py-1 rounded-md mb-3">
              Built For Success
            </span>
            <h2 className="text-[#0A0E11] text-3xl sm:text-4xl lg:text-[40px] font-bold leading-[1.2] tracking-tight">
              Our Features <br />
              Special For Sellers
            </h2>
            <p className="text-[#666666] text-base sm:text-lg leading-relaxed mt-4 max-w-md">
              We provide merchants with all the tools needed to build, manage, and
              scale an independent online store with full trust and ease.
            </p>
          </div>

          {/* Indicator Pills */}
          <div className="flex items-center gap-2.5 mt-10 lg:mt-16">
            <div className="w-12 h-2.5 bg-[#800A1D] rounded-full transition-all duration-300" />
            <div className="w-7 h-2.5 bg-[#D1D5DB] rounded-full transition-all duration-300" />
            <div className="w-7 h-2.5 bg-[#D1D5DB] rounded-full transition-all duration-300" />
          </div>
        </div>

        {/* Right Column - Feature Cards Grid */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURE_CARDS.map((feature, index) => (
            <div
              key={index}
              className={`p-7 sm:p-8 rounded-2xl flex flex-col justify-between gap-12 transition-all duration-300 ${
                feature.isDark
                  ? "bg-[#0A0E11] text-white shadow-xl border border-neutral-800"
                  : "bg-white text-[#0A0E11] shadow-xs border border-neutral-200/60 hover:shadow-md"
              }`}
            >
              {/* Card Icon & Badge */}
              <div className="flex items-center justify-between w-full">
                <div className="w-12 h-12 flex items-center justify-start shrink-0">
                  {icons[index]}
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    feature.isDark
                      ? "bg-white/10 text-white/90 border border-white/20"
                      : "bg-[#FAD4D8] text-[#800A1D]"
                  }`}
                >
                  {feature.badge}
                </span>
              </div>

              {/* Card Content */}
              <div className="flex flex-col gap-3">
                <h3 className="font-bold text-xl sm:text-2xl tracking-tight leading-snug">
                  {feature.title}
                </h3>
                <p
                  className={`text-sm sm:text-base leading-relaxed ${
                    feature.isDark ? "text-[#AAAAAA]" : "text-[#666666]"
                  }`}
                >
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
