"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  X,
  ArrowUpDown,
  Receipt,
  ArrowDownCircle,
  ArrowUpCircle,
  RotateCcw,
  Gift,
  Ticket,
  PiggyBank,
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  FileSpreadsheet,
  FileType,
  CreditCard,
  Percent,
  Undo2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import {
  adminTransactionsService,
  type Transaction,
  type TransactionStats,
  type TransactionType,
  type TransactionStatus,
} from "@/lib/api";

const TYPE_META: Record<TransactionType, { label: string; icon: React.ComponentType<{ className?: string }>; classes: string; description: string }> = {
  buyer_payment: { label: "Buyer Payment", icon: CreditCard, classes: "bg-blue-50 text-blue-700", description: "Customer gateway payment held in escrow until delivery is verified." },
  escrow_credit: { label: "Escrow Credit", icon: ArrowDownCircle, classes: "bg-emerald-50 text-emerald-700", description: "Escrow released to merchant withdrawable wallet upon confirmed fulfillment." },
  withdrawal: { label: "Withdrawal", icon: ArrowUpCircle, classes: "bg-indigo-50 text-indigo-700", description: "Merchant bank transfer withdrawal request dispatched via Paystack." },
  withdrawal_reversal: { label: "Withdrawal Reversal", icon: RotateCcw, classes: "bg-amber-50 text-amber-700", description: "Returned or rejected payout credited back to merchant wallet." },
  referral_bonus: { label: "Referral Bonus", icon: Gift, classes: "bg-violet-50 text-violet-700", description: "Incentive bonus credited for referring a new merchant or customer." },
  referral_reversal: { label: "Referral Reversal", icon: RotateCcw, classes: "bg-rose-50 text-rose-700", description: "Clawed-back referral incentive due to cancellation or policy violation." },
  voucher_redemption: { label: "Voucher Redemption", icon: Ticket, classes: "bg-sky-50 text-sky-700", description: "Promotional discount voucher redeemed at checkout." },
  commission: { label: "Platform Commission", icon: Percent, classes: "bg-fuchsia-50 text-fuchsia-700", description: "Platform revenue fee deducted during settlement." },
  refund: { label: "Refund", icon: Undo2, classes: "bg-rose-50 text-rose-700", description: "Payment refunded to customer following dispute arbitration." },
  escrow_reversal: { label: "Escrow Reversal", icon: RotateCcw, classes: "bg-amber-50 text-amber-800", description: "Escrow balance deducted for chargeback or dispute." },
  manual_adjustment: { label: "Manual Adjustment", icon: Wallet, classes: "bg-slate-100 text-slate-700", description: "Admin ledger credit or debit adjustment." },
};

const STATUS_META: Record<TransactionStatus, { label: string; classes: string; icon: React.ComponentType<{ className?: string }> }> = {
  completed: { label: "Completed", classes: "bg-emerald-50 text-emerald-700", icon: CheckCircle2 },
  pending: { label: "Pending", classes: "bg-amber-50 text-amber-700", icon: Clock },
  failed: { label: "Failed", classes: "bg-rose-50 text-rose-700", icon: XCircle },
  awaiting_approval: { label: "Awaiting Approval", classes: "bg-amber-50 text-amber-700", icon: Clock },
  approved: { label: "Approved", classes: "bg-blue-50 text-blue-700", icon: CheckCircle2 },
  dispatched: { label: "Dispatched", classes: "bg-indigo-50 text-indigo-700", icon: ArrowUpCircle },
  rejected: { label: "Rejected", classes: "bg-rose-50 text-rose-700", icon: XCircle },
};

function formatNgn(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  return `${sign}₦${Math.abs(amount).toLocaleString("en-NG")}`;
}

function formatCompact(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}M`;
  if (Math.abs(amount) >= 1_000) return `₦${(amount / 1_000).toFixed(1)}K`;
  return `₦${amount.toLocaleString("en-NG")}`;
}

function InfoBadge({ children, tooltip }: { children: React.ReactNode; tooltip: string }) {
  return (
    <span className="relative group/badge inline-flex max-w-full">
      {children}
      <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-1.5 -translate-x-1/2 w-56 rounded-xl bg-slate-900 px-3 py-2 text-[11px] font-normal leading-snug text-white shadow-xl opacity-0 group-hover/badge:opacity-100 transition-opacity duration-150 whitespace-normal text-left">
        {tooltip}
      </span>
    </span>
  );
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;

  // Filters
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [gatewayFilter, setGatewayFilter] = useState("All");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminTransactionsService.getStats().then(setStats).catch(() => {});
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminTransactionsService.listTransactions({
        type: typeFilter !== "All" ? typeFilter : undefined,
        status: statusFilter !== "All" ? statusFilter : undefined,
        gateway: gatewayFilter !== "All" ? gatewayFilter : undefined,
        search: searchQuery || undefined,
        page,
        limit,
      });
      setTransactions(res.transactions || []);
      setTotal(res.total || 0);
    } catch {
      setTransactions([]);
      setTotal(0);
      setError("Failed to load transactions. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTransactions();
  }, [typeFilter, statusFilter, gatewayFilter, searchQuery, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(searchInput.trim());
  };

  const statCards = [
    { label: "Total Transactions", value: (stats?.totalTransactions ?? total).toLocaleString(), icon: Receipt },
    { label: "Gross Volume", value: stats?.grossVolume != null ? formatCompact(stats.grossVolume) : "—", icon: PiggyBank },
    { label: "Completed", value: (stats?.completed ?? 0).toLocaleString(), icon: CheckCircle2, color: "text-emerald-700" },
    { label: "Pending Payouts", value: (stats?.pendingWithdrawals ?? 0).toLocaleString(), icon: Wallet, color: "text-amber-700" },
  ];

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0A0E11] tracking-tight flex items-center gap-2.5">
            <Receipt className="w-6 h-6 text-primary" />
            Platform Transactions & Settlement
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Complete financial ledger of customer card payments, escrow allocations, merchant payouts, and fee deductions.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div key={idx} className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200/70 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{c.label}</span>
                <p className={`text-2xl font-extrabold mt-1 ${c.color || "text-[#0A0E11]"}`}>{c.value}</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-primary-bg text-primary flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="appearance-none bg-white border border-gray-200 px-4 py-2.5 pr-8 rounded-full text-xs font-bold text-slate-800 outline-none focus:border-primary shadow-xs cursor-pointer"
            >
              <option value="All">Type: All</option>
              <option value="buyer_payment">Buyer Payment</option>
              <option value="escrow_credit">Escrow Credit</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="commission">Commission</option>
              <option value="refund">Refund</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="appearance-none bg-white border border-gray-200 px-4 py-2.5 pr-8 rounded-full text-xs font-bold text-slate-800 outline-none focus:border-primary shadow-xs cursor-pointer"
            >
              <option value="All">Status: All</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search reference, party..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-white border border-gray-200 pl-10 pr-4 py-2.5 rounded-full text-xs font-medium text-slate-800 placeholder-gray-400 shadow-xs outline-none focus:border-primary transition-all"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-200/70 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-primary-bg border-b border-gray-200 text-primary font-bold">
              <tr>
                <th className="px-6 py-4">Reference</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Party</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 text-xs">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                    <p className="mt-2">Loading financial transactions...</p>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 text-xs">
                    No transactions found matching filters.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const typeMeta = TYPE_META[tx.type] || { label: tx.type, icon: Receipt, classes: "bg-gray-100 text-gray-700", description: "" };
                  const TypeIcon = typeMeta.icon;
                  const statusMeta = STATUS_META[tx.status] || STATUS_META.completed;
                  const party = tx.customer || tx.seller;

                  return (
                    <tr key={tx._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-mono font-bold text-slate-900">{tx.reference}</div>
                        {tx.orderRef && <div className="text-[11px] text-gray-400">Order #{tx.orderRef}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <InfoBadge tooltip={typeMeta.description}>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${typeMeta.classes}`}>
                            <TypeIcon className="w-3.5 h-3.5" />
                            <span>{typeMeta.label}</span>
                          </span>
                        </InfoBadge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{party?.storeName || party?.name || "Platform"}</div>
                        <div className="text-[11px] text-gray-400">{party?.email || "Paystack Gateway"}</div>
                      </td>
                      <td className="px-6 py-4 font-extrabold text-slate-900">
                        {formatNgn(tx.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${statusMeta.classes}`}>
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {new Date(tx.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedTx(tx)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-slate-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
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
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
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

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-slate-900">Transaction Details</h3>
              <button onClick={() => setSelectedTx(null)} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase">Gross Amount</span>
                <p className="text-2xl font-extrabold text-slate-900">{formatNgn(selectedTx.amount)}</p>
                <span className="text-xs text-emerald-700 font-bold block">{selectedTx.status.toUpperCase()}</span>
              </div>

              <div className="space-y-2 pt-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-400">Reference:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedTx.reference}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-400">Type:</span>
                  <span className="font-bold text-slate-800">{TYPE_META[selectedTx.type]?.label || selectedTx.type}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-400">Gateway:</span>
                  <span className="font-bold text-slate-800">{selectedTx.gateway || "Paystack"}</span>
                </div>
                {selectedTx.bankName && (
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-gray-400">Bank Destination:</span>
                    <span className="font-bold text-slate-800">{selectedTx.bankName} ({selectedTx.accountNumber})</span>
                  </div>
                )}
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-400">Timestamp:</span>
                  <span className="text-slate-700">{new Date(selectedTx.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-5 py-2 rounded-full bg-slate-800 text-white text-xs font-bold hover:bg-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
