"use client";

import React from "react";
import { FiAlertCircle, FiShield } from "react-icons/fi";
import { ClipLoader } from "react-spinners";
import R2UploadBox from "../R2UploadBox";

interface StepBusinessCACProps {
  businessRegistrationUrl: string | null;
  setBusinessRegistrationUrl: (url: string | null) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  submitError: string;
}

export default function StepBusinessCAC({
  businessRegistrationUrl,
  setBusinessRegistrationUrl,
  onSubmit,
  onBack,
  isSubmitting,
  submitError,
}: StepBusinessCACProps) {
  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      {/* Title Section */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Step 7 of 7
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600">
            Optional
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-archivo tracking-tight text-neutral-900">
          Business registration (CAC)
        </h1>
        <p className="text-sm text-neutral-500 font-normal">
          If your business is officially registered with the CAC or local business authority, upload your certificate to get a Verified Merchant badge.
        </p>
      </div>

      {submitError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium flex items-start gap-2.5 animate-[shake_0.2s_ease-in-out]">
          <FiAlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      <div className="space-y-5 pt-2">
        {/* Cloudflare R2 Upload Box */}
        <R2UploadBox
          label="CAC / Business Registration Certificate"
          subtitle="Upload your CAC certificate, Business Name registration, or BN status report (PDF or Image)."
          value={businessRegistrationUrl}
          onChange={setBusinessRegistrationUrl}
          kind="businessRegistration"
          optional
        />

        {/* Info Card */}
        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-800">
            <FiShield className="w-4 h-4 text-primary" />
            <span>Why provide business registration?</span>
          </div>
          <p className="text-xs text-neutral-500 font-light leading-relaxed">
            Registered businesses receive priority verification, higher daily withdrawal limits, and a Verified Badge displayed on their customer storefront.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onSubmit}
          className="w-full h-13.5 rounded-full bg-primary hover:bg-primary-hover text-white font-bold text-sm sm:text-base flex items-center justify-center transition-all shadow-md active:scale-[0.99] cursor-pointer"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <ClipLoader color="#FFFFFF" size={18} />
              <span>Submitting KYC details...</span>
            </div>
          ) : (
            <span>Submit for Verification</span>
          )}
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onBack}
            className="w-1/3 h-12 rounded-full border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
          >
            Back
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onSubmit}
            className="flex-1 h-12 rounded-full border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
          >
            Skip CAC &amp; Submit
          </button>
        </div>
      </div>
    </div>
  );
}
