"use client";

import React from "react";
import { Gift, ArrowRight } from "lucide-react";

export default function ReferralsPage() {
  const referrals = [
    {
      id: "REF_01",
      referrer: "Oluwaseun Bakare (HSTLR99)",
      referee: "Ibrahim Adeleke",
      type: "Merchant Referral",
      reward: "₦5,000 Cash Bonus",
      status: "Rewarded",
      date: "20 Aug 2026",
    },
    {
      id: "REF_02",
      referrer: "Khadija Luxury (KHDJ10)",
      referee: "Zainab Ahmed",
      type: "Buyer Referral",
      reward: "5% Discount Voucher",
      status: "Pending First Order",
      date: "22 Aug 2026",
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0A0E11] tracking-tight">
            Referral & Growth Tracking
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Monitor merchant referral payouts and customer invite reward
            distributions.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200/70 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-primary-bg border-b border-gray-200 text-primary font-bold">
              <tr>
                <th className="px-6 py-4">Referral ID</th>
                <th className="px-6 py-4">Referrer</th>
                <th className="px-6 py-4">Referee</th>
                <th className="px-6 py-4">Reward Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-slate-700">
              {referrals.map((ref) => (
                <tr
                  key={ref.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">
                    {ref.id}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {ref.referrer}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{ref.referee}</td>
                  <td className="px-6 py-4 font-bold text-emerald-700">
                    {ref.reward}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${
                        ref.status === "Rewarded"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {ref.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {ref.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
