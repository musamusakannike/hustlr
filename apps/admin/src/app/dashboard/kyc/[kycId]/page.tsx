"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  ExternalLink,
  Store as StoreIcon,
  User as UserIcon,
  CreditCard,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import {
  adminKycService,
  type KycRecord,
  type AdminStoreItem,
} from "@/lib/api";

type DocTab = "id" | "address" | "business" | "selfie";

const DOC_TABS: { id: DocTab; label: string; shortLabel: string }[] = [
  { id: "id", label: "Government ID", shortLabel: "Govt ID" },
  { id: "address", label: "Proof of Address", shortLabel: "Address" },
  { id: "business", label: "Business Registration", shortLabel: "Business Reg" },
  { id: "selfie", label: "Selfie", shortLabel: "Selfie" },
];

export default function KycDetailPage() {
  const { kycId } = useParams<{ kycId: string }>();
  const router = useRouter();

  const [kyc, setKyc] = useState<KycRecord | null>(null);
  const [store, setStore] = useState<AdminStoreItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Review states
  const [activeTab, setActiveTab] = useState<DocTab>("id");
  const [reviewerNote, setReviewerNote] = useState("");
  const [selectedRequestedFiles, setSelectedRequestedFiles] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [copiedBankField, setCopiedBankField] = useState<string | null>(null);

  // Modals
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRequestInfoModal, setShowRequestInfoModal] = useState(false);

  const anyModalOpen = showApproveModal || showRejectModal || showRequestInfoModal;

  // Fetch KYC details
  const fetchKycDetail = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await adminKycService.getById(String(kycId));
      if (res.kyc) {
        setKyc(res.kyc);
        setReviewerNote(res.kyc.reviewerNote || "");
        setSelectedRequestedFiles(res.kyc.requestedFiles || []);
      }
      if (res.store) {
        setStore(res.store);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load KYC details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (kycId) {
      void fetchKycDetail();
    }
  }, [kycId]);

  // Close any open modal on Escape for fast keyboard-driven review
  useEffect(() => {
    if (!anyModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !actionLoading) {
        setShowApproveModal(false);
        setShowRejectModal(false);
        setShowRequestInfoModal(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [anyModalOpen, actionLoading]);

  const showToast = (type: "success" | "error", text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  // Actions
  const handleApprove = async () => {
    if (!kyc) return;
    setActionLoading(true);
    try {
      const updated = await adminKycService.approve(kyc._id);
      setKyc(updated);
      setShowApproveModal(false);
      showToast("success", "KYC application approved successfully. Merchant notified.");
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to approve KYC.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!kyc) return;
    if (!reviewerNote || reviewerNote.trim().length < 5) {
      alert("Please provide a note explaining the rejection (minimum 5 characters).");
      return;
    }
    setActionLoading(true);
    try {
      const updated = await adminKycService.reject(kyc._id, reviewerNote.trim());
      setKyc(updated);
      setShowRejectModal(false);
      showToast("success", "KYC application rejected. Rejection notice sent to merchant.");
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to reject KYC.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestInfo = async () => {
    if (!kyc) return;
    if (selectedRequestedFiles.length === 0) {
      alert("Please select at least one document to request.");
      return;
    }
    if (!reviewerNote || reviewerNote.trim().length < 5) {
      alert("Please provide instructions for the merchant (minimum 5 characters).");
      return;
    }
    setActionLoading(true);
    try {
      const updated = await adminKycService.requestInfo(kyc._id, {
        reviewerNote: reviewerNote.trim(),
        requestedFiles: selectedRequestedFiles,
      });
      setKyc(updated);
      setShowRequestInfoModal(false);
      showToast("success", "Information request sent. Merchant notified to resubmit.");
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to request info.");
    } finally {
      setActionLoading(false);
    }
  };

  const toggleRequestedFile = (fileId: string) => {
    setSelectedRequestedFiles((prev) =>
      prev.includes(fileId) ? prev.filter((f) => f !== fileId) : [...prev, fileId],
    );
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedBankField(fieldName);
      setTimeout(() => setCopiedBankField(null), 2500);
    }
  };

  const getActiveDocUrl = () => {
    if (!kyc) return null;
    if (activeTab === "id") return kyc.idDocumentUrl;
    if (activeTab === "address") return kyc.proofOfAddressUrl;
    if (activeTab === "business") return kyc.businessRegistrationUrl;
    if (activeTab === "selfie") return kyc.selfieUrl;
    return null;
  };

  const getActiveDocTitle = () => {
    if (activeTab === "id") return kyc?.verificationType || "Government ID Document";
    if (activeTab === "address") return "Proof of Address";
    if (activeTab === "business") return "CAC / Business Registration";
    if (activeTab === "selfie") return "Live Selfie Photo";
    return "Document";
  };

  const getSellerDisplayName = () => {
    if (!kyc) return "Merchant";
    if (kyc.firstName || kyc.lastName) {
      return [kyc.firstName, kyc.otherName, kyc.lastName].filter(Boolean).join(" ");
    }
    if (typeof kyc.sellerId === "object" && kyc.sellerId !== null && "name" in kyc.sellerId) {
      return kyc.sellerId.name;
    }
    if (kyc.seller?.name) {
      return kyc.seller.name;
    }
    return "Merchant";
  };

  const getSellerEmail = () => {
    if (!kyc) return "—";
    if (typeof kyc.sellerId === "object" && kyc.sellerId !== null && "email" in kyc.sellerId) {
      return kyc.sellerId.email;
    }
    if (kyc.seller?.email) {
      return kyc.seller.email;
    }
    return "—";
  };

  if (loading) {
    return (
      <div className="min-h-125 flex flex-col items-center justify-center space-y-3 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-semibold text-slate-700">Loading KYC review profile...</p>
      </div>
    );
  }

  if (error || !kyc) {
    return (
      <div className="bg-white rounded-3xl p-10 border border-border text-center space-y-4 font-sans max-w-md mx-auto">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Unable to load KYC details</h2>
        <p className="text-xs text-muted max-w-md mx-auto">{error || "KYC submission not found."}</p>
        <Link
          href="/dashboard/kyc"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-2xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to KYC list</span>
        </Link>
      </div>
    );
  }

  const sellerName = getSellerDisplayName();
  const sellerEmail = getSellerEmail();
  const activeDocUrl = getActiveDocUrl();

  return (
    <div className="space-y-5 font-sans pb-6">
      {/* ─── TOP NAVIGATION & STATUS BAR ─── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-white border border-border text-slate-700 hover:text-primary hover:bg-bg-soft transition-colors shadow-2xs shrink-0"
            title="Back to list"
            aria-label="Go back"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-black tracking-tight truncate max-w-full">
                {sellerName}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize shrink-0 ${
                  kyc.status === "approved"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : kyc.status === "rejected"
                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                    : kyc.status === "info_requested"
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-primary-bg text-primary border border-primary-light"
                }`}
              >
                {kyc.status.replace("_", " ")}
              </span>
            </div>
            <p className="text-xs text-muted font-normal mt-0.5 flex flex-wrap items-center gap-x-2">
              <span>
                Application ID: <span className="font-mono text-slate-700">{kyc._id}</span>
              </span>
              <span className="text-slate-300">•</span>
              <span>
                Submitted{" "}
                <span className="font-semibold text-slate-700">
                  {kyc.submittedAt ? new Date(kyc.submittedAt).toLocaleDateString("en-GB") : "—"}
                </span>
              </span>
              {kyc.reviewedAt && (
                <>
                  <span className="text-slate-300">•</span>
                  <span>
                    Last reviewed{" "}
                    <span className="font-semibold text-slate-700">
                      {new Date(kyc.reviewedAt).toLocaleDateString("en-GB")}
                    </span>
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ─── TOAST NOTIFICATION (floating, non-blocking) ─── */}
      {feedbackMessage && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-60 p-4 rounded-2xl border text-xs font-bold flex items-center justify-between gap-3 shadow-lg backdrop-blur-xs animate-in fade-in slide-in-from-top-2 duration-200 ${
            feedbackMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {feedbackMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="truncate">{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-xs opacity-75 hover:opacity-100 cursor-pointer shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ─── MAIN REVIEW WORKSPACE ───
           Mobile order: Document → Decision → Merchant details
           Desktop order: Merchant details | Document | Decision (both side columns sticky) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* ==================== DOCUMENT PREVIEW CANVAS ==================== */}
        <div className="order-1 xl:order-2 xl:col-span-6 bg-white rounded-3xl p-5 border border-border shadow-2xs space-y-4">
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Document Inspection</h3>
            <span className="text-[11px] font-semibold text-primary bg-primary-bg px-2 py-0.5 rounded-full text-right">
              {getActiveDocTitle()}
            </span>
          </div>

          {/* Interactive Document Tabs — horizontally scrollable on narrow screens instead of squishing */}
          <div className="flex items-center gap-1.5 p-1 bg-bg-soft rounded-2xl border border-border text-xs overflow-x-auto scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {DOC_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 sm:flex-1 py-1.5 px-3 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer text-center ${
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-2xs"
                    : "text-muted hover:text-slate-900"
                }`}
              >
                {tab.shortLabel}
              </button>
            ))}
          </div>

          {/* Document Preview Canvas */}
          <div className="space-y-3">
            <div className="w-full bg-slate-950 rounded-2xl overflow-hidden shadow-xs relative border border-slate-800 aspect-4/3 sm:aspect-16/10 xl:aspect-auto xl:min-h-104 xl:max-h-136 flex items-center justify-center">
              {activeDocUrl ? (
                <div className="relative w-full h-full flex items-center justify-center p-3">
                  <Image
                    src={activeDocUrl}
                    alt={`${getActiveDocTitle()} preview`}
                    width={800}
                    height={600}
                    unoptimized
                    className="max-h-full w-auto object-contain rounded-xl"
                  />

                  {/* Actions overlay */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <a
                      href={activeDocUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 bg-black/70 hover:bg-black/90 text-white rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold backdrop-blur-xs shadow-md"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Open full</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-10 text-center text-gray-400 space-y-2">
                  <FileText className="w-12 h-12 mx-auto text-gray-600 stroke-[1.5]" />
                  <p className="text-xs font-semibold text-gray-300">
                    No document uploaded for this section.
                  </p>
                  <p className="text-[11px] text-gray-500">
                    The merchant has not provided an upload for &ldquo;{getActiveDocTitle()}&rdquo;.
                  </p>
                </div>
              )}
            </div>

            {/* Document details caption */}
            <div className="flex items-center justify-between gap-2 text-xs text-muted px-1">
              <span className="truncate">Section: {getActiveDocTitle()}</span>
              {activeTab === "id" && kyc.documentId && (
                <span className="font-mono font-bold text-slate-800 shrink-0">
                  ID: {kyc.documentId}
                </span>
              )}
            </div>

            {/* Tab position dots — quick visual progress through the 4 documents, mobile-friendly */}
            <div className="flex items-center justify-center gap-1.5 sm:hidden">
              {DOC_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  aria-label={`View ${tab.label}`}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    activeTab === tab.id ? "w-5 bg-primary" : "w-1.5 bg-border"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ==================== DECISION TOOLS & NOTES ==================== */}
        <div className="order-2 xl:order-3 xl:col-span-3 xl:sticky xl:top-6 xl:max-h-[calc(100vh-3rem)] xl:overflow-y-auto bg-white rounded-3xl p-5 border border-border shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Decision & Actions</h3>
          </div>

          {/* Current Status Banner */}
          <div>
            {kyc.status === "approved" ? (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-emerald-900">Merchant is Approved</p>
                  <p className="text-[11px] text-emerald-700 font-normal">
                    Store is eligible to go live and receive automatic payouts.
                  </p>
                </div>
              </div>
            ) : kyc.status === "rejected" ? (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold flex items-center gap-2.5">
                <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  <p className="font-bold text-rose-900">Application Rejected</p>
                  <p className="text-[11px] text-rose-700 font-normal">
                    Rejection note was dispatched to the seller.
                  </p>
                </div>
              </div>
            ) : kyc.status === "info_requested" ? (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs font-semibold flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="font-bold text-amber-900">Information Requested</p>
                  <p className="text-[11px] text-amber-700 font-normal">
                    Awaiting seller resubmission for requested documents.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-primary-bg border border-primary-light rounded-2xl text-primary text-xs font-semibold flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="font-bold text-primary">Pending Review</p>
                  <p className="text-[11px] text-primary/80 font-normal">
                    Verify uploaded documents and confirm decision below.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons — primary action leads, secondary pair grouped beneath */}
          <div className="space-y-2.5">
            <button
              onClick={() => setShowApproveModal(true)}
              disabled={actionLoading || kyc.status === "approved"}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve Application</span>
            </button>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setShowRequestInfoModal(true)}
                disabled={actionLoading}
                className="py-2.5 rounded-2xl bg-amber-50 border border-amber-300 hover:bg-amber-100 disabled:opacity-50 text-amber-800 font-bold text-xs shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Request Info</span>
              </button>

              <button
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading || kyc.status === "rejected"}
                className="py-2.5 rounded-2xl bg-rose-50 border border-rose-300 hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed text-rose-700 font-bold text-xs shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Reject</span>
              </button>
            </div>
          </div>

          {/* Reviewer Note Box */}
          <div className="space-y-2 pt-3 border-t border-gray-100">
            <label className="text-xs font-bold text-slate-900 block">
              Reviewer Notes / Instructions for Merchant
            </label>
            <textarea
              rows={4}
              value={reviewerNote}
              onChange={(e) => setReviewerNote(e.target.value)}
              placeholder="Enter notes explaining reasons for rejection or specific document instructions..."
              className="w-full bg-bg-soft border border-border p-3 rounded-2xl text-xs text-slate-800 outline-none focus:border-primary transition-all resize-none"
            />
            <p className="text-[11px] text-muted">
              These notes are recorded in audit logs and included in emails sent to the seller.
            </p>
          </div>
        </div>

        {/* ==================== MERCHANT, STORE & BANK DETAILS ==================== */}
        <div className="order-3 xl:order-1 xl:col-span-3 xl:sticky xl:top-6 xl:max-h-[calc(100vh-3rem)] xl:overflow-y-auto space-y-5">
          {/* Seller Information Card */}
          <div className="bg-white rounded-3xl p-5 border border-border shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <UserIcon className="w-4 h-4 text-primary" />
                <span>Seller Profile</span>
              </div>
              <span className="text-[11px] font-mono text-muted">
                {String(kyc.sellerId).slice(0, 8)}...
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <p className="text-muted text-[11px]">Full Name</p>
                <p className="font-bold text-slate-900 mt-0.5 text-sm">{sellerName}</p>
              </div>

              <div>
                <p className="text-muted text-[11px]">Email Address</p>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <span className="font-semibold text-slate-800 truncate">{sellerEmail}</span>
                  <button
                    onClick={() => copyToClipboard(sellerEmail, "email")}
                    className="text-muted hover:text-primary transition-colors p-1 shrink-0"
                    title="Copy email"
                  >
                    {copiedBankField === "email" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-muted text-[11px]">Document Type</p>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {kyc.verificationType || "Identity Document"}
                  </p>
                </div>
                <div>
                  <p className="text-muted text-[11px]">Document No.</p>
                  <p className="font-mono font-bold text-slate-900 mt-0.5 truncate">
                    {kyc.documentId || "—"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-muted text-[11px]">Residential Address</p>
                <p className="font-medium text-slate-800 mt-0.5">
                  {kyc.address || "Not provided"}
                </p>
              </div>
            </div>
          </div>

          {/* Store Details Card */}
          {store && (
            <div className="bg-white rounded-3xl p-5 border border-border shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <StoreIcon className="w-4 h-4 text-primary" />
                  <span>Store Information</span>
                </div>
                {store.isLive ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Live
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full shrink-0">
                    Offline
                  </span>
                )}
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-muted text-[11px]">Store Name</p>
                  <p className="font-bold text-slate-900 mt-0.5 text-sm truncate">{store.name}</p>
                </div>
                <div>
                  <p className="text-muted text-[11px]">Slug / Subdomain</p>
                  <p className="font-mono text-slate-700 mt-0.5 truncate">
                    {store.subdomain || store.slug}.hustlr.store
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Bank Account Details Card */}
          <div className="bg-white rounded-3xl p-5 border border-border shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <CreditCard className="w-4 h-4 text-primary" />
                <span>Bank Details</span>
              </div>
            </div>

            {kyc.bankDetails?.accountNumber ? (
              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-muted text-[11px]">Bank Name</p>
                  <p className="font-bold text-slate-900 mt-0.5">{kyc.bankDetails.bankName || "—"}</p>
                </div>

                <div>
                  <p className="text-muted text-[11px]">Account Number</p>
                  <div className="flex items-center justify-between gap-2 mt-0.5 bg-bg-soft px-2.5 py-1.5 rounded-xl border border-border">
                    <span className="font-mono font-bold text-slate-900 text-sm truncate">
                      {kyc.bankDetails.accountNumber}
                    </span>
                    <button
                      onClick={() => copyToClipboard(kyc.bankDetails?.accountNumber || "", "acc_num")}
                      className="text-muted hover:text-primary transition-colors p-1 shrink-0"
                      title="Copy account number"
                    >
                      {copiedBankField === "acc_num" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-muted text-[11px]">Account Name</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{kyc.bankDetails.accountName || "—"}</p>
                </div>

                {kyc.bankDetails.bankCode && (
                  <div>
                    <p className="text-muted text-[11px]">Bank Code</p>
                    <p className="font-mono text-slate-600 mt-0.5">{kyc.bankDetails.bankCode}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-bg-soft rounded-2xl border border-border text-center text-muted text-xs">
                No bank account details linked yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── MODAL 1: APPROVE CONFIRMATION ─── */}
      {showApproveModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => !actionLoading && setShowApproveModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Approve KYC Verification?</h3>
              <p className="text-xs text-muted leading-relaxed mt-1">
                This will mark <span className="font-bold text-slate-800">{sellerName}</span> as fully verified. They will be able to launch their storefront and receive payouts. An approval confirmation email will be sent automatically.
              </p>
            </div>
            <div className="flex items-center gap-2.5 pt-2">
              <button
                onClick={() => setShowApproveModal(false)}
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl border border-border text-slate-700 font-semibold text-xs hover:bg-bg-soft cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Approve</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: REJECT CONFIRMATION ─── */}
      {showRejectModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => !actionLoading && setShowRejectModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-rose-700">Reject KYC Application?</h3>
              <p className="text-xs text-muted leading-relaxed mt-1">
                The merchant will be notified by email that their application was rejected along with your instructions below.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">
                Reason for Rejection <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={3}
                value={reviewerNote}
                onChange={(e) => setReviewerNote(e.target.value)}
                placeholder="E.g. Document image is expired or names do not match account holder."
                className="w-full bg-bg-soft border border-border p-3 rounded-2xl text-xs text-slate-800 outline-none focus:border-rose-500 transition-all resize-none"
                autoFocus
              />
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl border border-border text-slate-700 font-semibold text-xs hover:bg-bg-soft cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || !reviewerNote || reviewerNote.trim().length < 5}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Reject</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: REQUEST INFO / RESUBMISSION ─── */}
      {showRequestInfoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => !actionLoading && setShowRequestInfoModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Request Document Resubmission</h3>
              <p className="text-xs text-muted leading-relaxed mt-1">
                Select which specific documents require re-upload from the seller.
              </p>
            </div>

            {/* Checklist */}
            <div className="space-y-2">
              {[
                { id: "idDocument", label: "Government ID Document" },
                { id: "proofOfAddress", label: "Proof of Address" },
                { id: "businessRegistration", label: "Business Registration (CAC)" },
                { id: "selfie", label: "Live Selfie Photo" },
              ].map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-border hover:bg-amber-50/40 cursor-pointer text-xs font-semibold text-slate-800 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedRequestedFiles.includes(item.id)}
                    onChange={() => toggleRequestedFile(item.id)}
                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">
                Instructions for Merchant <span className="text-primary">*</span>
              </label>
              <textarea
                rows={3}
                value={reviewerNote}
                onChange={(e) => setReviewerNote(e.target.value)}
                placeholder="E.g. The national ID photo was blurry. Please upload a clear scan."
                className="w-full bg-bg-soft border border-border p-3 rounded-2xl text-xs text-slate-800 outline-none focus:border-primary transition-all resize-none"
              />
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                onClick={() => setShowRequestInfoModal(false)}
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl border border-border text-slate-700 font-semibold text-xs hover:bg-bg-soft cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestInfo}
                disabled={
                  actionLoading ||
                  selectedRequestedFiles.length === 0 ||
                  !reviewerNote ||
                  reviewerNote.trim().length < 5
                }
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Send Request</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}