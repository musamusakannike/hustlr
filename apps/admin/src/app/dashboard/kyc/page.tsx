"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IdCard,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  RefreshCw,
  Store as StoreIcon,
  User,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import {
  adminKycService,
  type KycRecord,
  type AdminKycListMeta,
} from "@/lib/api";

const PAGE_SIZE = 10;

function formatSubmissionDate(iso?: string | null) {
  if (!iso) return "Not submitted";
  const date = new Date(iso);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusBadge(status: string) {
  switch (status) {
    case "approved":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Approved</span>
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
          <XCircle className="w-3.5 h-3.5" />
          <span>Rejected</span>
        </span>
      );
    case "info_requested":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
          <Clock className="w-3.5 h-3.5" />
          <span>Info Requested</span>
        </span>
      );
    case "pending":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-primary-bg text-primary border border-primary-light">
          <Clock className="w-3.5 h-3.5" />
          <span>Pending Review</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
          <span>Draft</span>
        </span>
      );
  }
}

export default function KycListPage() {
  const router = useRouter();

  const [kycs, setKycs] = useState<KycRecord[]>([]);
  const [meta, setMeta] = useState<AdminKycListMeta>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });

  const [funnelCounts, setFunnelCounts] = useState<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    info_requested: number;
  }>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    info_requested: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Fetch funnel counts
  const fetchFunnel = async () => {
    try {
      const counts = await adminKycService.getFunnel();
      const summary = {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        info_requested: 0,
      };

      if (Array.isArray(counts)) {
        counts.forEach((item) => {
          summary.total += item.count || 0;
          if (item._id === "pending") summary.pending = item.count;
          if (item._id === "approved") summary.approved = item.count;
          if (item._id === "rejected") summary.rejected = item.count;
          if (item._id === "info_requested") summary.info_requested = item.count;
        });
      }
      setFunnelCounts(summary);
    } catch {
      // Non-critical fallback
    }
  };

  // Fetch list data
  const fetchData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params: Record<string, unknown> = {
        page,
        limit: PAGE_SIZE,
      };
      if (statusFilter !== "all") params.status = statusFilter;
      if (search) params.search = search;

      const res = await adminKycService.list(params);
      setKycs(res.items || []);
      if (res.meta) {
        setMeta(res.meta);
      }
    } catch (err) {
      console.error("Failed to load KYC list:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchFunnel();
  }, []);

  useEffect(() => {
    void fetchData();
  }, [page, statusFilter, search]);

  const handleRowClick = (kycId: string) => {
    router.push(`/dashboard/kyc/${kycId}`);
  };

  const getSellerDisplayName = (item: KycRecord) => {
    if (item.firstName || item.lastName) {
      return `${item.firstName || ""} ${item.lastName || ""}`.trim();
    }
    if (typeof item.sellerId === "object" && item.sellerId !== null && "name" in item.sellerId) {
      return item.sellerId.name;
    }
    if (item.seller?.name) {
      return item.seller.name;
    }
    return "Merchant";
  };

  const getSellerEmail = (item: KycRecord) => {
    if (typeof item.sellerId === "object" && item.sellerId !== null && "email" in item.sellerId) {
      return item.sellerId.email;
    }
    if (item.seller?.email) {
      return item.seller.email;
    }
    return "—";
  };

  return (
    <div className="space-y-6 font-sans">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-black tracking-tight">
            KYC & Merchant Verification
          </h1>
          <p className="text-xs sm:text-sm text-muted font-normal mt-0.5">
            Review and approve seller verification submissions, identity cards, and business documents.
          </p>
        </div>

        <button
          onClick={() => {
            void fetchFunnel();
            void fetchData(true);
          }}
          disabled={loading || refreshing}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-border text-xs font-semibold text-slate-700 hover:bg-bg-soft transition-all shadow-2xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-primary" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* ─── STATUS FILTER TABS / SUMMARY PILLS ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        {/* ALL */}
        <button
          onClick={() => {
            setStatusFilter("all");
            setPage(1);
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === "all"
              ? "bg-primary text-white border-primary shadow-xs"
              : "bg-white border-border text-slate-800 hover:border-primary-light"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${statusFilter === "all" ? "text-white/80" : "text-muted"}`}>
              All Submissions
            </span>
            <IdCard className="w-4 h-4 opacity-75" />
          </div>
          <p className="text-xl font-extrabold mt-1">{funnelCounts.total}</p>
        </button>

        {/* PENDING */}
        <button
          onClick={() => {
            setStatusFilter("pending");
            setPage(1);
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === "pending"
              ? "bg-primary text-white border-primary shadow-xs"
              : "bg-white border-border text-slate-800 hover:border-primary-light"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${statusFilter === "pending" ? "text-white/80" : "text-muted"}`}>
              Pending Review
            </span>
            <Clock className={`w-4 h-4 ${statusFilter === "pending" ? "text-white" : "text-primary"}`} />
          </div>
          <p className={`text-xl font-extrabold mt-1 ${statusFilter === "pending" ? "text-white" : "text-primary"}`}>
            {funnelCounts.pending}
          </p>
        </button>

        {/* APPROVED */}
        <button
          onClick={() => {
            setStatusFilter("approved");
            setPage(1);
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === "approved"
              ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
              : "bg-white border-border text-slate-800 hover:border-emerald-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${statusFilter === "approved" ? "text-white/80" : "text-muted"}`}>
              Approved
            </span>
            <CheckCircle2 className={`w-4 h-4 ${statusFilter === "approved" ? "text-white" : "text-emerald-600"}`} />
          </div>
          <p className={`text-xl font-extrabold mt-1 ${statusFilter === "approved" ? "text-white" : "text-emerald-600"}`}>
            {funnelCounts.approved}
          </p>
        </button>

        {/* REJECTED */}
        <button
          onClick={() => {
            setStatusFilter("rejected");
            setPage(1);
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === "rejected"
              ? "bg-rose-600 text-white border-rose-600 shadow-xs"
              : "bg-white border-border text-slate-800 hover:border-rose-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${statusFilter === "rejected" ? "text-white/80" : "text-muted"}`}>
              Rejected
            </span>
            <XCircle className={`w-4 h-4 ${statusFilter === "rejected" ? "text-white" : "text-rose-600"}`} />
          </div>
          <p className={`text-xl font-extrabold mt-1 ${statusFilter === "rejected" ? "text-white" : "text-rose-600"}`}>
            {funnelCounts.rejected}
          </p>
        </button>

        {/* INFO REQUESTED */}
        <button
          onClick={() => {
            setStatusFilter("info_requested");
            setPage(1);
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer col-span-2 sm:col-span-1 ${
            statusFilter === "info_requested"
              ? "bg-amber-600 text-white border-amber-600 shadow-xs"
              : "bg-white border-border text-slate-800 hover:border-amber-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${statusFilter === "info_requested" ? "text-white/80" : "text-muted"}`}>
              Info Requested
            </span>
            <AlertCircle className={`w-4 h-4 ${statusFilter === "info_requested" ? "text-white" : "text-amber-600"}`} />
          </div>
          <p className={`text-xl font-extrabold mt-1 ${statusFilter === "info_requested" ? "text-white" : "text-amber-600"}`}>
            {funnelCounts.info_requested}
          </p>
        </button>
      </div>

      {/* ─── FILTER & SEARCH CONTROLS ─── */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-border shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by seller, store, ID number..."
            className="w-full pl-10 pr-4 py-2 bg-bg-soft border border-border rounded-xl text-xs sm:text-sm text-black placeholder-muted outline-none focus:border-primary transition-all"
          />
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-auto appearance-none bg-bg-soft border border-border text-xs sm:text-sm font-semibold rounded-xl pl-3.5 pr-9 py-2 outline-none text-slate-700 cursor-pointer focus:border-primary"
            >
              <option value="all">Status: All</option>
              <option value="pending">Status: Pending</option>
              <option value="approved">Status: Approved</option>
              <option value="rejected">Status: Rejected</option>
              <option value="info_requested">Status: Info Requested</option>
              <option value="draft">Status: Draft</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ─── DESKTOP DATA TABLE ─── */}
      <div className="hidden md:block bg-white rounded-3xl border border-border shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-primary-bg/70 border-b border-border text-primary font-bold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-bold">Seller / Merchant</th>
                <th className="px-6 py-4 font-bold">Store</th>
                <th className="px-6 py-4 font-bold">Document Type</th>
                <th className="px-6 py-4 font-bold">ID / Reg Number</th>
                <th className="px-6 py-4 font-bold">Submitted Date</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 text-right font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-muted">
                    <Loader2 className="w-7 h-7 animate-spin mx-auto text-primary" />
                    <p className="mt-3 text-xs font-semibold text-slate-600">
                      Loading KYC verification records...
                    </p>
                  </td>
                </tr>
              ) : kycs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-muted">
                    <div className="w-12 h-12 rounded-full bg-primary-bg flex items-center justify-center mx-auto mb-3 text-primary">
                      <IdCard className="w-6 h-6" />
                    </div>
                    <p className="font-semibold text-slate-800 text-sm">No KYC submissions found</p>
                    <p className="text-xs text-muted mt-1">
                      Try adjusting your status filters or search terms.
                    </p>
                    {(statusFilter !== "all" || search) && (
                      <button
                        onClick={() => {
                          setStatusFilter("all");
                          setSearchInput("");
                          setSearch("");
                        }}
                        className="mt-3 text-xs font-bold text-primary hover:underline cursor-pointer"
                      >
                        Reset filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                kycs.map((item) => {
                  const sellerName = getSellerDisplayName(item);
                  const sellerEmail = getSellerEmail(item);
                  const storeName = item.store?.name || "—";
                  const isStoreLive = item.store?.isLive;

                  return (
                    <tr
                      key={item._id}
                      onClick={() => handleRowClick(item._id)}
                      className="hover:bg-bg-soft/70 transition-colors cursor-pointer group"
                    >
                      {/* Seller info */}
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-bg text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary-light/60">
                            {sellerName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-primary transition-colors">
                              {sellerName}
                            </div>
                            <div className="text-[11px] text-muted font-normal">
                              {sellerEmail}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Store */}
                      <td className="px-6 py-4 text-slate-700">
                        {item.store ? (
                          <div className="flex items-center gap-1.5 font-medium">
                            <StoreIcon className="w-3.5 h-3.5 text-muted" />
                            <span>{storeName}</span>
                            {isStoreLive && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Store is Live" />
                            )}
                          </div>
                        ) : (
                          <span className="text-muted text-xs">No store yet</span>
                        )}
                      </td>

                      {/* Doc Type */}
                      <td className="px-6 py-4 text-slate-700 font-medium">
                        {item.verificationType || "Identity Document"}
                      </td>

                      {/* ID Number */}
                      <td className="px-6 py-4 font-mono text-xs text-slate-600 font-medium">
                        {item.documentId || "—"}
                      </td>

                      {/* Submitted Date */}
                      <td className="px-6 py-4 text-xs text-muted">
                        {formatSubmissionDate(item.submittedAt || item.createdAt)}
                      </td>

                      {/* Status badge */}
                      <td className="px-6 py-4">
                        {getStatusBadge(item.status)}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <Link
                          href={`/dashboard/kyc/${item._id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
                        >
                          <span>Review</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── MOBILE CARD VIEW ─── */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="bg-white rounded-2xl p-8 border border-border text-center text-muted">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
            <p className="mt-2 text-xs">Loading KYC submissions...</p>
          </div>
        ) : kycs.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-border text-center text-muted space-y-2">
            <IdCard className="w-8 h-8 mx-auto text-primary opacity-60" />
            <p className="font-semibold text-slate-800 text-sm">No KYC submissions found</p>
            <p className="text-xs text-muted">Try adjusting your status filters.</p>
          </div>
        ) : (
          kycs.map((item) => {
            const sellerName = getSellerDisplayName(item);
            const sellerEmail = getSellerEmail(item);

            return (
              <div
                key={item._id}
                onClick={() => handleRowClick(item._id)}
                className="bg-white rounded-2xl p-4 border border-border shadow-2xs space-y-3 cursor-pointer active:scale-[0.99] transition-transform"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary-bg text-primary flex items-center justify-center font-bold text-xs shrink-0">
                      {sellerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{sellerName}</h4>
                      <p className="text-xs text-muted">{sellerEmail}</p>
                    </div>
                  </div>
                  <div>{getStatusBadge(item.status)}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-100">
                  <div>
                    <span className="text-muted block text-[11px]">Document Type</span>
                    <span className="font-semibold text-slate-700">
                      {item.verificationType || "Identity Document"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted block text-[11px]">ID Number</span>
                    <span className="font-mono text-slate-700 font-semibold">
                      {item.documentId || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted block text-[11px]">Store</span>
                    <span className="font-semibold text-slate-700">
                      {item.store?.name || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted block text-[11px]">Submitted</span>
                    <span className="text-slate-600">
                      {formatSubmissionDate(item.submittedAt || item.createdAt)}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/dashboard/kyc/${item._id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <span>Review Application</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })
        )}
      </div>

      {/* ─── PAGINATION BAR ─── */}
      {meta.totalPages > 1 && (
        <div className="bg-white px-4 py-3 rounded-2xl border border-border shadow-2xs flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing <span className="font-bold text-slate-900">{kycs.length}</span> of{" "}
            <span className="font-bold text-slate-900">{meta.total}</span> records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="px-3 py-1.5 rounded-xl border border-border hover:bg-bg-soft disabled:opacity-40 disabled:cursor-not-allowed font-semibold flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            <span className="font-bold text-slate-800 px-2">
              Page {meta.page} of {meta.totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page >= meta.totalPages || loading}
              className="px-3 py-1.5 rounded-xl border border-border hover:bg-bg-soft disabled:opacity-40 disabled:cursor-not-allowed font-semibold flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
