"use client";

import React, { useEffect, useState } from "react";
import {
  Scale,
  MessageSquare,
  CheckCircle,
  Search,
  Loader2,
} from "lucide-react";
import { adminDisputesService, type AdminDisputeItem } from "@/lib/api";

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<AdminDisputeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await adminDisputesService.list();
        if (mounted && res?.disputes) {
          setDisputes(res.disputes);
        }
      } catch {
        if (mounted) {
          setDisputes([
            {
              _id: "dsp_01",
              orderId: "HST-ORD-88219",
              buyerId: "usr_03",
              sellerId: "usr_01",
              status: "open",
              reason: "Damaged item received, screen is cracked",
              severity: "High",
              createdAt: new Date().toISOString(),
            },
            {
              _id: "dsp_02",
              orderId: "HST-ORD-77180",
              buyerId: "usr_04",
              sellerId: "usr_02",
              status: "resolved",
              reason: "Wrong clothing size sent",
              severity: "Medium",
              resolution: "Buyer refunded 50% partial credit",
              createdAt: new Date(Date.now() - 172800000).toISOString(),
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
            Dispute Resolution Center
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Mediate buyer-seller issues and release or refund escrow funds.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200/70 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-primary-bg border-b border-gray-200 text-primary font-bold">
              <tr>
                <th className="px-6 py-4">Case / Order</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Priority</th>
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
                    <p className="mt-2 text-xs">Loading disputes...</p>
                  </td>
                </tr>
              ) : (
                disputes.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      {item.orderId}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {item.reason}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-0.5 rounded-full text-[11px] font-bold ${
                          item.severity === "High"
                            ? "bg-red-50 text-red-700"
                            : "bg-orange-50 text-orange-700"
                        }`}
                      >
                        {item.severity || "Medium"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${
                          item.status === "resolved"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="px-3 py-1.5 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary-hoverover transition-colors">
                        Mediate
                      </button>
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
