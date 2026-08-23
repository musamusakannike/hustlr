"use client";

import React from "react";
import { VerificationType } from "@/services/kyc.service";
import R2UploadBox from "../R2UploadBox";
import { FiShield } from "react-icons/fi";

interface StepDocumentUploadProps {
  verificationType: VerificationType | "";
  documentId: string;
  setDocumentId: (val: string) => void;
  idDocumentUrl: string | null;
  setIdDocumentUrl: (url: string | null) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepDocumentUpload({
  verificationType,
  documentId,
  setDocumentId,
  idDocumentUrl,
  setIdDocumentUrl,
  onNext,
  onBack,
}: StepDocumentUploadProps) {
  const getDocumentLabel = () => {
    switch (verificationType) {
      case "NIN":
        return "NIN (11-digit Number)";
      case "Driver's License":
        return "Driver's License Number";
      case "International Passport":
        return "Passport Number";
      case "Voter's Card":
        return "VIN / Voter's Card Number";
      default:
        return "Document ID Number";
    }
  };

  const getPlaceholder = () => {
    switch (verificationType) {
      case "NIN":
        return "e.g. 12345678901";
      case "Driver's License":
        return "e.g. AAA00000AA00";
      case "International Passport":
        return "e.g. A12345678";
      case "Voter's Card":
        return "e.g. 90F5B1234567890";
      default:
        return "Enter your document identification number";
    }
  };

  const isValid = documentId.trim().length >= 4 && idDocumentUrl !== null;

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      {/* Title Section */}
      <div className="space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
          Step 3 of 7
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold font-archivo tracking-tight text-neutral-900">
          {verificationType || "ID Document"} Details
        </h1>
        <p className="text-sm text-neutral-500 font-normal">
          Enter your {verificationType} number and upload a clear, legible photo of the original document.
        </p>
      </div>

      <div className="space-y-5 pt-2">
        {/* Document ID Number */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-neutral-700 tracking-wide">
            {getDocumentLabel()}
          </label>
          <div className="flex items-center h-12.5 px-4 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
            <input
              type="text"
              placeholder={getPlaceholder()}
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value.toUpperCase())}
              className="w-full h-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 outline-none uppercase font-mono tracking-wider"
              required
            />
          </div>
        </div>

        {/* Cloudflare R2 Upload Box */}
        <R2UploadBox
          label={`${verificationType || "Identity"} Document Image`}
          subtitle="Upload a clear color photo of your document. Ensure all 4 corners are visible and text is sharp."
          value={idDocumentUrl}
          onChange={setIdDocumentUrl}
          kind="idDocument"
        />

        {/* Security Notice */}
        <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-start gap-3 text-xs text-neutral-500 font-light leading-relaxed">
          <FiShield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <span>
            Your documents are encrypted end-to-end and stored in our PCI-DSS compliant Cloudflare R2 vaults. We never share your government ID with third parties.
          </span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="w-1/3 h-13 rounded-full border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-semibold text-sm transition-all cursor-pointer"
        >
          Back
        </button>

        <button
          type="button"
          disabled={!isValid}
          onClick={onNext}
          className={`flex-1 h-13 rounded-full font-bold text-sm sm:text-base flex items-center justify-center transition-all shadow-md ${
            isValid
              ? "bg-primary hover:bg-primary-hover text-white cursor-pointer active:scale-[0.99]"
              : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
          }`}
        >
          Continue to Selfie Verification
        </button>
      </div>
    </div>
  );
}
