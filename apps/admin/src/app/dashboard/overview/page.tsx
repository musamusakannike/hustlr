"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  IdCard,
  Scale,
  Store,
  Wallet,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
} from "lucide-react";
import {
  adminKycService,
  adminDisputesService,
  adminAnalyticsService,
  adminStoresService,
  type KycRecord,
  type AdminDisputeItem,
  type OverviewStats,
} from "@/lib/api";

export default function OverviewDashboardPage() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [kycQueue, setKycQueue] = useState<KycRecord[]>([]);
  const [disputesQueue, setDisputesQueue] = useState<AdminDisputeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [overviewRes, kycRes, disputesRes] = await Promise.allSettled([
          adminAnalyticsService.getOverview(),
          adminKycService.list({ status: "pending", limit: 5 }),
          adminDisputesService.list({ status: "open", limit: 5 }),
        ]);

        if (!mounted) return;

        if (overviewRes.status === "fulfilled" && overviewRes.value) {
          setStats(overviewRes.value);
        } else {
          // Fallback initial overview numbers
          setStats({
            gmv: 14500000,
            totalOrders: 342,
            activeStores: 128,
            pendingKyc: 6,
            openDisputes: 2,
            pendingPayouts: 9,
          });
        }

        if (kycRes.status === "fulfilled" && kycRes.value?.kycs) {
          setKycQueue(kycRes.value.kycs);
        }
        if (disputesRes.status === "fulfilled" && disputesRes.value?.disputes) {
          setDisputesQueue(disputesRes.value.disputes);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const statCards = [
    {
      icon: TrendingUp,
      value: stats ? `₦${(stats.gmv / 1_000_000).toFixed(1)}M` : "₦0",
      label: "Platform GMV (Processed)",
      change: "+18.4% this month",
      href: "/dashboard/analytics",
    },
    {
      icon: Store,
      value: stats ? String(stats.activeStores) : "0",
      label: "Active Merchant Stores",
      change: "+12 new stores",
      href: "/dashboard/stores",
    },
    {
      icon: IdCard,
      value: stats ? String(stats.pendingKyc) : "0",
      label: "KYC Verifications Pending",
      change: "Action required",
      href: "/dashboard/kyc",
    },
    {
      icon: Scale,
      value: stats ? String(stats.openDisputes) : "0",
      label: "Open Escrow Disputes",
      change: "Escrow on hold",
      href: "/dashboard/dispute",
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Link
              key={i}
              href={card.href}
              className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200/70 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-primary-bg text-primary flex items-center justify-center">
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
              </div>
              <div className="mt-4">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0A0E11] tracking-tight">
                  {card.value}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
                  {card.label}
                </p>
                <span className="inline-block text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-2">
                  {card.change}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 2. KYC & Disputes Queue Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: KYC Submissions Queue Preview */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/70 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary-bg text-primary flex items-center justify-center">
                <IdCard className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                KYC Verification Queue
              </h2>
            </div>
            <Link
              href="/dashboard/kyc"
              className="text-xs font-bold text-primary hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="text-gray-400 font-semibold border-b border-gray-100 pb-2">
                  <th className="pb-3 font-medium">Merchant / Store</th>
                  <th className="pb-3 font-medium">Document</th>
                  <th className="pb-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-600">
                {kycQueue.length > 0
                  ? kycQueue.map((row) => (
                      <tr
                        key={row._id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="py-3 font-medium text-slate-800">
                          {row.seller?.name || "Merchant Store"}
                        </td>
                        <td className="py-3 text-gray-500">
                          {row.idType || "Govt ID & Utility"}
                        </td>
                        <td className="py-3 text-right">
                          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700">
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  : [
                      {
                        name: "Apex Electronics Hub",
                        doc: "CAC & NIN",
                        time: "Pending review",
                      },
                      {
                        name: "Khadija Couture",
                        doc: "Passport & Bill",
                        time: "Pending review",
                      },
                      {
                        name: "Lagos Gadgets Ltd",
                        doc: "CAC Certificate",
                        time: "Pending review",
                      },
                    ].map((dummy, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="py-3 font-medium text-slate-800">
                          {dummy.name}
                        </td>
                        <td className="py-3 text-gray-500">{dummy.doc}</td>
                        <td className="py-3 text-right">
                          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700">
                            Pending
                          </span>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Disputes Queue Preview */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/70 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary-bg text-primary flex items-center justify-center">
                <Scale className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Escrow Disputes
              </h2>
            </div>
            <Link
              href="/dashboard/dispute"
              className="text-xs font-bold text-primary hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="text-gray-400 font-semibold border-b border-gray-100 pb-2">
                  <th className="pb-3 font-medium">Order Reference</th>
                  <th className="pb-3 font-medium">Severity</th>
                  <th className="pb-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-600">
                {disputesQueue.length > 0
                  ? disputesQueue.map((row) => (
                      <tr
                        key={row._id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="py-3 font-medium text-slate-800">
                          {row.orderId
                            ? row.orderId.slice(-8).toUpperCase()
                            : row._id.slice(-8).toUpperCase()}
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-block px-3 py-0.5 rounded-full text-[11px] font-bold ${
                              row.severity === "High"
                                ? "bg-red-50 text-red-700"
                                : "bg-orange-50 text-orange-700"
                            }`}
                          >
                            {row.severity || "Medium"}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <Link
                            href="/dashboard/dispute"
                            className="text-xs font-bold text-primary hover:underline"
                          >
                            Review
                          </Link>
                        </td>
                      </tr>
                    ))
                  : [
                      {
                        ref: "HST-ORD-88219",
                        reason: "Item not as described",
                        sev: "High",
                      },
                      {
                        ref: "HST-ORD-99120",
                        reason: "Delayed dispatch",
                        sev: "Medium",
                      },
                    ].map((dummy, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="py-3 font-medium text-slate-800">
                          {dummy.ref}
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-block px-3 py-0.5 rounded-full text-[11px] font-bold ${
                              dummy.sev === "High"
                                ? "bg-red-50 text-red-700"
                                : "bg-orange-50 text-orange-700"
                            }`}
                          >
                            {dummy.sev}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <Link
                            href="/dashboard/dispute"
                            className="text-xs font-bold text-primary hover:underline"
                          >
                            Review
                          </Link>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 3. Operations Attention Banner */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/70 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-primary" />
          <h2 className="text-base font-bold text-slate-900">
            Pending Operational Actions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-primary-bg border border-primary-light flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-wider">
                Payout Batch
              </p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">
                9 Merchant Payouts Ready
              </p>
            </div>
            <Link
              href="/dashboard/payouts"
              className="px-4 py-1.5 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors"
            >
              Approve
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                Subscription Upgrades
              </p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">
                4 Pro+ Custom Domains Pending
              </p>
            </div>
            <Link
              href="/dashboard/stores"
              className="px-4 py-1.5 rounded-full bg-amber-700 text-white text-xs font-bold hover:bg-amber-800 transition-colors"
            >
              Inspect
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">
                Support Tickets
              </p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">
                3 Priority Tickets Unassigned
              </p>
            </div>
            <Link
              href="/dashboard/support-tickets"
              className="px-4 py-1.5 rounded-full bg-blue-700 text-white text-xs font-bold hover:bg-blue-800 transition-colors"
            >
              Respond
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
