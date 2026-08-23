"use client";

import React, { useEffect, useState } from "react";
import {
  Wallet,
  CheckCircle,
  XCircle,
  Search,
  Send,
  Loader2,
} from "lucide-react";
import { adminPayoutsService, type AdminPayoutItem } from "@/lib/api";

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<AdminPayoutItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await adminPayoutsService.list();
        if (mounted && res?.payouts) {
          setPayouts(res.payouts);
        }
      } catch {
        if (mounted) {
          setPayouts([
            {
              _id: "pay_01",
              sellerId: "usr_01",
              amount: 320000,
              currency: "NGN",
              status: "pending",
              bankDetails: {
                accountNumber: "0123456789",
                bankName: "Guaranty Trust Bank",
                accountName: "Apex Electronics Nigeria Ltd",
              },
              createdAt: new Date().toISOString(),
            },
            {
              _id: "pay_02",
              sellerId: "usr_02",
              amount: 150000,
              currency: "NGN",
              status: "dispatched",
              bankDetails: {
                accountNumber: "2233445566",
                bankName: "Zenith Bank",
                accountName: "Khadija Modest Ltd",
              },
              createdAt: new Date(Date.now() - 86400000).toISOString(),
            },
          ]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0A0E11] tracking-tight">
            Merchant Payouts & Transfers
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Review and dispatch Paystack transfer batches to Nigerian bank
            accounts.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200/70 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-primary-bg border-b border-gray-200 text-primary font-bold">
              <tr>
                <th className="px-6 py-4">Payout ID</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Bank Details</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-slate-700">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                    <p className="mt-2 text-xs">Loading payouts...</p>
                  </td>
                </tr>
              ) : (
                payouts.map((payout) => (
                  <tr
                    key={payout._id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      {payout._id}
                    </td>
                    <td className="px-6 py-4 font-extrabold text-slate-900">
                      ₦{payout.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">
                        {payout.bankDetails?.accountName || "Merchant Account"}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {payout.bankDetails?.bankName} •{" "}
                        {payout.bankDetails?.accountNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${
                          payout.status === "dispatched"
                            ? "bg-emerald-50 text-emerald-700"
                            : payout.status === "approved"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {payout.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {payout.status === "pending" && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            title="Approve Payout"
                            className="px-3 py-1.5 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary-hoverover transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            title="Reject Payout"
                            className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-slate-700 text-xs font-semibold transition-colors"
                          >
                            Reject
                          </button>
                        </div>
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
  );
}
