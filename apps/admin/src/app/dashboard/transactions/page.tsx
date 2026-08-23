"use client";

import React from "react";
import { ArrowLeftRight, Download } from "lucide-react";

export default function TransactionsPage() {
  const transactions = [
    {
      id: "TXN_991823",
      type: "Buyer Paystack Payment",
      amount: "₦145,000",
      status: "Success",
      fee: "₦2,175",
      reference: "HST-PAY-88219",
      date: "23 Aug 2026, 14:22",
    },
    {
      id: "TXN_991822",
      type: "Merchant Wallet Withdrawal",
      amount: "₦320,000",
      status: "Success",
      fee: "₦50",
      reference: "HST-WTH-00129",
      date: "23 Aug 2026, 11:05",
    },
    {
      id: "TXN_991821",
      type: "Pro Plan Subscription",
      amount: "₦15,000",
      status: "Success",
      fee: "₦225",
      reference: "HST-SUB-44120",
      date: "22 Aug 2026, 19:40",
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0A0E11] tracking-tight">
            Platform Transactions & Settlement
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Complete audit trail of all Paystack card/transfer charges and
            wallet disbursements.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200/70 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-primary-bg border-b border-gray-200 text-primary font-bold">
              <tr>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Platform Fee</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-slate-700">
              {transactions.map((txn) => (
                <tr
                  key={txn.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">
                    {txn.id}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {txn.type}
                  </td>
                  <td className="px-6 py-4 font-extrabold text-slate-900">
                    {txn.amount}
                  </td>
                  <td className="px-6 py-4 text-emerald-700 font-semibold">
                    {txn.fee}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700">
                      {txn.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {txn.date}
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
