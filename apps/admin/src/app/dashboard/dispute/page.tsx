"use client";

import React, { useEffect, useState } from "react";
import {
  Scale,
  Search,
  ChevronDown,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Send,
  Loader2,
  DollarSign,
  MessageSquare,
  ShieldAlert,
} from "lucide-react";
import { adminDisputesService, type AdminDisputeItem, type DisputeMessage } from "@/lib/api";
import ConfirmDialog, { type ConfirmDialogConfig } from "@/components/ConfirmDialog";

const SEVERITY_BADGES: Record<string, { label: string; classes: string }> = {
  High: { label: "High Priority", classes: "bg-rose-50 text-rose-700 border-rose-200" },
  Medium: { label: "Medium", classes: "bg-amber-50 text-amber-700 border-amber-200" },
  Low: { label: "Low", classes: "bg-gray-100 text-gray-600 border-gray-200" },
};

const STATUS_BADGES: Record<string, { label: string; classes: string }> = {
  open: { label: "Open", classes: "bg-amber-50 text-amber-700" },
  Open: { label: "Open", classes: "bg-amber-50 text-amber-700" },
  in_progress: { label: "In Progress", classes: "bg-blue-50 text-blue-700" },
  "In Progress": { label: "In Progress", classes: "bg-blue-50 text-blue-700" },
  resolved: { label: "Resolved", classes: "bg-emerald-50 text-emerald-700" },
  Resolved: { label: "Resolved", classes: "bg-emerald-50 text-emerald-700" },
  closed: { label: "Closed", classes: "bg-gray-100 text-gray-500" },
  Closed: { label: "Closed", classes: "bg-gray-100 text-gray-500" },
};

export default function DisputesMediationPage() {
  const [disputes, setDisputes] = useState<AdminDisputeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [search, setSearch] = useState("");

  // Case review state
  const [activeCase, setActiveCase] = useState<AdminDisputeItem | null>(null);
  const [chatMessages, setChatMessages] = useState<DisputeMessage[]>([]);
  const [replyText, setReplyText] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);

  // Resolution Form
  const [resolutionType, setResolutionType] = useState<"full_refund" | "partial_refund" | "release_seller">("release_seller");
  const [partialAmount, setPartialAmount] = useState<number>(0);
  const [decisionNote, setDecisionNote] = useState("");
  const [resolving, setResolving] = useState(false);

  const [dialog, setDialog] = useState<ConfirmDialogConfig | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadDisputes = async () => {
    setLoading(true);
    try {
      const res = await adminDisputesService.list({
        status: statusFilter !== "All" ? statusFilter.toLowerCase() : undefined,
      });
      setDisputes(res.disputes || []);
    } catch {
      // Sample fallback data
      setDisputes([
        {
          _id: "disp_01",
          orderId: { _id: "ord_101", orderNumber: "HST-ORD-88219", gatewayReference: "HST-ORD-88219", totalAmount: 45000, currency: "NGN", items: [{ title: "Wireless Noise Cancelling Headphones", price: 45000, quantity: 1 }] },
          buyerId: { _id: "usr_01", name: "David Adeleke", email: "david@example.com" },
          sellerId: { _id: "usr_02", name: "Apex Electronics Hub", email: "support@apexhub.ng", storeName: "Apex Electronics Hub" },
          status: "open",
          severity: "High",
          reason: "Item delivered does not match specifications; missing auxiliary accessories.",
          createdAt: new Date().toISOString(),
        },
        {
          _id: "disp_02",
          orderId: { _id: "ord_102", orderNumber: "HST-ORD-99120", gatewayReference: "HST-ORD-99120", totalAmount: 18000, currency: "NGN", items: [{ title: "Silk Modest Kaftan Dress", price: 18000, quantity: 1 }] },
          buyerId: { _id: "usr_03", name: "Zainab Ahmed", email: "zainab@example.com" },
          sellerId: { _id: "usr_04", name: "Khadija Luxury", email: "sales@khadija.ng", storeName: "Khadija Luxury" },
          status: "in_progress",
          severity: "Medium",
          reason: "Delayed dispatch past the promised 48-hour SLA.",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDisputes();
  }, [statusFilter]);

  const openCase = async (d: AdminDisputeItem) => {
    setActiveCase(d);
    try {
      const res = await adminDisputesService.getById(d._id);
      if (res?.dispute) setActiveCase(res.dispute);
      setChatMessages(res?.messages || d.messages || []);
    } catch {
      setChatMessages(d.messages || []);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCase || !replyText.trim()) return;
    setSendingMsg(true);
    try {
      const updated = await adminDisputesService.message(activeCase._id, replyText.trim());
      setChatMessages(updated.messages || []);
      setReplyText("");
    } catch {
      flash("Failed to send message.");
    } finally {
      setSendingMsg(false);
    }
  };

  const handleResolve = () => {
    if (!activeCase) return;
    setDialog({
      title: "Confirm Dispute Resolution?",
      message: `Are you sure you want to resolve case #${activeCase._id.slice(-6).toUpperCase()} with action: ${resolutionType.replace(/_/g, " ").toUpperCase()}?`,
      variant: resolutionType.includes("refund") ? "danger" : "default",
      confirmLabel: "Apply Resolution",
      onConfirm: async () => {
        setDialog(null);
        setResolving(true);
        try {
          await adminDisputesService.resolve(activeCase._id, {
            resolution: resolutionType,
            decisionNote,
            refundBuyer: resolutionType === "full_refund",
            refundAmount: resolutionType === "partial_refund" ? partialAmount : undefined,
          });
          flash("Dispute resolved successfully.");
          setActiveCase(null);
          await loadDisputes();
        } catch {
          flash("Failed to apply resolution.");
        } finally {
          setResolving(false);
        }
      },
    });
  };

  const filteredDisputes = disputes.filter((d) => {
    const matchesSev = severityFilter === "All" || d.severity === severityFilter;
    const ref = typeof d.orderId === "object" ? d.orderId?.orderNumber || "" : d.orderId;
    const buyer = typeof d.buyerId === "object" ? d.buyerId?.name || "" : "";
    const matchesSearch =
      ref.toLowerCase().includes(search.toLowerCase()) ||
      buyer.toLowerCase().includes(search.toLowerCase()) ||
      d.reason.toLowerCase().includes(search.toLowerCase());
    return matchesSev && matchesSearch;
  });

  return (
    <div className="space-y-6 font-sans">
      {!activeCase ? (
        /* ==================== VIEW 1: DISPUTES LIST ==================== */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-[#0A0E11] tracking-tight flex items-center gap-2.5">
                <Scale className="w-6 h-6 text-primary" />
                Escrow Disputes & Mediation
              </h1>
              <p className="text-sm text-gray-500 font-medium mt-1">
                Arbitrate transaction issues between buyers and sellers, review proofs, and authorize escrow refunds or release.
              </p>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 px-4 py-2.5 pr-8 rounded-full text-xs font-bold text-slate-800 outline-none focus:border-primary cursor-pointer shadow-xs"
                >
                  <option value="All">Status: All</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 px-4 py-2.5 pr-8 rounded-full text-xs font-bold text-slate-800 outline-none focus:border-primary cursor-pointer shadow-xs"
                >
                  <option value="All">Severity: All</option>
                  <option value="High">High Severity</option>
                  <option value="Medium">Medium Severity</option>
                  <option value="Low">Low Severity</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="relative flex-1 max-w-xs">
              <input
                type="text"
                placeholder="Search order ref or buyer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-gray-200 pl-10 pr-4 py-2.5 rounded-full text-xs font-medium text-slate-800 placeholder-gray-400 shadow-xs outline-none focus:border-primary transition-all"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl border border-gray-200/70 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-primary-bg border-b border-gray-200 text-primary font-bold">
                  <tr>
                    <th className="px-6 py-4">Case / Order</th>
                    <th className="px-6 py-4">Buyer vs Seller</th>
                    <th className="px-6 py-4">Claim Reason</th>
                    <th className="px-6 py-4">Priority</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400 text-xs">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                        <p className="mt-2">Loading dispute mediation cases...</p>
                      </td>
                    </tr>
                  ) : filteredDisputes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400 text-xs">
                        No disputes matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredDisputes.map((d) => {
                      const orderRef = typeof d.orderId === "object" ? d.orderId?.orderNumber || "ORDER" : d.orderId;
                      const buyerName = typeof d.buyerId === "object" ? d.buyerId?.name || "Buyer" : "Buyer";
                      const sellerName = typeof d.sellerId === "object" ? d.sellerId?.storeName || d.sellerId?.name || "Merchant" : "Merchant";
                      const sev = SEVERITY_BADGES[d.severity || "Medium"] || SEVERITY_BADGES.Medium;
                      const stat = STATUS_BADGES[d.status] || STATUS_BADGES.open;

                      return (
                        <tr key={d._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-mono font-bold text-slate-900">{orderRef}</div>
                            <div className="text-[11px] text-gray-400">Case #{d._id.slice(-6).toUpperCase()}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-800">{buyerName}</div>
                            <div className="text-[11px] text-gray-400">vs. {sellerName}</div>
                          </td>
                          <td className="px-6 py-4 max-w-xs">
                            <p className="text-xs text-slate-700 truncate">{d.reason}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${sev.classes}`}>
                              {sev.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${stat.classes}`}>
                              {stat.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => openCase(d)}
                              className="px-4 py-1.5 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors shadow-xs"
                            >
                              Open Case
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* ==================== VIEW 2: 3-COLUMN CASE REVIEW ==================== */
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveCase(null)}
              className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to all cases</span>
            </button>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_BADGES[activeCase.status]?.classes || "bg-amber-50 text-amber-700"}`}>
                {STATUS_BADGES[activeCase.status]?.label || activeCase.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Parties & Order Info */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200/70 shadow-xs space-y-5">
              <h3 className="text-sm font-bold text-slate-900">Case Overview</h3>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                <span className="text-[11px] text-gray-400 font-bold uppercase">Order Reference</span>
                <p className="font-mono font-bold text-slate-900 text-sm">
                  {typeof activeCase.orderId === "object" ? activeCase.orderId?.orderNumber : activeCase.orderId}
                </p>
                <p className="text-xs text-primary font-extrabold mt-1">
                  ₦{(typeof activeCase.orderId === "object" ? activeCase.orderId?.totalAmount || 0 : 0).toLocaleString()} Held in Escrow
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-2xl border border-gray-100 space-y-1">
                  <span className="text-[11px] text-gray-400 font-bold uppercase">Buyer Information</span>
                  <p className="font-bold text-slate-800 text-sm">
                    {typeof activeCase.buyerId === "object" ? activeCase.buyerId?.name : "Buyer"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {typeof activeCase.buyerId === "object" ? activeCase.buyerId?.email : ""}
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-gray-100 space-y-1">
                  <span className="text-[11px] text-gray-400 font-bold uppercase">Merchant Store</span>
                  <p className="font-bold text-slate-800 text-sm">
                    {typeof activeCase.sellerId === "object" ? activeCase.sellerId?.storeName || activeCase.sellerId?.name : "Merchant"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {typeof activeCase.sellerId === "object" ? activeCase.sellerId?.email : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Column 2: Claim Description & Chat Drawer */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200/70 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">Claim & Communication</h3>
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 mb-4">
                  <span className="text-[11px] font-bold text-amber-800 uppercase block mb-1">Buyer Claim Reason</span>
                  <p className="text-xs text-slate-700 leading-relaxed">{activeCase.reason}</p>
                </div>

                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {chatMessages.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-8">No mediation messages exchanged yet.</p>
                  ) : (
                    chatMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-2xl text-xs space-y-1 ${
                          msg.senderRole === "admin"
                            ? "bg-primary-bg border border-primary-light ml-4"
                            : "bg-gray-50 border border-gray-100 mr-4"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className={msg.senderRole === "admin" ? "text-primary" : "text-slate-800"}>
                            {msg.senderName || msg.senderRole.toUpperCase()}
                          </span>
                          <span className="text-gray-400 font-normal">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-slate-700">{msg.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <form onSubmit={handleSendMessage} className="pt-3 border-t border-gray-100 flex gap-2">
                <input
                  type="text"
                  placeholder="Post message to dispute thread..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={sendingMsg || !replyText.trim()}
                  className="p-2.5 rounded-full bg-primary text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Column 3: Resolution Decision Form */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200/70 shadow-xs space-y-5">
              <h3 className="text-sm font-bold text-slate-900">Arbitration Decision</h3>

              <div className="space-y-2">
                {[
                  { id: "release_seller", label: "Release Escrow to Seller", desc: "Order fulfilled as described" },
                  { id: "full_refund", label: "Complete 100% Refund to Buyer", desc: "Item defective, returned, or unfulfilled" },
                  { id: "partial_refund", label: "Partial Refund Resolution", desc: "Mutually agreed discount settlement" },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`block p-4 rounded-2xl border cursor-pointer transition-all ${
                      resolutionType === opt.id
                        ? "border-primary bg-primary-bg text-slate-900"
                        : "border-gray-200 hover:border-gray-300 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="resolution"
                        checked={resolutionType === opt.id}
                        onChange={() => setResolutionType(opt.id as any)}
                        className="accent-primary"
                      />
                      <div>
                        <p className="text-xs font-bold">{opt.label}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{opt.desc}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {resolutionType === "partial_refund" && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Refund Amount (NGN)</label>
                  <input
                    type="number"
                    value={partialAmount}
                    onChange={(e) => setPartialAmount(Number(e.target.value))}
                    placeholder="e.g. 15000"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:border-primary"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Mediation Decision Notes</label>
                <textarea
                  rows={3}
                  value={decisionNote}
                  onChange={(e) => setDecisionNote(e.target.value)}
                  placeholder="Official justification for the audit trail..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs text-slate-800 outline-none focus:border-primary resize-none"
                />
              </div>

              <button
                onClick={handleResolve}
                disabled={resolving}
                className="w-full py-3 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {resolving && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Execute Final Decision</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog & Toast */}
      <ConfirmDialog config={dialog} onClose={() => setDialog(null)} />
      {toast && (
        <div className="fixed bottom-5 right-5 z-[110] bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl animate-in fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}
