"use client";

import React, { useState, useEffect } from "react";
import { Save, Loader2, CheckCircle2, Percent, Clock, Banknote, RefreshCw, Settings2 } from "lucide-react";
import { adminSettingsService, type PlatformSettings } from "@/lib/api";

export default function SettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>({
    platformCommissionPercent: 10,
    escrowAutoReleaseHours: 72,
    payoutGateway: "paystack",
    payoutCurrency: "NGN",
    minimumWithdrawalAmount: 1000,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setLoading(true);
      adminSettingsService
        .get()
        .then((res) => {
          if (!active) return;
          if (res.settings) {
            setSettings(res.settings);
          }
        })
        .catch((err) => {
          if (!active) return;
          console.error("Failed to fetch settings:", err);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    });
    return () => {
      active = false;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminSettingsService.update(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#0A0E11] tracking-tight flex items-center gap-2.5">
          <Settings2 className="w-6 h-6 text-primary" />
          Platform Global Settings
        </h1>
        <p className="text-sm text-gray-500 font-medium mt-1">
          Configure default marketplace transaction commissions, escrow auto-unlock windows, and payout thresholds.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Commission Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/70 shadow-xs">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-primary-bg text-primary flex items-center justify-center shrink-0">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Default Platform Commission</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Standard percentage deducted from merchant transactions during Paystack settlement.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pl-13">
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={settings.platformCommissionPercent}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  platformCommissionPercent: Number(e.target.value),
                }))
              }
              className="w-28 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-extrabold text-slate-900 outline-none focus:border-primary"
            />
            <span className="text-sm font-bold text-gray-500">%</span>
          </div>
        </div>

        {/* Auto-Release Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/70 shadow-xs">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Escrow Auto-Release Window</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Duration in hours after marked delivery before funds automatically unlock for merchant withdrawal.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pl-13">
            <input
              type="number"
              min="1"
              value={settings.escrowAutoReleaseHours}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  escrowAutoReleaseHours: Number(e.target.value),
                }))
              }
              className="w-28 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-extrabold text-slate-900 outline-none focus:border-primary"
            />
            <span className="text-sm font-bold text-gray-500">hours ({Math.round(settings.escrowAutoReleaseHours / 24)} days)</span>
          </div>
        </div>

        {/* Payout & Gateway Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/70 shadow-xs space-y-4">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Payout & Gateway Settlement</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Configure payout distribution channels and minimum transfer thresholds.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pl-13">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Disbursement Gateway</label>
              <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-slate-800">
                Paystack Transfers
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Settlement Currency</label>
              <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-slate-800">
                {settings.payoutCurrency || "NGN (Nigerian Naira)"}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Min Withdrawal (NGN)</label>
              <input
                type="number"
                min="100"
                value={settings.minimumWithdrawalAmount ?? 1000}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    minimumWithdrawalAmount: Number(e.target.value),
                  }))
                }
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Platform Settings</span>
          </button>
          {saved && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Settings saved successfully!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
