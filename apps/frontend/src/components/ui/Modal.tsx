"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl";
  hideCloseButton?: boolean;
  children: React.ReactNode;
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  size = "md",
  hideCloseButton = false,
  children,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-space-grotesk"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={cn(
          "bg-white rounded-3xl w-full p-6 sm:p-8 shadow-2xl relative overflow-y-auto max-h-[90vh] text-text",
          sizeClasses[size]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {!hideCloseButton && (
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-black transition-colors cursor-pointer z-10"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {title && (
          <div className="mb-5 pr-8">
            <h3 className="font-bold text-xl text-text tracking-tight">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-muted mt-1">{description}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
