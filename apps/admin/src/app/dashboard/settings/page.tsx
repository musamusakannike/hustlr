"use client";

import React, { useState } from "react";
import { Settings, Save, Shield, Percent, Clock } from "lucide-react";

export default function SettingsPage() {
  const [escrowDays, setEscrowDays] = useState(3);
  const [defaultCommission, setDefaultCommission] = useState(10);
  const [referralBonus, setReferralBonus] = useState(5000);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 font-sans max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-[#0A0E11] tracking-tight">
          Platform Global Settings
        </h1>
        <p className="text-sm text-gray-500 font-medium mt-1">
          Adjust escrow hold timelines, marketplace commissions, and platform
          parameters.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/70 shadow-xs space-y-6"
      >
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-1">
            Escrow Auto-Release Window (Days)
          </label>
          <p className="text-xs text-gray-400 mb-2">
            Number of days after confirmed delivery before escrow funds
            automatically unlock for payout.
          </p>
          <input
            type="number"
            value={escrowDays}
            onChange={(e) => setEscrowDays(Number(e.target.value))}
            className="w-full sm:w-64 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold outline-none focus:border-primary"
          />
        </div>

        <div className="pt-4 border-t border-gray-100">
          <label className="block text-sm font-bold text-slate-800 mb-1">
            Default Free Tier Commission (%)
          </label>
          <p className="text-xs text-gray-400 mb-2">
            Percentage deduction taken from free-tier merchant sales during
            Paystack settlement.
          </p>
          <input
            type="number"
            value={defaultCommission}
            onChange={(e) => setDefaultCommission(Number(e.target.value))}
            className="w-full sm:w-64 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold outline-none focus:border-primary"
          />
        </div>

        <div className="pt-4 border-t border-gray-100">
          <label className="block text-sm font-bold text-slate-800 mb-1">
            Seller Referral Cash Bonus (NGN)
          </label>
          <p className="text-xs text-gray-400 mb-2">
            Reward credited to an active seller upon a referred merchant
            reaching their first ₦100,000 GMV.
          </p>
          <input
            type="number"
            value={referralBonus}
            onChange={(e) => setReferralBonus(Number(e.target.value))}
            className="w-full sm:w-64 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold outline-none focus:border-primary"
          />
        </div>

        <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
          <button
            type="submit"
            className="px-6 py-3 rounded-full bg-primary hover:bg-primary-hoverover text-white text-sm font-bold shadow-sm transition-all"
          >
            Save Platform Settings
          </button>
          {saved && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full animate-in fade-in">
              Settings updated successfully!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
