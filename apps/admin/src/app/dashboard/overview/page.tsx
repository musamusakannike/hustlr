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
  AlertCircle,
  Loader2,
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
  const [error, setError] = useState<string | null>(null);

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

        let hasError = false;

        if (overviewRes.status === "fulfilled" && overviewRes.value) {
          setStats(overviewRes.value);
        } else {
          hasError = true;
        }

        if (kycRes.status === "fulfilled" && kycRes.value?.kycs) {
          setKycQueue(kycRes.value.kycs);
        } else if (kycRes.status === "rejected") {
          hasError = true;
        }

        if (disputesRes.status === "fulfilled" && disputesRes.value?.disputes) {
          setDisputesQueue(disputesRes.value.disputes);
        } else if (disputesRes.status === "rejected") {
          hasError = true;
        }

        if (hasError && !stats) {
          setError("There was an error loading dashboard overview data. Please check your network connection.");
        }
      } catch (err: unknown) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load dashboard data.");
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
      value: stats ? `₦${(stats.gmv / 1_000_000).toFixed(1)}M` : "—",
      label: "Platform GMV (Processed)",
      change: stats ? "+18.4% this month" : "No data",
      href: "/dashboard/analytics",
    },
    {
      icon: Store,
      value: stats ? String(stats.activeStores) : "—",
      label: "Active Merchant Stores",
      change: stats ? "+12 new stores" : "No data",
      href: "/dashboard/stores",
    },
    {
      icon: IdCard,
      value: stats ? String(stats.pendingKyc) : "—",
      label: "KYC Verifications Pending",
      change: stats?.pendingKyc ? "Action required" : "Up to date",
      href: "/dashboard/kyc",
    },
    {
      icon: Scale,
      value: stats ? String(stats.openDisputes) : "—",
      label: "Open Escrow Disputes",
      change: stats?.openDisputes ? "Escrow on hold" : "None active",
      href: "/dashboard/dispute",
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

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
                {loading ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-xs text-gray-400">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-primary mb-1" />
                      Loading verification queue...
                    </td>
                  </tr>
                ) : kycQueue.length > 0 ? (
                  kycQueue.map((row) => (
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
                ) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-xs text-gray-400">
                      No pending KYC verifications.
                    </td>
                  </tr>
                )}
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
                {loading ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-xs text-gray-400">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-primary mb-1" />
                      Loading escrow disputes...
                    </td>
                  </tr>
                ) : disputesQueue.length > 0 ? (
                  disputesQueue.map((row) => (
                    <tr
                      key={row._id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-3 font-medium text-slate-800">
                        {typeof row.orderId === "object"
                          ? row.orderId?.orderNumber || "ORDER"
                          : typeof row.orderId === "string"
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
                ) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-xs text-gray-400">
                      No open escrow disputes.
                    </td>
                  </tr>
                )}
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
            Operational Quick Actions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-primary-bg border border-primary-light flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-wider">
                Payout Batch
              </p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">
                {stats?.pendingPayouts ? `${stats.pendingPayouts} Payouts Pending` : "Merchant Payouts Queue"}
              </p>
            </div>
            <Link
              href="/dashboard/payouts"
              className="px-4 py-1.5 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors"
            >
              Inspect
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                Merchant KYC
              </p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">
                {stats?.pendingKyc ? `${stats.pendingKyc} Verifications Pending` : "KYC Verification Queue"}
              </p>
            </div>
            <Link
              href="/dashboard/kyc"
              className="px-4 py-1.5 rounded-full bg-amber-700 text-white text-xs font-bold hover:bg-amber-800 transition-colors"
            >
              Verify
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">
                Support Tickets
              </p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">
                Merchant Support Desk
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
