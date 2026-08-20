"use client";

import React, { Suspense, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  FileCheck2,
  Upload,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Stepper from "@/components/ui/Stepper";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useKyc, useUpsertKyc, useSubmitKyc, useBanks } from "@/hooks";
import { useUploadAsset } from "@/hooks/useStore";
import { getErrorMessage, cn } from "@/lib/utils";
import type { Kyc, KycInput, VerificationType } from "@/types/kyc";

const STEPS = [
  { id: "personal", label: "Personal Info" },
  { id: "documents", label: "ID & Selfie" },
  { id: "address", label: "Address" },
  { id: "business", label: "Business", optional: true },
  { id: "bank", label: "Bank Details" },
  { id: "review", label: "Review & Submit" },
];

const VERIFICATION_TYPES: { value: VerificationType; label: string }[] = [
  { value: "NIN", label: "National Identity Number (NIN)" },
  { value: "Driver's License", label: "Driver's License" },
  { value: "International Passport", label: "International Passport" },
  { value: "Voter's Card", label: "Voter's Card" },
];

function DocUploader({
  label,
  hint,
  url,
  uploading,
  onUpload,
  onClear,
}: {
  label: string;
  hint: string;
  url: string;
  uploading: boolean;
  onUpload: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  return (
    <div>
      <p className="text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
        {label}
      </p>
      <div
        className="rounded-2xl border-2 border-dashed border-border bg-bg-soft p-5 flex items-center gap-4"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file) onUpload(file);
        }}
      >
        <span
          className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
            url ? "bg-success-light text-success" : "bg-white text-muted border border-border"
          )}
        >
          {url ? <Check className="w-5 h-5" /> : <FileCheck2 className="w-5 h-5" />}
        </span>
        <div className="flex-1 min-w-0">
          {url ? (
            <>
              <p className="text-sm font-semibold text-success flex items-center gap-1.5">
                Uploaded
              </p>
              <button
                type="button"
                onClick={onClear}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                Remove & re-upload
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="text-sm font-semibold text-primary hover:underline cursor-pointer disabled:opacity-60"
              >
                {uploading ? "Uploading…" : "Click to upload"}
              </button>
              <p className="text-xs text-muted mt-0.5">{hint}</p>
            </>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

function StatusBanner({ kyc }: { kyc: Kyc }) {
  if (kyc.status === "draft") return null;

  const config = {
    pending: {
      icon: <Clock className="w-5 h-5" />,
      variant: "warning" as const,
      title: "Application under review",
      body: "Our compliance team is reviewing your documents. This usually takes 1–2 business days — we'll email you the outcome.",
    },
    approved: {
      icon: <CheckCircle2 className="w-5 h-5" />,
      variant: "success" as const,
      title: "KYC approved 🎉",
      body: "Your identity is verified. You can now subscribe to a plan and take your store live.",
    },
    rejected: {
      icon: <XCircle className="w-5 h-5" />,
      variant: "danger" as const,
      title: "Application rejected",
      body: kyc.reviewerNote || "Your application was rejected. Please review your details and resubmit.",
    },
    info_requested: {
      icon: <AlertTriangle className="w-5 h-5" />,
      variant: "warning" as const,
      title: "Additional information required",
      body:
        (kyc.reviewerNote || "The reviewer requested new files.") +
        (kyc.requestedFiles.length > 0
          ? ` Requested: ${kyc.requestedFiles.join(", ")}.`
          : ""),
    },
  }[kyc.status];

  if (!config) return null;

  return (
    <div
      className={cn(
        "rounded-3xl border p-5 sm:p-6 flex items-start gap-4",
        config.variant === "success" && "bg-success-light/50 border-success/30",
        config.variant === "warning" && "bg-warning-light/50 border-warning/30",
        config.variant === "danger" && "bg-danger-light/50 border-danger/30"
      )}
    >
      <span
        className={cn(
          "w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0",
          config.variant === "success" && "text-success",
          config.variant === "warning" && "text-warning",
          config.variant === "danger" && "text-danger"
        )}
      >
        {config.icon}
      </span>
      <div className="min-w-0">
        <p className="font-bold">{config.title}</p>
        <p className="text-sm text-text/70 mt-0.5 leading-relaxed">{config.body}</p>
      </div>
    </div>
  );
}

function KycWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { data: kyc, isLoading } = useKyc();
  const { data: banks } = useBanks();
  const upsert = useUpsertKyc();
  const submit = useSubmitKyc();
  const upload = useUploadAsset();

  const stepIndex = Math.max(
    0,
    Math.min(
      STEPS.findIndex((s) => s.id === searchParams.get("step")) === -1
        ? 0
        : STEPS.findIndex((s) => s.id === searchParams.get("step")),
      STEPS.length - 1
    )
  );

  const locked = kyc?.status === "pending" || kyc?.status === "approved";

  const goToStep = (index: number) =>
    router.replace(`/dashboard/kyc?step=${STEPS[index].id}`, { scroll: false });

  const doUpload = async (
    file: File,
    apply: (url: string) => void
  ): Promise<void> => {
    try {
      const { url } = await upload.mutateAsync({ kind: "kyc-document", file });
      apply(url);
    } catch (err) {
      toast(getErrorMessage(err), "error");
    }
  };

  const handleSave = (input: KycInput, opts?: { advance?: boolean }) => {
    upsert.mutate(input, {
      onSuccess: () => {
        if (opts?.advance !== false) {
          toast("Progress saved.", "success");
          goToStep(Math.min(stepIndex + 1, STEPS.length - 1));
        } else {
          toast("Saved.", "success");
        }
      },
      onError: (err) => toast(getErrorMessage(err), "error"),
    });
  };

  const handleSubmit = () => {
    submit.mutate(undefined, {
      onSuccess: () => {
        toast("KYC application submitted for review!", "success");
      },
      onError: (err) => toast(getErrorMessage(err), "error"),
    });
  };

  if (isLoading || !kyc) {
    return <Spinner size="lg" label="Loading KYC…" />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">KYC Verification</h2>
        <p className="text-sm text-muted mt-1 max-w-2xl">
          Identity verification is required before your store can accept
          payments — it protects you and your buyers and enables payouts to
          your bank account.
        </p>
      </div>

      <StatusBanner kyc={kyc} />

      {locked ? (
        <Card className="p-0 overflow-hidden">
          <div className="p-6 sm:p-8 flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted text-xs uppercase tracking-wider font-semibold mb-1">Name</p>
                <p className="font-semibold">{kyc.firstName} {kyc.otherName} {kyc.lastName}</p>
              </div>
              <div>
                <p className="text-muted text-xs uppercase tracking-wider font-semibold mb-1">ID Type</p>
                <p className="font-semibold">{kyc.verificationType}</p>
              </div>
              <div>
                <p className="text-muted text-xs uppercase tracking-wider font-semibold mb-1">Document Number</p>
                <p className="font-semibold font-mono">{kyc.documentId}</p>
              </div>
              <div>
                <p className="text-muted text-xs uppercase tracking-wider font-semibold mb-1">Payout Bank</p>
                <p className="font-semibold">{kyc.bankDetails?.bankName} ••••{kyc.bankDetails?.accountNumber.slice(-4)}</p>
              </div>
            </div>
            {kyc.status === "approved" && (
              <Button onClick={() => router.push("/dashboard/billing")}>
                Continue to Billing
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <>
          <Stepper steps={STEPS} currentStep={stepIndex} onStepClick={goToStep} />

          <Card className="p-6 sm:p-8">
            {stepIndex === 0 && (
              <form
                id="kyc-step-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  handleSave({
                    firstName: String(fd.get("firstName") ?? ""),
                    lastName: String(fd.get("lastName") ?? ""),
                    otherName: String(fd.get("otherName") ?? ""),
                    verificationType: fd.get("verificationType") as VerificationType,
                    documentId: String(fd.get("documentId") ?? ""),
                  });
                }}
                className="flex flex-col gap-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input label="First Name" name="firstName" required defaultValue={kyc.firstName} placeholder="Musa" />
                  <Input label="Last Name" name="lastName" required defaultValue={kyc.lastName} placeholder="Abdullahi" />
                </div>
                <Input label="Other Name (optional)" name="otherName" defaultValue={kyc.otherName} placeholder="Middle name" />
                <Select
                  label="Verification Document Type"
                  name="verificationType"
                  required
                  placeholder="Select a document type"
                  defaultValue={kyc.verificationType ?? ""}
                  options={VERIFICATION_TYPES}
                />
                <Input
                  label="Document Number"
                  name="documentId"
                  required
                  defaultValue={kyc.documentId}
                  placeholder="e.g. 12345678901"
                  hint="The ID number printed on your chosen document."
                />
              </form>
            )}

            {stepIndex === 1 && (
              <KYCDocumentsStep kyc={kyc} onSave={handleSave} doUpload={doUpload} uploading={upload.isPending} />
            )}

            {stepIndex === 2 && (
              <KYCAddressStep kyc={kyc} onSave={handleSave} doUpload={doUpload} uploading={upload.isPending} />
            )}

            {stepIndex === 3 && (
              <KYCBusinessStep kyc={kyc} onSave={handleSave} doUpload={doUpload} uploading={upload.isPending} />
            )}

            {stepIndex === 4 && (
              <KYCBankStep kyc={kyc} banks={banks ?? []} onSave={handleSave} />
            )}

            {stepIndex === 5 && <KycReview kyc={kyc} />}

            <div className="flex items-center justify-between gap-3 mt-8 pt-6 border-t border-border">
              <Button
                variant="ghost"
                onClick={() => goToStep(Math.max(0, stepIndex - 1))}
                disabled={stepIndex === 0}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              {stepIndex < STEPS.length - 1 ? (
                stepIndex === 3 ? (
                  <Button
                    variant="outline"
                    onClick={() => goToStep(stepIndex + 1)}
                  >
                    Skip (optional)
                  </Button>
                ) : null
              ) : null}
              {stepIndex < STEPS.length - 1 ? (
                stepIndex === 3 ? (
                  <Button onClick={() => goToStep(stepIndex + 1)}>Skip Business Docs</Button>
                ) : (
                  <Button form="kyc-step-form" type="submit" loading={upsert.isPending}>
                    Save & Continue
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )
              ) : (
                <Button onClick={handleSubmit} loading={submit.isPending}>
                  <Upload className="w-4 h-4" />
                  Submit for Review
                </Button>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

/* ── Step 2: ID & Selfie ─────────────────────────────────────── */
function KYCDocumentsStep({
  kyc,
  onSave,
  doUpload,
  uploading,
}: {
  kyc: Kyc;
  onSave: (input: KycInput, opts?: { advance?: boolean }) => void;
  doUpload: (file: File, apply: (url: string) => void) => Promise<void>;
  uploading: boolean;
}) {
  const [idUrl, setIdUrl] = useState(kyc.idDocumentUrl);
  const [selfieUrl, setSelfieUrl] = useState(kyc.selfieUrl);

  return (
    <form
      id="kyc-step-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ idDocumentUrl: idUrl, selfieUrl: selfieUrl });
      }}
      className="flex flex-col gap-5"
    >
      <p className="text-sm text-muted">
        Upload a clear photo of your {kyc.verificationType ?? "ID document"} and
        a selfie holding it. Both must show all four corners.
      </p>
      <DocUploader
        label="ID Document"
        hint="PNG, JPG or PDF, max 5MB"
        url={idUrl}
        uploading={uploading}
        onUpload={(file) => doUpload(file, setIdUrl)}
        onClear={() => setIdUrl("")}
      />
      <DocUploader
        label="Selfie Holding ID"
        hint="Your face and the document must both be visible"
        url={selfieUrl}
        uploading={uploading}
        onUpload={(file) => doUpload(file, setSelfieUrl)}
        onClear={() => setSelfieUrl("")}
      />
      {(idUrl || selfieUrl) && (
        <div className="flex gap-3">
          {idUrl && (
            <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-border">
              <Image src={idUrl} alt="ID document preview" fill className="object-cover" sizes="96px" />
            </div>
          )}
          {selfieUrl && (
            <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-border">
              <Image src={selfieUrl} alt="Selfie preview" fill className="object-cover" sizes="96px" />
            </div>
          )}
        </div>
      )}
    </form>
  );
}

/* ── Step 3: Address ─────────────────────────────────────────── */
function KYCAddressStep({
  kyc,
  onSave,
  doUpload,
  uploading,
}: {
  kyc: Kyc;
  onSave: (input: KycInput, opts?: { advance?: boolean }) => void;
  doUpload: (file: File, apply: (url: string) => void) => Promise<void>;
  uploading: boolean;
}) {
  const [address, setAddress] = useState(kyc.address);
  const [proofUrl, setProofUrl] = useState(kyc.proofOfAddressUrl);

  return (
    <form
      id="kyc-step-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ address, proofOfAddressUrl: proofUrl });
      }}
      className="flex flex-col gap-5"
    >
      <Textarea
        label="Residential Address"
        required
        rows={3}
        placeholder="House number, street, area, city, state"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <DocUploader
        label="Proof of Address"
        hint="Utility bill or bank statement issued in the last 3 months"
        url={proofUrl}
        uploading={uploading}
        onUpload={(file) => doUpload(file, setProofUrl)}
        onClear={() => setProofUrl("")}
      />
    </form>
  );
}

/* ── Step 4: Business (optional) ─────────────────────────────── */
function KYCBusinessStep({
  kyc,
  onSave,
  doUpload,
  uploading,
}: {
  kyc: Kyc;
  onSave: (input: KycInput, opts?: { advance?: boolean }) => void;
  doUpload: (file: File, apply: (url: string) => void) => Promise<void>;
  uploading: boolean;
}) {
  const [cacUrl, setCacUrl] = useState(kyc.businessRegistrationUrl);

  return (
    <form
      id="kyc-step-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ businessRegistrationUrl: cacUrl });
      }}
      className="flex flex-col gap-5"
    >
      <p className="text-sm text-muted">
        Registered businesses (CAC or equivalent) build extra buyer trust and
        may qualify for higher payout limits. This step is optional.
      </p>
      <DocUploader
        label="Business Registration Document"
        hint="CAC certificate or equivalent"
        url={cacUrl}
        uploading={uploading}
        onUpload={(file) => doUpload(file, setCacUrl)}
        onClear={() => setCacUrl("")}
      />
    </form>
  );
}

/* ── Step 5: Bank details ────────────────────────────────────── */
function KYCBankStep({
  kyc,
  banks,
  onSave,
}: {
  kyc: Kyc;
  banks: { name: string; code: string }[];
  onSave: (input: KycInput, opts?: { advance?: boolean }) => void;
}) {
  const [bankName, setBankName] = useState(kyc.bankDetails?.bankName ?? "");
  const [bankCode, setBankCode] = useState(kyc.bankDetails?.bankCode ?? "");
  const [accountNumber, setAccountNumber] = useState(
    kyc.bankDetails?.accountNumber ?? ""
  );
  const [accountName, setAccountName] = useState(
    kyc.bankDetails?.accountName ?? ""
  );

  const accountValid = /^\d{10}$/.test(accountNumber);

  return (
    <form
      id="kyc-step-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!accountValid) return;
        onSave({
          bankDetails: { bankName, bankCode, accountNumber, accountName },
        });
      }}
      className="flex flex-col gap-5"
    >
      <Select
        label="Bank"
        required
        placeholder="Select your bank"
        value={bankCode}
        onChange={(e) => {
          const bank = banks.find((b) => b.code === e.target.value);
          setBankCode(e.target.value);
          setBankName(bank?.name ?? "");
        }}
        options={banks.map((b) => ({ value: b.code, label: b.name }))}
        hint="Bank list validated against Paystack for instant payouts."
      />
      <Input
        label="Account Number"
        required
        inputMode="numeric"
        maxLength={10}
        placeholder="10-digit account number"
        value={accountNumber}
        onChange={(e) =>
          setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))
        }
        error={
          accountNumber.length > 0 && !accountValid
            ? "Account number must be exactly 10 digits"
            : undefined
        }
      />
      <Input
        label="Account Name"
        required
        placeholder="Exactly as it appears on your bank account"
        value={accountName}
        onChange={(e) => setAccountName(e.target.value)}
      />
      <p className="text-xs text-muted bg-bg-soft rounded-xl px-4 py-3">
        Escrow payments are released to this account when you withdraw from
        your wallet.
      </p>
    </form>
  );
}

/* ── Step 6: Review ──────────────────────────────────────────── */
function KycReview({ kyc }: { kyc: Kyc }) {
  const bank = kyc.bankDetails;
  const rows: [string, string][] = [
    ["Name", `${kyc.firstName} ${kyc.otherName} ${kyc.lastName}`.trim()],
    ["ID", `${kyc.verificationType} • ${kyc.documentId}`],
    ["ID Document", kyc.idDocumentUrl ? "Uploaded ✓" : "Missing"],
    ["Selfie", kyc.selfieUrl ? "Uploaded ✓" : "Missing"],
    ["Address", kyc.address || "Missing"],
    ["Proof of Address", kyc.proofOfAddressUrl ? "Uploaded ✓" : "Missing"],
    [
      "Business Doc",
      kyc.businessRegistrationUrl ? "Uploaded ✓" : "Not provided (optional)",
    ],
    [
      "Bank",
      bank
        ? `${bank.bankName} • ${bank.accountNumber} • ${bank.accountName}`
        : "Missing",
    ],
  ];

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        Review everything below. Once submitted, your application goes to our
        compliance team for review.
      </p>
      <dl className="rounded-2xl border border-border divide-y divide-border text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-4 px-4 py-3">
            <dt className="text-muted shrink-0">{label}</dt>
            <dd className="font-semibold text-right">{value || "—"}</dd>
          </div>
        ))}
      </dl>
      <div className="flex items-center gap-2">
        <Badge variant="info">Paystack-verified bank list</Badge>
        <Badge variant="primary">Escrow protected payouts</Badge>
      </div>
    </div>
  );
}

export default function KycPage() {
  return (
    <Suspense>
      <KycWizard />
    </Suspense>
  );
}
