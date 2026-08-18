"use client";

import React, { useState } from "react";
import Image from "next/image";
import StartStoreModal from "./StartStoreModal";

const DEMO_VIDEO_URL =
  "https://media.istockphoto.com/id/1405993999/video/vfx-animated-background-with-virtual-social-media-reality-interconnected-by-internet-into.mp4";

export default function WhoWeAre() {
  const [videoOpen, setVideoOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section className="py-16 md:py-24 px-6 sm:px-12 lg:px-16 xl:px-20 bg-white font-space-grotesk">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Side - Video Player Card */}
          <div className="lg:col-span-6 w-full">
            <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-black shadow-lg group">
              {/* Background Thumbnail Image */}
              <Image
                src="/video.jpg"
                alt="Watch how to setup your online store"
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                priority
              />

              {/* Dark Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />

              {/* Top-Left Tag */}
              <div className="absolute top-5 left-5 z-10">
                <span className="bg-[#800A1D] text-white text-xs font-semibold px-3 py-1 rounded-md shadow-xs">
                  Merchant Setup Demo
                </span>
              </div>

              {/* Center Play Button */}
              <button
                onClick={() => setVideoOpen(true)}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#800A1D]/80 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:scale-110 hover:bg-[#800A1D] transition-all duration-300 z-20 cursor-pointer shadow-lg"
                aria-label="Play video"
              >
                <svg
                  className="w-7 h-7 sm:w-9 sm:h-9 text-white ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>

              {/* Bottom Video Info & Progress Bar */}
              <div className="absolute bottom-4 left-5 right-5 z-10 flex flex-col gap-2">
                <h3 className="text-white text-xl sm:text-2xl font-bold tracking-tight mb-1">
                  How Musa launched his store in 3 mins
                </h3>

                {/* Progress bar scrubber */}
                <div className="flex items-center gap-3">
                  <svg
                    className="w-3.5 h-3.5 text-white/90 shrink-0"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <div className="w-full h-1.5 bg-white/30 rounded-full overflow-hidden">
                    <div className="w-2/5 h-full bg-[#800A1D] rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Text Content & Action */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <span className="inline-block text-xs font-bold text-[#800A1D] uppercase tracking-widest bg-[#FAD4D8] px-3 py-1 rounded-md mb-3">
              Merchant Platform Overview
            </span>

            <h2 className="text-[#0A0E11] text-3xl sm:text-4xl lg:text-[42px] font-bold leading-[1.18] tracking-tight">
              Built for African Merchants & <br className="hidden sm:inline" />
              Global E-Commerce Leaders
            </h2>

            <p className="text-[#666666] text-base sm:text-lg leading-relaxed mt-5 max-w-xl font-normal">
              Hustlr powers independent sellers with custom storefront templates,
              automated Paystack escrow security, variant management, and direct
              bank withdrawals. Experience hassle-free e-commerce designed for high
              conversion and total trust.
            </p>

            <div className="mt-8 flex flex-wrap gap-4 items-center">
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2.5 bg-[#800A1D] hover:bg-[#660817] text-white px-7 py-3.5 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 shadow-md group cursor-pointer"
              >
                <span>Start Your Store</span>
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
          </div>
        </div>
      </section>

      {/* Fullscreen Video Lightbox Overlay */}
      {videoOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-[fade-in_0.25s_ease]"
          onClick={() => setVideoOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Video player"
        >
          <button
            className="absolute top-6 right-8 text-3xl text-white bg-transparent border-none cursor-pointer leading-none opacity-80 hover:opacity-100 z-10"
            onClick={() => setVideoOpen(false)}
            aria-label="Close video"
          >
            ✕
          </button>
          <video
            className="w-full max-w-5xl max-h-[85vh] rounded-xl outline-none shadow-2xl"
            src={DEMO_VIDEO_URL}
            controls
            autoPlay
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <StartStoreModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
