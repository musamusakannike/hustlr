"use client";

import React from "react";
import { Activity, Shield } from "lucide-react";

export default function ActivityLogsPage() {
  const logs = [
    {
      id: "LOG_01",
      admin: "admin@hustlr.online",
      action: "KYC Approved",
      target: "User: usr_02 (Amara Nwachukwu)",
      ip: "102.89.44.12",
      date: "23 Aug 2026, 12:44:10",
    },
    {
      id: "LOG_02",
      admin: "admin@hustlr.online",
      action: "Payout Dispatched",
      target: "Payout: pay_02 (₦150,000 to Zenith Bank)",
      ip: "102.89.44.12",
      date: "23 Aug 2026, 11:12:05",
    },
    {
      id: "LOG_03",
      admin: "System Automated Cron",
      action: "Escrow Auto-Released",
      target: "Order: HST-ORD-88218",
      ip: "internal-cluster",
      date: "22 Aug 2026, 18:00:00",
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0A0E11] tracking-tight">
            Security & Audit Activity Logs
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Immutable log of all admin overrides, payout authorizations, and
            account status changes.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200/70 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-primary-bg border-b border-gray-200 text-primary font-bold">
              <tr>
                <th className="px-6 py-4">Actor</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Target Entity</th>
                <th className="px-6 py-4">IP Address</th>
                <th className="px-6 py-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-slate-700">
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4 font-semibold text-slate-900 flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-primary" />
                    <span>{log.admin}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-xs font-mono">
                    {log.target}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-gray-400">
                    {log.ip}
                  </td>
                  <td className="px-6 py-4 text-right text-xs text-gray-500">
                    {log.date}
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
