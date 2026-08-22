"use client";

import React, { useState } from "react";
import Image from "next/image";
import StartStoreModal from "./StartStoreModal";
import { STORE_TEMPLATES } from "@/constants/app.constants";

export default function StoreTemplates() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Hidden SVG Definition for Starburst Mask */}
      <svg className="absolute w-0 h-0 overflow-hidden" aria-hidden="true">
        <defs>
          <clipPath id="starburst-clip" clipPathUnits="objectBoundingBox">
            <path d="M 0.5,0 C 0.58,0.22 0.78,0.42 1,0.5 C 0.78,0.58 0.58,0.78 0.5,1 C 0.42,0.78 0.22,0.58 0,0.5 C 0.22,0.42 0.42,0.22 0.5,0 Z" />
          </clipPath>
        </defs>
      </svg>

      <section
        id="templates"
        className="py-16 md:py-24 px-6 sm:px-12 lg:px-16 xl:px-20 bg-white font-space-grotesk"
      >
        <div className="max-w-7xl mx-auto flex flex-col gap-12 lg:gap-16">
          {/* Section Header */}
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <span className="inline-block text-xs font-bold text-primary uppercase tracking-widest bg-primary-light px-3.5 py-1 rounded-md mb-3">
              Storefront Themes
            </span>
            <h2 className="text-[#0A0E11] text-3xl sm:text-4xl lg:text-[42px] font-bold leading-[1.2] tracking-tight">
              Website Templates Built for Conversion
            </h2>
            <p className="text-[#666666] text-base sm:text-lg leading-relaxed mt-3">
              Choose from dynamic, responsive themes tailored by colors, logos,
              and custom CSS variables.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {STORE_TEMPLATES.map((tmpl, index) => {
              const isDarkCenterCard = index === 1;

              if (isDarkCenterCard) {
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#0A0E11] rounded-3xl p-6 sm:p-7 flex flex-col justify-between h-full min-h-[480px] shadow-xl relative group text-white cursor-pointer hover:shadow-2xl transition-all duration-300 border border-neutral-800"
                  >
                    {/* Center Starburst Image */}
                    <div className="relative w-full aspect-square my-auto flex items-center justify-center p-2">
                      <div
                        className="w-full h-full relative"
                        style={{
                          clipPath: "url(#starburst-clip)",
                          WebkitClipPath: "url(#starburst-clip)",
                        }}
                      >
                        <Image
                          src={tmpl.image}
                          alt={tmpl.name}
                          fill
                          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          priority
                        />
                      </div>
                    </div>

                    {/* Bottom Info Row */}
                    <div className="flex items-end justify-between mt-4">
                      <div>
                        <span className="inline-block px-3.5 py-1 text-xs font-semibold text-white/90 border border-white/30 rounded-full mb-3 bg-primary">
                          {tmpl.tier}
                        </span>
                        <h3 className="text-white text-2xl sm:text-3xl font-bold tracking-tight leading-snug">
                          {tmpl.name}
                        </h3>
                      </div>

                      <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform shadow-md ml-3">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M7 17L17 7M17 7H7M17 7V17"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={tmpl.id}
                  onClick={() => setIsModalOpen(true)}
                  className="bg-[#EFEFEF] rounded-3xl p-6 sm:p-7 flex flex-col justify-between h-full min-h-[480px] shadow-xs relative group text-[#0A0E11] cursor-pointer hover:shadow-md transition-all duration-300 border border-neutral-200/80"
                >
                  {/* Top Info Row */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-block px-3.5 py-1 text-xs font-semibold text-primary border border-primary/30 rounded-full mb-3 bg-white">
                        {tmpl.tier}
                      </span>
                      <h3 className="text-[#0A0E11] text-2xl sm:text-3xl font-bold tracking-tight leading-snug">
                        {tmpl.name}
                      </h3>
                    </div>

                    <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform shadow-xs ml-3 border border-neutral-200">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7 17L17 7M17 7H7M17 7V17"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Bottom Image Container */}
                  <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mt-6 shadow-sm border border-neutral-200">
                    <Image
                      src={tmpl.image}
                      alt={tmpl.name}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      priority
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <StartStoreModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
