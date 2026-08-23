import React from "react";
import { ECOSYSTEM_FEATURES } from "@/constants/app.constants";

const chipIcons: Record<string, React.ReactNode> = {
  template: (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </svg>
  ),
  site: (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  drop: (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-3.05 11a22.35 22.35 0 0 1-3.95 2z" />
    </svg>
  ),
  merch: (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41 13.42 20.6a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <circle cx="7" cy="7" r="1" />
    </svg>
  ),
  orders: (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
    </svg>
  ),
  dashboard: (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  growth: (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  ),
  payments: (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  ),
};

function Scribbles({ side }: { side: "left" | "right" }) {
  return (
    <div
      className="absolute inset-0 text-white/30 pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* Arrow */}
      <svg
        className={`absolute w-10 h-10 top-[12%] ${side === "left" ? "left-[18%] -rotate-12" : "right-[20%] rotate-16"}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 19 19 5M19 5h-7M19 5v7" />
      </svg>

      {/* Star */}
      <svg
        className={`absolute w-8 h-8 top-[24%] ${side === "left" ? "right-[22%] rotate-12" : "left-[24%] -rotate-12"}`}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z" />
      </svg>

      {/* Squiggle */}
      <svg
        className={`absolute w-16 h-10 top-[44%] ${side === "left" ? "left-[24%] rotate-6" : "right-[26%] -rotate-6"}`}
        viewBox="0 0 60 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 14c4-10 8-10 12 0s8 10 12 0 8-10 12 0" />
      </svg>

      {/* Plus */}
      <svg
        className={`absolute w-6 h-6 top-[62%] ${side === "left" ? "right-[30%] rotate-12" : "left-[32%] -rotate-12"}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>

      {/* Circle scribble */}
      <svg
        className={`absolute w-12 h-12 top-[74%] ${side === "left" ? "left-[20%] -rotate-16" : "right-[18%] rotate-12"}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M21 12a9 9 0 1 1-3-6.7" />
        <path d="M21 3v5h-5" />
      </svg>

      {/* Zigzag */}
      <svg
        className={`absolute w-14 h-8 top-[88%] ${side === "left" ? "right-[26%] rotate-3" : "left-[28%] -rotate-3"}`}
        viewBox="0 0 46 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 13.5 8.5 3.5 15 13.5 21.5 3.5 28 13.5 34.5 3.5 41 13.5" />
      </svg>
    </div>
  );
}

const MOBILE_CHIP_COUNT = 5;

export default function Ecosystem() {
  const mobileFeatures = ECOSYSTEM_FEATURES.slice(0, MOBILE_CHIP_COUNT);
  const mobileAngleStep = 360 / MOBILE_CHIP_COUNT;

  return (
    <section
      id="ecosystem"
      className="relative py-12 md:py-16 font-space-grotesk overflow-hidden bg-light"
    >
      {/* Red side panels with scribbles — desktop only */}
      <div className="hidden lg:flex absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="w-1/4 h-full bg-primary relative overflow-hidden">
          <Scribbles side="left" />
        </div>
        <div className="w-1/2 h-full" />
        <div className="w-1/4 h-full bg-primary relative overflow-hidden">
          <Scribbles side="right" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 flex flex-col items-center">
        {/* Section Heading */}
        <span className="inline-block text-xs font-bold text-primary uppercase tracking-widest bg-primary-light px-3 py-1 rounded-md mb-3">
          One Ecosystem
        </span>
        <h2 className="text-text text-3xl sm:text-4xl lg:text-[40px] font-bold leading-[1.2] tracking-tight text-center">
          Build your brand on Hustlr
        </h2>
        <p className="text-text/60 text-base sm:text-lg leading-relaxed mt-4 max-w-xl text-center">
          Everything you need to launch, sell, and grow — revolving around a
          single home for your brand.
        </p>

        {/* Orbit — 5 chips below sm, 8 chips from sm up */}
        <div className="orbit-stage relative mt-8 sm:mt-10 flex items-center justify-center">
          {/* Center Text */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center px-4">
            <span className="font-archivo text-lg sm:text-2xl lg:text-3xl text-primary tracking-tight">
              One ecosystem
            </span>
          </div>

          {/* Rotating Ring — mobile (5 chips) */}
          <div className="orbit-ring absolute inset-0 sm:hidden">
            {mobileFeatures.map((feature, index) => {
              const angle = index * mobileAngleStep - 90;
              return (
                <div
                  key={feature.label}
                  className="absolute left-1/2 top-1/2"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${angle}deg) translate(var(--orbit-r)) rotate(${-angle}deg)`,
                  }}
                >
                  <div className="orbit-chip">
                    <div className="group flex items-center gap-1 bg-light text-text border border-black/10 rounded-full p-1.5 shadow-xs whitespace-nowrap hover:bg-primary hover:text-white hover:border-primary hover:shadow-md transition-all duration-200">
                      <span className="w-3.5 h-3.5 text-primary group-hover:text-white shrink-0">
                        {chipIcons[feature.iconType]}
                      </span>
                      <span className="text-[9px] font-semibold tracking-tight">
                        {feature.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rotating Ring — sm and up (8 chips) */}
          <div className="orbit-ring absolute inset-0 hidden sm:block">
            {ECOSYSTEM_FEATURES.map((feature, index) => {
              const angle = index * 45 - 90;
              return (
                <div
                  key={feature.label}
                  className="absolute left-1/2 top-1/2"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${angle}deg) translate(var(--orbit-r)) rotate(${-angle}deg)`,
                  }}
                >
                  <div className="orbit-chip">
                    <div className="group flex items-center gap-1.5 sm:gap-2 bg-light text-text border border-black/10 rounded-full p-1.5 sm:pl-3 sm:pr-4 sm:py-2 shadow-xs whitespace-nowrap hover:bg-primary hover:text-white hover:border-primary hover:shadow-md transition-all duration-200">
                      <span className="w-4 h-4 sm:w-5 sm:h-5 text-primary group-hover:text-white shrink-0">
                        {chipIcons[feature.iconType]}
                      </span>
                      <span className="text-[10px] sm:text-xs font-semibold tracking-tight">
                        {feature.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
