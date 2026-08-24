"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import {
  FiCheck,
  FiCamera,
  FiUploadCloud,
  FiTrash2,
  FiRefreshCw,
  FiAlertCircle,
} from "react-icons/fi";
import { ClipLoader } from "react-spinners";
import { kycService } from "@/services/kyc.service";

interface StepSelfieProps {
  selfieUrl: string | null;
  setSelfieUrl: (url: string | null) => void;
  onNext: () => void;
  onBack: () => void;
}

const SELFIE_TIPS = [
  "Face the camera directly with your head upright",
  "Ensure good lighting and avoid shadows on your face",
  "Remove sunglasses, hats, or face coverings",
  "Keep a neutral facial expression",
];

export default function StepSelfie({
  selfieUrl,
  setSelfieUrl,
  onNext,
  onBack,
}: StepSelfieProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFile = async (file: File) => {
    setErrorMessage("");
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (JPG, PNG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image size must be less than 5MB.");
      return;
    }

    setIsUploading(true);
    try {
      const url = await kycService.uploadKycFile(file, "selfie");
      setSelfieUrl(url);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to upload selfie. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const isValid = selfieUrl !== null && !isUploading;

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      {/* Title Section */}
      <div className="space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
          Step 4 of 7
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold font-archivo tracking-tight text-neutral-900">
          Take a selfie
        </h1>
        <p className="text-sm text-neutral-500 font-normal">
          We match your live photo with the photo on your government ID to prevent identity theft.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
          <FiAlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleInputChange}
        className="hidden"
      />

      <div className="space-y-6 pt-2">
        {/* Selfie Framing Guide Circle */}
        <div className="flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl bg-neutral-50 border border-neutral-200/80">
          {selfieUrl ? (
            <div className="relative w-44 h-44 rounded-full overflow-hidden border-4 border-emerald-500 shadow-md">
              <Image
                src={selfieUrl}
                alt="Selfie preview"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="relative w-44 h-44 rounded-full border-4 border-dashed border-primary/40 bg-white flex flex-col items-center justify-center shadow-inner group hover:border-primary transition-colors">
              <div className="w-32 h-32 rounded-full bg-primary-light/25 flex items-center justify-center text-primary">
                <FiCamera className="w-12 h-12" />
              </div>
            </div>
          )}

          <div className="text-center pt-4 space-y-1">
            <p className="text-sm font-bold text-neutral-900">
              {selfieUrl ? "Selfie looks great!" : "Position your face in the circle"}
            </p>
            <p className="text-xs text-neutral-500 max-w-xs font-light">
              {selfieUrl
                ? "Your facial biometric photo is captured and verified."
                : "Make sure your face is clearly visible and within the frame."}
            </p>
          </div>

          {/* Trigger Button inside Guide */}
          <div className="pt-4 flex items-center gap-3">
            {selfieUrl ? (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <FiRefreshCw className="w-3.5 h-3.5" />
                  <span>Retake Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelfieUrl(null)}
                  className="px-4 py-2 rounded-full border border-red-200 bg-white hover:bg-red-50 text-red-600 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-6 py-3 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer active:scale-95"
              >
                {isUploading ? (
                  <>
                    <ClipLoader color="#FFFFFF" size={14} />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <FiCamera className="w-4 h-4" />
                    <span>Take / Upload Selfie</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Selfie Verification Tips Checklist */}
        {!selfieUrl && (
          <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-700">
              Tips for Fast Approval
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {SELFIE_TIPS.map((tip, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-xs text-neutral-600"
                >
                  <div className="w-4 h-4 rounded-full bg-primary-light/40 text-primary flex items-center justify-center shrink-0">
                    <FiCheck className="w-2.5 h-2.5 stroke-3" />
                  </div>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}
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
          Continue to Address Verification
        </button>
      </div>
    </div>
  );
}
