"use client";

import React, { useState } from "react";
import StartStoreModal from "./StartStoreModal";

export default function CTA() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section className="relative z-20 max-w-6xl mx-auto px-6 font-space-grotesk -mb-24 sm:-mb-32 md:-mb-36">
        <div className="bg-[#800A1D] rounded-3xl sm:rounded-[32px] py-12 px-6 sm:py-16 sm:px-12 md:py-20 md:px-16 text-center text-white flex flex-col items-center justify-center shadow-2xl">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-3 sm:mb-4">
            Ready to Launch Your Online Store Today?
          </h2>

          <p className="text-white/80 text-base sm:text-lg leading-relaxed max-w-lg mb-8 sm:mb-10 font-normal">
            Join thousands of African merchants building independent e-commerce brands
            with zero technical hassle.
          </p>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-[#0A0E11] hover:bg-neutral-900 text-white px-8 py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 shadow-md group cursor-pointer"
          >
            <span>Create Your Free Store Now</span>
            <svg
              className="w-4 h-4 ml-0.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
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
          </button>
        </div>
      </section>

      <StartStoreModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
