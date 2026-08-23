"use client";

import React from "react";
import Link from "next/link";
import { FiCheck, FiHelpCircle, FiChevronLeft } from "react-icons/fi";
import { APP_NAME } from "@/constants/app.constants";

export interface StepMilestone {
  id: string;
  title: string;
  shortDescription?: string;
}

interface MilestoneSidebarProps {
  steps: StepMilestone[];
  currentStepIndex: number;
  onSelectStep?: (index: number) => void;
  onBack?: () => void;
}

export default function MilestoneSidebar({
  steps,
  currentStepIndex,
  onSelectStep,
  onBack,
}: MilestoneSidebarProps) {
  const currentStep = steps[currentStepIndex] || steps[0];
  const totalSteps = steps.length;
  const displayStepNumber = Math.min(currentStepIndex + 1, totalSteps);

  return (
    <aside className="h-full flex flex-col justify-between p-8 lg:p-12 bg-linear-to-b from-white via-neutral-50/50 to-neutral-100/40 border-r border-neutral-200/80 select-none">
      {/* Top Header Section */}
      <div className="space-y-8">
        {/* Brand Bar / Back Trigger */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && currentStepIndex > 0 && (
              <button
                type="button"
                onClick={onBack}
                className="w-9 h-9 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 flex items-center justify-center text-neutral-700 transition-all shadow-xs cursor-pointer active:scale-95"
                aria-label="Go back"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
            )}
            <span className="font-archivo font-extrabold text-lg tracking-tight text-primary">
              {APP_NAME}
            </span>
          </div>

          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-light/40 text-primary">
            Seller KYC
          </span>
        </div>

        {/* Dynamic Step Header */}
        <div className="space-y-1.5 transition-all duration-300">
          <p className="text-xs sm:text-sm font-medium text-neutral-500 tracking-wide">
            Step {displayStepNumber}/{totalSteps}. {currentStep?.title}
          </p>
          <h2 className="text-xl lg:text-2xl font-bold font-archivo tracking-tight text-text">
            Identity Verification
          </h2>
        </div>

        {/* Milestone Steps List */}
        <nav className="space-y-4 pt-2" aria-label="Onboarding Progress">
          {steps.map((stepItem, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isActive = idx === currentStepIndex;
            const isUpcoming = idx > currentStepIndex;
            const canNavigate = isCompleted && onSelectStep;

            return (
              <div
                key={stepItem.id}
                onClick={() => canNavigate && onSelectStep(idx)}
                className={`group flex items-center gap-3.5 py-1.5 px-2 rounded-xl transition-all ${
                  canNavigate ? "cursor-pointer hover:bg-white/80" : ""
                }`}
              >
                {/* Milestone Marker Icon */}
                <div className="relative flex items-center justify-center shrink-0">
                  {isCompleted ? (
                    // Completed Green Checkmark (matching prompt Image 1)
                    <div className="w-6 h-6 rounded-full border-2 border-emerald-500 bg-emerald-50/50 flex items-center justify-center text-emerald-500 transition-all scale-100">
                      <FiCheck className="w-3.5 h-3.5 stroke-3" />
                    </div>
                  ) : isActive ? (
                    // Active Step Highlight Ring
                    <div className="w-6 h-6 rounded-full border-2 border-text flex items-center justify-center transition-all ring-4 ring-text/10">
                      <div className="w-2.5 h-2.5 rounded-full bg-text animate-pulse" />
                    </div>
                  ) : (
                    // Upcoming Subtle Ring
                    <div className="w-6 h-6 rounded-full border-2 border-neutral-300 group-hover:border-neutral-400 transition-all" />
                  )}
                </div>

                {/* Milestone Label */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm tracking-tight transition-colors ${
                      isActive
                        ? "font-bold text-text"
                        : isCompleted
                        ? "font-medium text-neutral-700 group-hover:text-text"
                        : "font-normal text-neutral-400"
                    }`}
                  >
                    {stepItem.title}
                  </p>
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Support & Security Card */}
      <div className="pt-8">
        <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800">
            <FiHelpCircle className="w-4 h-4 text-primary" />
            <span>Need Help with Verification?</span>
          </div>
          <p className="text-[11px] text-neutral-500 leading-relaxed">
            All details are securely encrypted and verified in compliance with financial regulations.
          </p>
          <div className="pt-1">
            <Link
              href="mailto:support@hustlr.shop"
              className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
            >
              Contact Support →
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
