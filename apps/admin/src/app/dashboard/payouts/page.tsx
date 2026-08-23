"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Wallet,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  XCircle,
  Send,
  ArrowUpCircle,
  Clock,
  ShieldCheck,
  Flag,
} from "lucide-react";
import axios from "axios";
import { payoutsService, type PayoutRequest, type PayoutStatus } from "@/lib/api";

function errMsg(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err) && err.response?.data?.message) return String(err.response.data.message);
  if (err instanceof Error) return err.message;
  return fallback;
}

const STATUS_META: Record<PayoutStatus, { label: string; classes: string; icon: React.ComponentType<{ className?: string }> }> = {
  awaiting_approval: { label: "Awaiting approval", classes: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  pending: { label: "Awaiting approval", classes: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  approved: { label: "Approved", classes: "bg-blue-50 text-blue-700 border-blue-200", icon: CheckCircle2 },
  dispatched: { label: "Dispatched", classes: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: ArrowUpCircle },
  completed: { label: "Completed", classes: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  rejected: { label: "Rejected", classes: "bg-rose-50 text-rose-700 border-rose-200", icon: XCircle },
  failed: { label: "Failed", classes: "bg-rose-50 text-rose-700 border-rose-200", icon: XCircle },
};

const TABS: { key: PayoutStatus | "all"; label: string }[] = [
  { key: "awaiting_approval", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "dispatched", label: "Dispatched" },
  { key: "completed", label: "Completed" },
  { key: "rejected", label: "Rejected" },
  { key: "failed", label: "Failed" },
  { key: "all", label: "All" },
];

const PAGE_LIMIT = 20;

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<PayoutStatus | "all">("awaiting_approval");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [toast, setToast] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const status = tab === "all" ? undefined : tab;
      const res = await payoutsService.list({ status, page, limit: PAGE_LIMIT });
      setPayouts(res.payouts);
      setTotal(res.total);
    } catch (err: unknown) {
      setError(errMsg(err, "Failed to load payouts."));
    } finally {
      setLoading(false);
    }
  }, [tab, page]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const flash = (kind: "ok" | "err", msg: string) => {
    setToast({ kind, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleApprove = async (id: string) => {
    setActioningId(id);
    try {
      await payoutsService.approve(id);
      flash("ok", "Payout approved. Ready for dispatch.");
      await load();
    } catch (err: unknown) {
      flash("err", errMsg(err, "Approve failed."));
    } finally {
      setActioningId(null);
    }
  };

  const handleDispatch = async (id: string) => {
    setActioningId(id);
    try {
      const res = await payoutsService.dispatch(id);
      flash("ok", res.message || "Payout dispatched.");
      await load();
    } catch (err: unknown) {
      flash("err", errMsg(err, "Dispatch failed."));
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (id: string) => {
    setActioningId(id);
    try {
      await payoutsService.reject(id, rejectReason || undefined);
      flash("ok", "Payout rejected. Funds returned to wallet.");
      setRejectingId(null);
      setRejectReason("");
      await load();
    } catch (err: unknown) {
      flash("err", errMsg(err, "Reject failed."));
    } finally {
      setActioningId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  return (
    <div className="space-y-6 font-sans">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary-bg text-primary flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-[#0A0E11] tracking-tight">Merchant Payouts & Transfers</h1>
          </div>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Review seller withdrawal requests and dispatch Paystack transfer batches to Nigerian bank accounts.
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key);
              setPage(1);
            }}
            className={`px-4 py-2 text-xs font-bold rounded-full border transition-all ${
              tab === t.key
                ? "bg-primary text-white border-primary shadow-xs"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {toast && (
        <div
          className={`px-4 py-3 rounded-2xl text-xs font-bold shadow-xs animate-in fade-in ${
            toast.kind === "ok" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {error && (
        <div className="px-4 py-3 rounded-2xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-200/70 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-primary-bg border-b border-gray-200 text-primary font-bold">
              <tr>
                <th className="px-6 py-4">Seller</th>
                <th className="px-6 py-4">Reference</th>
                <th className="px-6 py-4 text-right">Amount (NGN)</th>
                <th className="px-6 py-4">Bank Details</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                    <p className="mt-2 text-xs">Loading payouts...</p>
                  </td>
                </tr>
              ) : payouts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-xs">
                    No payouts found in this view.
                  </td>
                </tr>
              ) : (
                payouts.map((p) => {
                  const StatusIcon = STATUS_META[p.status]?.icon || Clock;
                  const statusMeta = STATUS_META[p.status] || STATUS_META.awaiting_approval;

                  return (
                    <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{p.seller?.storeName || p.seller?.name || "Merchant"}</div>
                        <div className="text-[11px] text-gray-400">{p.seller?.email}</div>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-800 text-xs">
                        {p.reference || p._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-right font-extrabold text-slate-900">
                        ₦{(p.amount || p.ngnEquivalent || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{p.bankName || p.bankDetails?.bankName || "Bank Transfer"}</div>
                        <div className="text-[11px] text-gray-400">
                          {p.accountNumber || p.bankDetails?.accountNumber || "—"} • {p.bankDetails?.accountName || ""}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${statusMeta.classes}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusMeta.label}
                        </span>
                        {p.rejectionReason && <div className="text-[10px] text-rose-600 mt-1">{p.rejectionReason}</div>}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {new Date(p.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 flex-wrap">
                          {(p.status === "awaiting_approval" || p.status === "pending") && (
                            <>
                              <button
                                disabled={actioningId === p._id}
                                onClick={() => handleApprove(p._id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-xs"
                              >
                                {actioningId === p._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />} Approve
                              </button>
                              <button
                                disabled={actioningId === p._id}
                                onClick={() => {
                                  setRejectingId(rejectingId === p._id ? null : p._id);
                                  setRejectReason("");
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-rose-200 text-rose-600 font-semibold text-xs hover:bg-rose-50 transition-colors disabled:opacity-50"
                              >
                                <XCircle className="w-3 h-3" /> Reject
                              </button>
                            </>
                          )}
                          {p.status === "approved" && (
                            <button
                              disabled={actioningId === p._id}
                              onClick={() => handleDispatch(p._id)}
                              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-primary text-white font-bold text-xs hover:bg-primary-hover transition-colors disabled:opacity-50 shadow-xs"
                            >
                              {actioningId === p._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />} Dispatch Transfer
                            </button>
                          )}
                          {rejectingId === p._id && (
                            <div className="w-full mt-2 flex flex-col gap-2 p-3 bg-rose-50 rounded-2xl border border-rose-200 text-left">
                              <input
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Rejection reason..."
                                className="px-3 py-1.5 text-xs bg-white border border-rose-200 rounded-xl outline-none focus:ring-1 focus:ring-rose-400"
                              />
                              <div className="flex gap-2">
                                <button
                                  disabled={actioningId === p._id}
                                  onClick={() => handleReject(p._id)}
                                  className="px-3 py-1 text-xs font-bold rounded-full bg-rose-600 text-white hover:bg-rose-700"
                                >
                                  Confirm Reject
                                </button>
                                <button
                                  onClick={() => setRejectingId(null)}
                                  className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-200 text-slate-700"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pager */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 text-xs">
            <span className="text-gray-500">
              Showing {(page - 1) * PAGE_LIMIT + 1}–{Math.min(page * PAGE_LIMIT, total)} of {total}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-full border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1.5 font-bold text-slate-700">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-full border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
