"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  FiUploadCloud,
  FiFileText,
  FiCheckCircle,
  FiTrash2,
  FiRefreshCw,
  FiAlertCircle,
} from "react-icons/fi";
import { ClipLoader } from "react-spinners";
import { kycService } from "@/services/kyc.service";

interface R2UploadBoxProps {
  label: string;
  subtitle?: string;
  value: string | null;
  onChange: (url: string | null) => void;
  kind?: "idDocument" | "selfie" | "proofOfAddress" | "businessRegistration" | "document";
  optional?: boolean;
  acceptedTypes?: string[];
  maxSizeMb?: number;
}

export default function R2UploadBox({
  label,
  subtitle,
  value,
  onChange,
  kind = "document",
  optional = false,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  maxSizeMb = 5,
}: R2UploadBoxProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFile = async (file: File) => {
    setErrorMessage("");

    // Validate type
    if (!acceptedTypes.includes(file.type)) {
      setErrorMessage("Please upload a supported file type (JPG, PNG, WEBP, or PDF).");
      return;
    }

    // Validate size
    if (file.size > maxSizeMb * 1024 * 1024) {
      setErrorMessage(`File size exceeds maximum limit of ${maxSizeMb}MB.`);
      return;
    }

    setIsUploading(true);
    try {
      const uploadedUrl = await kycService.uploadKycFile(file, kind);
      onChange(uploadedUrl);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to upload image. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const isPdf = value?.toLowerCase().endsWith(".pdf");

  return (
    <div className="space-y-2">
      {/* Header Label */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-neutral-800">
          {label}
          {optional && (
            <span className="ml-1.5 text-xs font-normal text-primary">
              (Optional)
            </span>
          )}
        </label>
      </div>

      {subtitle && (
        <p className="text-xs text-neutral-500 font-normal leading-relaxed">
          {subtitle}
        </p>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
          <FiAlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(",")}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Uploaded State Box */}
      {value ? (
        <div className="relative group rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs transition-all hover:border-neutral-300 flex items-center gap-4">
          {/* Thumbnail / Document Preview */}
          <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 flex items-center justify-center relative">
            {isPdf ? (
              <div className="flex flex-col items-center justify-center text-primary">
                <FiFileText className="w-8 h-8" />
                <span className="text-[10px] font-bold mt-1">PDF</span>
              </div>
            ) : (
              <Image
                src={value}
                alt={label}
                fill
                className="object-cover"
                unoptimized
              />
            )}
          </div>

          {/* Details & Actions */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-semibold mb-1">
              <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Uploaded successfully</span>
            </div>
            <p className="text-xs text-neutral-500 truncate max-w-xs">
              {value.split("/").pop()}
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">
              Stored securely on Cloudflare R2
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="p-2 rounded-lg border border-neutral-200 text-neutral-600 hover:text-primary hover:border-primary/30 hover:bg-primary-light/20 transition-all cursor-pointer"
              title="Replace document"
              aria-label="Replace file"
            >
              <FiRefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              disabled={isUploading}
              className="p-2 rounded-lg border border-neutral-200 text-neutral-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all cursor-pointer"
              title="Remove document"
              aria-label="Remove file"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Upload Trigger Dropzone */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`relative rounded-2xl border-2 border-dashed transition-all p-8 flex flex-col items-center justify-center text-center cursor-pointer select-none ${
            isDragging
              ? "border-primary bg-primary-light/20 scale-[0.99]"
              : "border-neutral-200 hover:border-primary/50 bg-neutral-50/50 hover:bg-neutral-50"
          }`}
        >
          {isUploading ? (
            <div className="py-4 flex flex-col items-center justify-center space-y-3">
              <ClipLoader color="var(--color-primary, #800A1D)" size={32} />
              <p className="text-xs font-semibold text-neutral-700">
                Uploading to secure storage...
              </p>
              <p className="text-[11px] text-neutral-400">
                Encrypting and uploading file
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-3">
              {/* Illustrated Icon matching prompt reference */}
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs group-hover:scale-105 transition-transform">
                <svg
                  className="w-8 h-8 text-blue-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                  <path d="M12 12v9" />
                  <path d="m16 16-4-4-4 4" />
                </svg>
              </div>

              {/* Title & Trigger */}
              <div className="space-y-1">
                <p className="text-sm font-medium text-neutral-700">
                  Drag file here to upload or{" "}
                  <span className="font-semibold text-primary underline underline-offset-2">
                    choose file
                  </span>
                </p>
                <p className="text-[11px] text-neutral-400">
                  Max file size: {maxSizeMb}MB (JPG, PNG, WEBP, or PDF)
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
