"use client";

import React from "react";
import Link from "next/link";
import { Check, ChevronRight, Loader2 } from "lucide-react";
import type { Store } from "@/types/store";
import type { Kyc } from "@/types/kyc";
import type { Subscription } from "@/types/subscription";
import { cn } from "@/lib/utils";

export interface OnboardingStep {
  id: string;
  label: string;
  description: string;
  href: string;
  isComplete: boolean;
}

export function buildOnboardingSteps(args: {
  store?: Store;
  kyc?: Kyc;
  subscription?: Subscription | null;
  hasProducts: boolean;
}): OnboardingStep[] {
  const { store, kyc, subscription, hasProducts } = args;
  return [
    {
      id: "setup",
      label: "Set up your store",
      description: "Name, subdomain URL, branding and store details",
      href: "/dashboard/setup",
      isComplete: Boolean(store?.name && store?.slug),
    },
    {
      id: "template",
      label: "Choose a template",
      description: "Pick the storefront design your buyers will see",
      href: "/dashboard/templates",
      isComplete: Boolean(store?.templateId),
    },
    {
      id: "products",
      label: "Add your first product",
      description: "List products with prices, photos and stock",
      href: "/dashboard/products/new",
      isComplete: hasProducts,
    },
    {
      id: "kyc",
      label: "Complete KYC verification",
      description: "Verify your identity so you can receive payouts",
      href: "/dashboard/kyc",
      isComplete: kyc?.status === "approved",
    },
    {
      id: "golive",
      label: "Subscribe & go live",
      description: "Choose a plan and publish your storefront",
      href: "/dashboard/billing",
      isComplete: subscription?.status === "active" && Boolean(store?.isLive),
    },
  ];
}

export default function OnboardingChecklist({
  steps,
  isLoading = false,
}: {
  steps: OnboardingStep[];
  isLoading?: boolean;
}) {
  const completed = steps.filter((s) => s.isComplete).length;
  const progress = steps.length ? Math.round((completed / steps.length) * 100) : 0;
  const nextStep = steps.find((s) => !s.isComplete);

  return (
    <section className="rounded-3xl bg-dark text-white p-6 sm:p-8 relative overflow-hidden border border-primary/40">
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, #FAD4D8 0, transparent 40%), radial-gradient(circle at 80% 70%, #800A1D 0, transparent 45%)",
        }}
      />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            <span className="inline-block text-xs font-bold text-primary uppercase tracking-widest bg-primary-light px-3 py-1 rounded-md mb-2">
              Getting Started
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              {completed === steps.length
                ? "Your store is fully set up 🎉"
                : `${completed} of ${steps.length} steps complete`}
            </h2>
            {nextStep && (
              <p className="text-sm text-neutral-300 mt-1">
                Next up: <span className="font-semibold text-white">{nextStep.label}</span>
              </p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="font-archivo text-3xl font-bold">{progress}%</p>
          </div>
        </div>

        <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-6">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <li
                  key={i}
                  className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-center gap-3"
                >
                  <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-3/4 rounded bg-white/10 animate-pulse" />
                    <div className="h-2 w-1/2 rounded bg-white/10 animate-pulse" />
                  </div>
                </li>
              ))
            : steps.map((step) => (
                <li key={step.id}>
                  <Link
                    href={step.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-2xl border p-4 transition-all h-full",
                      step.isComplete
                        ? "bg-white/5 border-success/40"
                        : "bg-white/5 border-white/10 hover:border-primary/60 hover:bg-white/10"
                    )}
                  >
                    <span
                      className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold",
                        step.isComplete
                          ? "bg-success text-white"
                          : "bg-primary text-white"
                      )}
                    >
                      {step.isComplete ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        steps.indexOf(step) + 1
                      )}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold truncate">
                        {step.label}
                      </span>
                      <span className="block text-xs text-neutral-400 truncate">
                        {step.description}
                      </span>
                    </span>
                    {!step.isComplete && (
                      <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors shrink-0" />
                    )}
                  </Link>
                </li>
              ))}
        </ol>
      </div>
    </section>
  );
}
