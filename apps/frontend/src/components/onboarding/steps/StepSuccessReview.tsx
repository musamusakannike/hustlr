"use client";

import React from "react";
import Link from "next/link";
import { FiCheck, FiArrowRight, FiMail, FiClock } from "react-icons/fi";

interface StepSuccessReviewProps {
  onGoToDashboard: () => void;
}

export default function StepSuccessReview({
  onGoToDashboard,
}: StepSuccessReviewProps) {
  return (
    <div className="text-center py-6 sm:py-10 space-y-8 animate-[fade-in_0.4s_ease-out] max-w-lg mx-auto">
      {/* Animated Concentric Checkmark Icon */}
      <div className="relative mx-auto w-28 h-28 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-emerald-100/60 animate-ping duration-1000 opacity-40" />
        <div className="absolute inset-2 rounded-full bg-emerald-100 flex items-center justify-center" />
        <div className="relative w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg transform transition-transform hover:scale-105">
          <FiCheck className="w-9 h-9 stroke-3" />
        </div>
      </div>

      {/* Text Headlines */}
      <div className="space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <FiClock className="w-3.5 h-3.5" />
          <span>Application Under Review</span>
        </span>

        <h1 className="text-2xl sm:text-4xl font-bold font-archivo tracking-tight text-neutral-900 leading-tight">
          We&apos;re reviewing your{"\n"}documents
        </h1>

        <p className="text-sm text-neutral-500 font-light leading-relaxed max-w-md mx-auto">
          Our compliance system is verifying your ID details and documents. This usually takes under 24 hours. We&apos;ll notify you via email as soon as a decision is made.
        </p>
      </div>

      {/* Dashboard Button */}
      <div className="pt-2 space-y-4">
        <button
          type="button"
          onClick={onGoToDashboard}
          className="w-full h-13.5 rounded-full bg-primary hover:bg-primary-hover text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer"
        >
          <span>Go to Merchant Dashboard</span>
          <FiArrowRight className="w-4 h-4" />
        </button>

        <div className="text-center text-xs text-neutral-400">
          <span>Questions about verification? </span>
          <Link
            href="mailto:support@hustlr.shop"
            className="font-semibold text-primary hover:text-primary-hover"
          >
            Contact Merchant Support
          </Link>
        </div>
      </div>
    </div>
  );
}
