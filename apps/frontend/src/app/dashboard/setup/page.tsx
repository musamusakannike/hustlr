"use client";

import React, { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Stepper from "@/components/ui/Stepper";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useSetupStore, useStore } from "@/hooks/useStore";
import { getErrorMessage } from "@/lib/utils";
import { PENDING_STORE_KEY } from "@/constants/app.constants";
import BasicsStep from "@/components/dashboard/setup/BasicsStep";
import BrandingStep from "@/components/dashboard/setup/BrandingStep";
import ContactStep from "@/components/dashboard/setup/ContactStep";
import SeoPoliciesStep from "@/components/dashboard/setup/SeoPoliciesStep";

const STEPS = [
  { id: "basics", label: "Basics" },
  { id: "branding", label: "Branding" },
  { id: "contact", label: "Contact & Social" },
  { id: "seo", label: "SEO & Policies" },
];

function SetupWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { data: store, isLoading } = useStore();
  const setup = useSetupStore();

  const stepIndex = Math.min(
    STEPS.findIndex((s) => s.id === searchParams.get("step")) === -1
      ? 0
      : STEPS.findIndex((s) => s.id === searchParams.get("step")),
    STEPS.length - 1
  );

  const pendingStoreName = useMemo(() => {
    try {
      return window.sessionStorage.getItem(PENDING_STORE_KEY);
    } catch {
      return null;
    }
  }, []);

  const goToStep = (index: number) => {
    router.replace(
      `/dashboard/setup?step=${STEPS[index].id}`,
      { scroll: false }
    );
  };

  const handleSave = (input: Parameters<typeof setup.mutate>[0]) => {
    setup.mutate(input, {
      onSuccess: () => {
        if (stepIndex < STEPS.length - 1) {
          toast("Progress saved.", "success");
          goToStep(stepIndex + 1);
        } else {
          toast("Store setup complete!", "success");
          router.push("/dashboard/templates");
        }
      },
      onError: (err) => toast(getErrorMessage(err), "error"),
    });
  };

  if (isLoading || !store) {
    return <Spinner size="lg" label="Loading store settings…" />;
  }

  return (
    <div className="flex flex-col gap-6">
      <Stepper steps={STEPS} currentStep={stepIndex} onStepClick={goToStep} />

      <Card className="p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold tracking-tight">
            {stepIndex === 0 && "Store basics"}
            {stepIndex === 1 && "Branding & theme"}
            {stepIndex === 2 && "Contact & social"}
            {stepIndex === 3 && "SEO & policies"}
          </h2>
          <p className="text-sm text-muted mt-1">
            Progress is saved at every step — you can come back anytime.
          </p>
        </div>

        {stepIndex === 0 && (
          <BasicsStep
            store={store}
            pendingStoreName={pendingStoreName}
            onSave={handleSave}
            saving={setup.isPending}
          />
        )}
        {stepIndex === 1 && (
          <BrandingStep store={store} onSave={handleSave} saving={setup.isPending} />
        )}
        {stepIndex === 2 && (
          <ContactStep store={store} onSave={handleSave} saving={setup.isPending} />
        )}
        {stepIndex === 3 && (
          <SeoPoliciesStep store={store} onSave={handleSave} saving={setup.isPending} />
        )}

        <div className="flex items-center justify-between gap-3 mt-8 pt-6 border-t border-border">
          <Button
            variant="ghost"
            onClick={() => goToStep(Math.max(0, stepIndex - 1))}
            disabled={stepIndex === 0}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            {stepIndex < STEPS.length - 1 && (
              <Button
                variant="outline"
                onClick={() => goToStep(stepIndex + 1)}
              >
                Skip for now
              </Button>
            )}
            <Button
              form="setup-step-form"
              type="submit"
              loading={setup.isPending}
            >
              {stepIndex === STEPS.length - 1 ? (
                <>
                  Finish Setup
                  <Check className="w-4 h-4" />
                </>
              ) : (
                <>
                  Save & Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function SetupPage() {
  return (
    <Suspense>
      <SetupWizard />
    </Suspense>
  );
}
