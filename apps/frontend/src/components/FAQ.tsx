"use client";

import React, { useState } from "react";
import { FAQS } from "@/constants/app.constants";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faqs"
      className="py-16 md:py-24 px-6 sm:px-12 lg:px-16 bg-bg-soft font-space-grotesk"
    >
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10 lg:gap-16">
        {/* Left - Heading */}
        <div className="lg:w-2/5 lg:sticky lg:top-10 self-start">
          <span className="inline-block text-xs font-bold text-primary uppercase tracking-widest bg-primary-light px-3 py-1 rounded-md mb-3">
            FAQs
          </span>
          <h2 className="text-text text-3xl sm:text-4xl lg:text-[40px] font-bold leading-[1.2] tracking-tight">
            Everything merchants ask us
          </h2>
          <p className="text-text/60 text-base sm:text-lg leading-relaxed mt-4 max-w-md">
            Straight answers about getting paid, going live, and growing your
            store on Hustlr.
          </p>
        </div>

        {/* Right - Accordion */}
        <div className="lg:w-3/5 flex flex-col divide-y divide-black/10 border-y border-black/10">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={faq.question}>
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center gap-4 sm:gap-6 py-5 sm:py-6 text-left cursor-pointer group"
                >
                  <span
                    className={`text-sm font-bold tabular-nums transition-colors ${
                      isOpen ? "text-primary" : "text-text/30 group-hover:text-primary/60"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`flex-1 font-semibold text-base sm:text-lg leading-snug transition-colors ${
                      isOpen ? "text-primary" : "text-text group-hover:text-primary"
                    }`}
                  >
                    {faq.question}
                  </span>
                  <svg
                    className={`w-5 h-5 shrink-0 transition-all duration-300 ${
                      isOpen ? "rotate-45 text-primary" : "text-text/40"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                  </svg>
                </button>

                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="pb-6 pl-10 sm:pl-12 pr-8 text-sm sm:text-base leading-relaxed text-text/60 max-w-xl">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
