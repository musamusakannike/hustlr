"use client";

import React from "react";
import { FiClock, FiX } from "react-icons/fi";

interface DraftModalProps {
  isOpen: boolean;
  onContinue: () => void;
  onStartFresh: () => void;
  onClose: () => void;
}

export default function DraftModal({
  isOpen,
  onContinue,
  onStartFresh,
  onClose,
}: DraftModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-[fade-in_0.2s_ease-out]">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-neutral-200 space-y-6 animate-[scale-up_0.2s_ease-out] relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          aria-label="Close"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-primary-light/40 flex items-center justify-center text-primary">
          <FiClock className="w-7 h-7" />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold font-archivo text-neutral-900">
            Continue where you left off?
          </h3>
          <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed font-light">
            You have a previously saved onboarding draft. Would you like to continue filling in your seller verification or start with a clean form?
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={onContinue}
            className="w-full h-12 rounded-full bg-primary hover:bg-primary-hover text-white font-bold text-sm transition-all shadow-md active:scale-[0.99] cursor-pointer"
          >
            Continue with draft
          </button>

          <button
            type="button"
            onClick={onStartFresh}
            className="w-full h-12 rounded-full border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-semibold text-sm transition-all active:scale-[0.99] cursor-pointer"
          >
            Start fresh
          </button>
        </div>
      </div>
    </div>
  );
}
