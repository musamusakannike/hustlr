"use client";

import { useParams } from "next/navigation";
import { RefreshCw, ShieldCheck } from "lucide-react";
import { useStorefrontInfo } from "@/hooks/useStorefront";

export default function ReturnsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data } = useStorefrontInfo(slug);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="mb-8 pb-6 border-b"
        style={{ borderColor: "color-mix(in srgb, var(--store-text, #0A0E11) 10%, transparent)" }}
      >
        <span
          className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-2"
          style={{
            backgroundColor: "var(--store-accent, #FFEDE6)",
            color: "var(--store-primary, #E05315)",
          }}
        >
          STORE POLICIES
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--store-text,#0A0E11)] flex items-center gap-3">
          <RefreshCw className="w-8 h-8 text-[var(--store-primary,#E05315)]" />
          Returns & Refunds Policy
        </h1>
      </div>

      <div
        className="rounded-3xl p-6 sm:p-10 border bg-white shadow-xs flex flex-col gap-6"
        style={{
          backgroundColor: "var(--store-bg, #FFFFFF)",
          borderColor: "color-mix(in srgb, var(--store-text, #0A0E11) 10%, transparent)",
        }}
      >
        <div className="whitespace-pre-wrap text-sm sm:text-base text-[var(--store-text,#0A0E11)] opacity-85 leading-relaxed">
          {data?.returnPolicy ||
            "Items may be returned within 7 days of verified delivery if unused, in original packaging, or if defective. Contact support or open a dispute in your buyer account to initiate a refund."}
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-800 font-semibold">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Refunds are processed safely back to your original payment method via Paystack.</span>
        </div>
      </div>
    </div>
  );
}
