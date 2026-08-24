"use client";

import React, { useEffect, useState } from "react";
import {
  Gift,
  Search,
  ChevronLeft,
  ChevronRight,
  Save,
  Loader2,
  CheckCircle2,
  Users,
  TrendingUp,
  Wallet,
  Undo2,
  AlertCircle,
} from "lucide-react";
import { adminReferralsService, adminSettingsService, type ReferralRecord, type ReferralStats, type PlatformSettings } from "@/lib/api";
import ConfirmDialog, { type ConfirmDialogConfig } from "@/components/ConfirmDialog";

function formatMoney(n: number | undefined | null) {
  const value = n || 0;
  if (value >= 1_000_000) return `₦${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `₦${(value / 1_000).toFixed(1)}K`;
  return `₦${value.toLocaleString()}`;
}

const PAGE_LIMIT = 20;

export default function ReferralsPage() {
  // Settings state
  const [settings, setSettings] = useState<PlatformSettings>({
    escrowAutoReleaseHours: 72,
    platformCommissionPercent: 10,
    referralProgramEnabled: true,
    referralBuyerVoucherAmount: 2000,
    referralSellerDiscountPercent: 5,
    referralSellerDiscountOrders: 3,
  });
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Table state
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [stats, setStats] = useState<ReferralStats>({});
  const [tableLoading, setTableLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);

  // Reverse state
  const [dialog, setDialog] = useState<ConfirmDialogConfig | null>(null);
  const [reversingId, setReversingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setSettingsLoading(true);
      adminSettingsService
        .get()
        .then((res) => {
          if (!active) return;
          if (res?.settings) {
            setSettings(res.settings);
          }
          setSettingsLoading(false);
        })
        .catch(() => {
          if (active) setSettingsLoading(false);
        });
    });
    return () => {
      active = false;
    };
  }, []);

  const loadReferrals = async () => {
    setTableLoading(true);
    setError(null);
    try {
      const res = await adminReferralsService.list();
      setReferrals(res.referrals || []);
      setStats(res.stats || {});
    } catch {
      setReferrals([]);
      setStats({});
      setError("Failed to load referrals. Please check your network connection.");
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    void loadReferrals();
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await adminSettingsService.update(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Failed to save referral settings:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleReverse = (r: ReferralRecord) => {
    setDialog({
      title: "Reverse referral reward?",
      message: `The referral from ${r.referrer?.name || "this referrer"} to ${
        r.referee?.name || "this user"
      } will be marked expired and reward reversed.`,
      variant: "danger",
      confirmLabel: "Reverse reward",
      showInput: true,
      inputLabel: "Reason (required)",
      inputPlaceholder: "e.g. Self-referral or policy violation",
      inputRequired: true,
      onConfirm: async (reason) => {
        setDialog(null);
        setReversingId(r._id);
        try {
          await adminReferralsService.reverse(r._id, reason);
          setReferrals((prev) =>
            prev.map((item) => (item._id === r._id ? { ...item, status: "expired" } : item)),
          );
        } catch {
          console.error("Failed to reverse");
        } finally {
          setReversingId(null);
        }
      },
    });
  };

  const filteredReferrals = referrals.filter((r) => {
    const term = searchInput.toLowerCase();
    return (
      r.referrer?.name?.toLowerCase().includes(term) ||
      r.referee?.name?.toLowerCase().includes(term) ||
      r.referrer?.email?.toLowerCase().includes(term) ||
      r.referee?.email?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#0A0E11] tracking-tight flex items-center gap-2.5">
          <Gift className="w-6 h-6 text-primary" />
          Referral & Growth Program
        </h1>
        <p className="text-sm text-gray-500 font-medium mt-1">
          Configure referral commissions, buyer incentive vouchers, and monitor reward disbursements.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-gray-200/70 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Referrals</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.totalReferrals ?? 0}</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-primary-bg text-primary flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200/70 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Conversion Rate</span>
            <p className="text-2xl font-extrabold text-emerald-700 mt-1">{stats.conversionRate ?? 0}%</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200/70 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Paid Out</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{formatMoney(stats.totalRewarded)}</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-primary-bg text-primary flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Program Settings Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/70 shadow-xs space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary-bg text-primary flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Referral Program Parameters</h3>
              <p className="text-xs text-gray-400 mt-0.5">Toggle live status and configure buyer & merchant rewards</p>
            </div>
          </div>

          {settingsLoading ? (
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          ) : (
            <button
              onClick={() =>
                setSettings((prev) => ({
                  ...prev,
                  referralProgramEnabled: !prev.referralProgramEnabled,
                }))
              }
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                settings.referralProgramEnabled ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
              }`}
            >
              {settings.referralProgramEnabled ? "Active" : "Disabled"}
            </button>
          )}
        </div>

        {!settingsLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 border-t border-gray-100">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">Buyer Voucher Bonus (NGN)</label>
              <p className="text-[11px] text-gray-400 mb-2">Issued to referee upon first purchase</p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500">₦</span>
                <input
                  type="number"
                  min="0"
                  value={settings.referralBuyerVoucherAmount ?? 2000}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, referralBuyerVoucherAmount: Number(e.target.value) }))
                  }
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">Merchant Commission Discount (%)</label>
              <p className="text-[11px] text-gray-400 mb-2">Discount off standard platform commission</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={settings.referralSellerDiscountPercent ?? 5}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, referralSellerDiscountPercent: Number(e.target.value) }))
                  }
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-primary"
                />
                <span className="text-xs font-bold text-gray-500">%</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">Applicable Orders Window</label>
              <p className="text-[11px] text-gray-400 mb-2">Consecutive sales covered by discount</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={settings.referralSellerDiscountOrders ?? 3}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, referralSellerDiscountOrders: Number(e.target.value) }))
                  }
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-primary"
                />
                <span className="text-xs font-bold text-gray-500">orders</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSaveSettings}
            disabled={saving || settingsLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Program Parameters</span>
          </button>
          {saved && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Settings saved!
            </span>
          )}
        </div>
      </div>

      {/* Referrals Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-bold text-slate-900">Referral Records</h3>
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search referrer or referee..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-white border border-gray-200 pl-9 pr-4 py-2 rounded-full text-xs outline-none focus:border-primary shadow-xs"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200/70 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-primary-bg border-b border-gray-200 text-primary font-bold">
                <tr>
                  <th className="px-6 py-4">Referrer</th>
                  <th className="px-6 py-4">Referee</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Reward</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-700">
                {tableLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400 text-xs">
                      Loading referral records...
                    </td>
                  </tr>
                ) : filteredReferrals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400 text-xs">
                      No referral records found.
                    </td>
                  </tr>
                ) : (
                  filteredReferrals.map((r) => (
                    <tr key={r._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">{r.referrer?.name || "N/A"}</p>
                        <p className="text-gray-400 text-[11px]">{r.referrer?.email || ""}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">{r.referee?.name || "N/A"}</p>
                        <p className="text-gray-400 text-[11px]">{r.referee?.email || ""}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold capitalize ${
                            r.status === "rewarded"
                              ? "bg-emerald-50 text-emerald-700"
                              : r.status === "expired"
                              ? "bg-rose-50 text-rose-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {r.status || "pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-extrabold text-slate-900">
                        {r.rewardAmount ? formatMoney(r.rewardAmount) : "—"}
                        {r.rewardType && <span className="text-gray-400 text-xs font-normal ml-1">({r.rewardType})</span>}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {r.createdAt
                          ? new Date(r.createdAt).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {r.status === "rewarded" ? (
                          <button
                            onClick={() => handleReverse(r)}
                            disabled={reversingId === r._id}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-rose-200 text-rose-600 text-xs font-bold hover:bg-rose-50 transition-colors disabled:opacity-50"
                          >
                            {reversingId === r._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Undo2 className="w-3 h-3" />}
                            <span>Reverse</span>
                          </button>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmDialog config={dialog} onClose={() => setDialog(null)} />
    </div>
  );
}
