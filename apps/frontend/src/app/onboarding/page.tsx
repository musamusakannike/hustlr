"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ClipLoader } from "react-spinners";
import { FiChevronLeft } from "react-icons/fi";
import MilestoneSidebar, { StepMilestone } from "@/components/onboarding/MilestoneSidebar";
import DraftModal from "@/components/onboarding/DraftModal";
import StepStoreDetails from "@/components/onboarding/steps/StepStoreDetails";
import StepPersonalInfo from "@/components/onboarding/steps/StepPersonalInfo";
import StepDocumentUpload from "@/components/onboarding/steps/StepDocumentUpload";
import StepSelfie from "@/components/onboarding/steps/StepSelfie";
import StepAddress from "@/components/onboarding/steps/StepAddress";
import StepBankPayout from "@/components/onboarding/steps/StepBankPayout";
import StepBusinessCAC from "@/components/onboarding/steps/StepBusinessCAC";
import StepSuccessReview from "@/components/onboarding/steps/StepSuccessReview";
import { CountryItem, SUPPORTED_COUNTRIES } from "@/components/onboarding/CountryPickerModal";
import { kycService, VerificationType, IBankDetails } from "@/services/kyc.service";
import { storeService } from "@/services/store.service";
import { useSellerAuth } from "@/context/SellerAuthContext";

const DRAFT_STORAGE_KEY = "hustlr_kyc_draft";

const STEPS: StepMilestone[] = [
  { id: "store", title: "Store Details", shortDescription: "Store name & category" },
  { id: "identity", title: "Personal Information", shortDescription: "Your name & ID type" },
  { id: "document", title: "Document Upload", shortDescription: "Government ID photo" },
  { id: "selfie", title: "Take a Selfie", shortDescription: "Live facial matching" },
  { id: "address", title: "Address Verification", shortDescription: "Address & utility bill" },
  { id: "bank", title: "Payout Bank Account", shortDescription: "Settlement account" },
  { id: "cac", title: "Business Registration", shortDescription: "CAC certificate (Optional)" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useSellerAuth();

  // Loading and flow state
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showDraftModal, setShowDraftModal] = useState(false);

  // --- Step 1 Form State (Store Profile) ---
  const [storeName, setStoreName] = useState("");
  const [country, setCountry] = useState<CountryItem | null>(SUPPORTED_COUNTRIES[0]);
  const [categories, setCategories] = useState<string[]>([]);

  // --- Step 2 Form State (Personal Info) ---
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otherName, setOtherName] = useState("");
  const [verificationType, setVerificationType] = useState<VerificationType | "">("NIN");

  // --- Step 3 Form State (Document Upload) ---
  const [documentId, setDocumentId] = useState("");
  const [idDocumentUrl, setIdDocumentUrl] = useState<string | null>(null);

  // --- Step 4 Form State (Selfie) ---
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);

  // --- Step 5 Form State (Address) ---
  const [address, setAddress] = useState("");
  const [proofOfAddressUrl, setProofOfAddressUrl] = useState<string | null>(null);

  // --- Step 6 Form State (Bank Payout) ---
  const [bankDetails, setBankDetails] = useState<IBankDetails>({
    bankName: "",
    bankCode: "",
    accountNumber: "",
    accountName: "",
  });

  // --- Step 7 Form State (CAC) ---
  const [businessRegistrationUrl, setBusinessRegistrationUrl] = useState<string | null>(null);

  // Load existing KYC & Draft on mount
  useEffect(() => {
    let isMounted = true;

    (async () => {
      // If user is not authenticated, redirect to login
      const token = typeof window !== "undefined" ? localStorage.getItem("hustlr_token") : null;
      if (!token) {
        router.replace("/auth/login");
        return;
      }

      try {
        const [kyc, store] = await Promise.all([
          kycService.getMyKyc(),
          storeService.getMyStore(),
        ]);

        if (!isMounted) return;

        if (kyc) {
          if (kyc.status === "pending") {
            setCurrentStepIndex(7); // Show in-review celebration
            setInitialLoading(false);
            return;
          }

          if (kyc.status === "approved" && store && store.name && store.name !== "My Store") {
            router.replace("/dashboard");
            return;
          }

          // Pre-fill existing server data
          if (kyc.firstName) setFirstName(kyc.firstName);
          if (kyc.lastName) setLastName(kyc.lastName);
          if (kyc.otherName) setOtherName(kyc.otherName);
          if (kyc.verificationType) setVerificationType(kyc.verificationType);
          if (kyc.documentId) setDocumentId(kyc.documentId);
          if (kyc.idDocumentUrl) setIdDocumentUrl(kyc.idDocumentUrl);
          if (kyc.selfieUrl) setSelfieUrl(kyc.selfieUrl);
          if (kyc.address) setAddress(kyc.address);
          if (kyc.proofOfAddressUrl) setProofOfAddressUrl(kyc.proofOfAddressUrl);
          if (kyc.businessRegistrationUrl) setBusinessRegistrationUrl(kyc.businessRegistrationUrl);
          if (kyc.bankDetails) setBankDetails(kyc.bankDetails);
        }

        if (store) {
          if (store.name && store.name !== "My Store") setStoreName(store.name);
          if (store.country) setCountry(store.country as CountryItem);
          if (store.categories) setCategories(store.categories);
        }

        // Check local draft
        const storedDraft = typeof window !== "undefined" ? localStorage.getItem(DRAFT_STORAGE_KEY) : null;
        if (storedDraft && kyc?.status !== "pending" && kyc?.status !== "approved") {
          try {
            const parsed = JSON.parse(storedDraft);
            if (
              parsed.storeName ||
              parsed.firstName ||
              parsed.documentId ||
              parsed.idDocumentUrl ||
              parsed.bankDetails?.accountNumber
            ) {
              setShowDraftModal(true);
            }
          } catch {
            // ignore JSON parse error
          }
        }
      } catch {
        // Fallback silently
      } finally {
        if (isMounted) setInitialLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [router]);

  // Restore Draft Action
  const handleRestoreDraft = () => {
    try {
      const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (stored) {
        const d = JSON.parse(stored);
        if (d.storeName) setStoreName(d.storeName);
        if (d.country) setCountry(d.country);
        if (d.categories) setCategories(d.categories);
        if (d.firstName) setFirstName(d.firstName);
        if (d.lastName) setLastName(d.lastName);
        if (d.otherName) setOtherName(d.otherName);
        if (d.verificationType) setVerificationType(d.verificationType);
        if (d.documentId) setDocumentId(d.documentId);
        if (d.idDocumentUrl) setIdDocumentUrl(d.idDocumentUrl);
        if (d.selfieUrl) setSelfieUrl(d.selfieUrl);
        if (d.address) setAddress(d.address);
        if (d.proofOfAddressUrl) setProofOfAddressUrl(d.proofOfAddressUrl);
        if (d.bankDetails) setBankDetails(d.bankDetails);
        if (d.businessRegistrationUrl) setBusinessRegistrationUrl(d.businessRegistrationUrl);
        if (typeof d.currentStepIndex === "number") setCurrentStepIndex(d.currentStepIndex);
      }
    } catch {}
    setShowDraftModal(false);
  };

  // Clear Draft / Start Fresh Action
  const handleStartFresh = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {}
    setShowDraftModal(false);
  };

  // Save draft whenever form state updates
  useEffect(() => {
    if (initialLoading || showDraftModal || currentStepIndex >= 7) return;

    const draftData = {
      currentStepIndex,
      storeName,
      country,
      categories,
      firstName,
      lastName,
      otherName,
      verificationType,
      documentId,
      idDocumentUrl,
      selfieUrl,
      address,
      proofOfAddressUrl,
      bankDetails,
      businessRegistrationUrl,
    };

    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
    } catch {}
  }, [
    initialLoading,
    showDraftModal,
    currentStepIndex,
    storeName,
    country,
    categories,
    firstName,
    lastName,
    otherName,
    verificationType,
    documentId,
    idDocumentUrl,
    selfieUrl,
    address,
    proofOfAddressUrl,
    bankDetails,
    businessRegistrationUrl,
  ]);

  // Submit Completed KYC
  const handleSubmitKyc = async () => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      // 1. Setup store profile
      if (storeName.trim()) {
        await storeService.setupStore({
          name: storeName.trim(),
          country: country || undefined,
          categories,
        });
      }

      // 2. Save KYC application data
      await kycService.upsertKyc({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        otherName: otherName.trim() || undefined,
        verificationType: verificationType || "NIN",
        documentId: documentId.trim(),
        idDocumentUrl: idDocumentUrl || "",
        selfieUrl: selfieUrl || "",
        address: address.trim(),
        proofOfAddressUrl: proofOfAddressUrl || "",
        businessRegistrationUrl: businessRegistrationUrl || "",
        bankDetails,
      });

      // 3. Submit KYC for admin review
      await kycService.submitKyc();

      // 4. Clear local draft
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {}

      // 5. Navigate to In-Review Celebration Step
      setCurrentStepIndex(7);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to submit KYC details. Please check all fields and try again.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToDashboard = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {}
    router.replace("/dashboard");
  };

  if (initialLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-4">
        <ClipLoader color="var(--color-primary, #800A1D)" size={36} />
        <p className="text-xs sm:text-sm font-medium text-neutral-500">
          Loading your verification profile...
        </p>
      </div>
    );
  }

  const progressPercent = Math.min(
    ((currentStepIndex + 1) / STEPS.length) * 100,
    100
  );

  return (
    <div className="min-h-screen w-full bg-white text-text font-space-grotesk flex flex-col">
      {/* Draft Modal */}
      <DraftModal
        isOpen={showDraftModal}
        onContinue={handleRestoreDraft}
        onStartFresh={handleStartFresh}
        onClose={() => setShowDraftModal(false)}
      />

      {/* Main Container */}
      <div className="w-full flex-1 flex flex-col lg:flex-row overflow-x-hidden">
        {/* LEFT COLUMN: Milestone Sidebar (Split Screen on Desktop) */}
        {currentStepIndex < 7 && (
          <div className="hidden lg:block lg:w-5/12 xl:w-4/12 h-screen sticky top-0">
            <MilestoneSidebar
              steps={STEPS}
              currentStepIndex={currentStepIndex}
              onSelectStep={(idx) => idx < currentStepIndex && setCurrentStepIndex(idx)}
              onBack={() => currentStepIndex > 0 && setCurrentStepIndex(currentStepIndex - 1)}
            />
          </div>
        )}

        {/* RIGHT COLUMN: Form Content Area */}
        <div
          className={`w-full flex flex-col justify-between ${
            currentStepIndex >= 7
              ? "lg:w-full max-w-2xl mx-auto px-4 py-12"
              : "lg:w-7/12 xl:w-8/12 px-4 sm:px-8 md:px-12 lg:px-16 py-6 md:py-10"
          }`}
        >
          {/* Mobile Top Header / Progress Bar */}
          {currentStepIndex < 7 && (
            <div className="lg:hidden w-full pb-6 space-y-3">
              <div className="flex items-center justify-between">
                {currentStepIndex > 0 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStepIndex(currentStepIndex - 1)}
                    className="flex items-center gap-1 text-xs font-semibold text-neutral-600 hover:text-primary transition-colors"
                  >
                    <FiChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                ) : (
                  <span className="text-xs font-bold text-primary">Hustlr KYC</span>
                )}
                <span className="text-xs font-semibold text-neutral-400">
                  Step {currentStepIndex + 1} of {STEPS.length}
                </span>
              </div>

              {/* Progress Track */}
              <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Form Step Body */}
          <div className="w-full max-w-xl mx-auto my-auto py-2">
            {currentStepIndex === 0 && (
              <StepStoreDetails
                storeName={storeName}
                setStoreName={setStoreName}
                country={country}
                setCountry={setCountry}
                categories={categories}
                setCategories={setCategories}
                onNext={() => setCurrentStepIndex(1)}
                onSkip={() => setCurrentStepIndex(1)}
              />
            )}

            {currentStepIndex === 1 && (
              <StepPersonalInfo
                firstName={firstName}
                setFirstName={setFirstName}
                lastName={lastName}
                setLastName={setLastName}
                otherName={otherName}
                setOtherName={setOtherName}
                verificationType={verificationType}
                setVerificationType={setVerificationType}
                onNext={() => setCurrentStepIndex(2)}
                onBack={() => setCurrentStepIndex(0)}
              />
            )}

            {currentStepIndex === 2 && (
              <StepDocumentUpload
                verificationType={verificationType}
                documentId={documentId}
                setDocumentId={setDocumentId}
                idDocumentUrl={idDocumentUrl}
                setIdDocumentUrl={setIdDocumentUrl}
                onNext={() => setCurrentStepIndex(3)}
                onBack={() => setCurrentStepIndex(1)}
              />
            )}

            {currentStepIndex === 3 && (
              <StepSelfie
                selfieUrl={selfieUrl}
                setSelfieUrl={setSelfieUrl}
                onNext={() => setCurrentStepIndex(4)}
                onBack={() => setCurrentStepIndex(2)}
              />
            )}

            {currentStepIndex === 4 && (
              <StepAddress
                address={address}
                setAddress={setAddress}
                proofOfAddressUrl={proofOfAddressUrl}
                setProofOfAddressUrl={setProofOfAddressUrl}
                onNext={() => setCurrentStepIndex(5)}
                onBack={() => setCurrentStepIndex(3)}
              />
            )}

            {currentStepIndex === 5 && (
              <StepBankPayout
                bankDetails={bankDetails}
                setBankDetails={setBankDetails}
                onNext={() => setCurrentStepIndex(6)}
                onBack={() => setCurrentStepIndex(4)}
              />
            )}

            {currentStepIndex === 6 && (
              <StepBusinessCAC
                businessRegistrationUrl={businessRegistrationUrl}
                setBusinessRegistrationUrl={setBusinessRegistrationUrl}
                onSubmit={handleSubmitKyc}
                onBack={() => setCurrentStepIndex(5)}
                isSubmitting={isSubmitting}
                submitError={submitError}
              />
            )}

            {currentStepIndex === 7 && (
              <StepSuccessReview onGoToDashboard={handleGoToDashboard} />
            )}
          </div>

         
        </div>
      </div>
    </div>
  );
}
