"use client";

import React, { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import R2UploadBox from "../R2UploadBox";

const PROOF_OF_ADDRESS_DOC_TYPES = [
  "Utility bill (Electricity or Water)",
  "Bank statement (Last 3 months)",
  "Tenancy agreement / Lease",
  "Waste / Municipal tax bill",
];

interface StepAddressProps {
  address: string;
  setAddress: (val: string) => void;
  proofOfAddressUrl: string | null;
  setProofOfAddressUrl: (url: string | null) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepAddress({
  address,
  setAddress,
  proofOfAddressUrl,
  setProofOfAddressUrl,
  onNext,
  onBack,
}: StepAddressProps) {
  const [docType, setDocType] = useState(PROOF_OF_ADDRESS_DOC_TYPES[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const isValid = address.trim().length >= 5 && proofOfAddressUrl !== null;

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      {/* Title Section matching prompt reference image */}
      <div className="space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
          Step 5 of 7
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold font-archivo tracking-tight text-neutral-900">
          Confirm your address
        </h1>
        <p className="text-sm text-neutral-500 font-normal">
          Provide your current physical residential or registered business address along with supporting documentation.
        </p>
      </div>

      <div className="space-y-5 pt-2">
        {/* Residential Address Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-neutral-700 tracking-wide">
            Residential / Business Address
          </label>
          <div className="rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all p-3">
            <textarea
              rows={3}
              placeholder="e.g. 14 Admiralty Way, Lekki Phase 1, Lagos, Nigeria"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 outline-none resize-none"
              required
            />
          </div>
        </div>

        {/* Select Document Type Dropdown (matching prompt Image 2) */}
        <div className="space-y-1.5 relative">
          <label className="block text-xs font-semibold text-neutral-700 tracking-wide">
            Select document type
          </label>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between h-12.5 px-4 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-left cursor-pointer"
          >
            <span className="text-sm font-medium text-neutral-900">
              {docType}
            </span>
            <FiChevronDown className="w-4 h-4 text-neutral-400" />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-neutral-200 rounded-xl shadow-lg z-20 py-1 overflow-hidden animate-[fade-in_0.15s_ease-out]">
              {PROOF_OF_ADDRESS_DOC_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setDocType(type);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs transition-colors hover:bg-neutral-50 ${
                    docType === type
                      ? "text-primary font-bold bg-primary-light/20"
                      : "text-neutral-700 font-normal"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cloudflare R2 Upload Box (matching prompt Image 2) */}
        <R2UploadBox
          label="Proof of Address Document"
          subtitle={`Upload a clear photo or PDF of your ${docType.toLowerCase()} issued within the last 3 months.`}
          value={proofOfAddressUrl}
          onChange={setProofOfAddressUrl}
          kind="proofOfAddress"
        />
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
          Continue to Payout Details
        </button>
      </div>
    </div>
  );
}
