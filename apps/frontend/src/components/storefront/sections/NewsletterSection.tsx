"use client";

import React, { useState } from "react";
import { Check, Mail } from "lucide-react";
import type { NewsletterSectionData } from "@/types/storefront";

interface NewsletterSectionProps {
  data: NewsletterSectionData;
}

export default function NewsletterSection({ data }: NewsletterSectionProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setSubmitted(true);
  };

  return (
    <section className="py-14 sm:py-18 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div
        className="rounded-3xl p-8 sm:p-12 border shadow-xs text-center flex flex-col items-center gap-4 transition-colors"
        style={{
          backgroundColor: "color-mix(in srgb, var(--store-bg, #FFFFFF) 96%, var(--store-text, #0A0E11) 2%)",
          borderColor: "color-mix(in srgb, var(--store-text, #0A0E11) 10%, transparent)",
        }}
      >
        {data.badge && (
          <span
            className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
            style={{
              backgroundColor: "var(--store-accent, #FFEDE6)",
              color: "var(--store-primary, #E05315)",
            }}
          >
            {data.badge}
          </span>
        )}

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--store-text,#0A0E11)]">
          {data.heading}
        </h2>

        {data.subheading && (
          <p className="text-sm sm:text-base text-[var(--store-text,#0A0E11)] opacity-75 max-w-xl leading-relaxed">
            {data.subheading}
          </p>
        )}

        {submitted ? (
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm sm:text-base py-3 px-6 rounded-full bg-emerald-50 border border-emerald-200 mt-2">
            <Check className="w-5 h-5 stroke-[3]" />
            Thank you for subscribing! Check your inbox soon.
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md mt-3"
          >
            <div className="relative w-full">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 text-[var(--store-text,#0A0E11)]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={data.placeholder || "Enter your email address"}
                className="w-full pl-11 pr-4 py-3.5 rounded-full text-sm border bg-white focus:outline-none focus:ring-2 shadow-xs"
                style={{
                  borderColor: "color-mix(in srgb, var(--store-text, #0A0E11) 15%, transparent)",
                  color: "var(--store-text, #0A0E11)",
                }}
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full font-bold text-sm text-white shrink-0 shadow-sm transition-all hover:opacity-95 active:scale-[0.98]"
              style={{ backgroundColor: "var(--store-primary, #E05315)" }}
            >
              {data.buttonText || "Subscribe"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
