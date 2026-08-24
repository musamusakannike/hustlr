"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  TrendingUp,
  Percent,
  ShoppingBag,
  Store,
  IdCard,
  Scale,
  Calendar,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  RefreshCw,
  Wallet,
  Globe,
  AlertCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  adminAnalyticsService,
  type AnalyticsOverview,
  type GmvTrendPoint,
  type StatusCount,
  type DisputeAnalytics,
  type RegionalBreakdown,
  type TopPerformers,
  type PayoutSummary,
} from "@/lib/api";

type PresetKey = "7d" | "30d" | "90d" | "1y" | "custom";

const PRESET_DAYS: Record<Exclude<PresetKey, "custom">, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "1y": 365,
};

const PIE_COLORS = ["#800A1D", "#B82132", "#F06292", "#3B82F6", "#10B981", "#F59E0B"];

function formatNgn(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}M`;
  if (Math.abs(amount) >= 1_000) return `₦${(amount / 1_000).toFixed(1)}K`;
  return `₦${amount.toLocaleString("en-NG")}`;
}

export default function AnalyticsDashboardPage() {
  const [preset, setPreset] = useState<PresetKey>("30d");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filterOptions, setFilterOptions] = useState<{ countries: string[]; categories: string[] }>({
    countries: [],
    categories: [],
  });

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [trend, setTrend] = useState<GmvTrendPoint[]>([]);
  const [orderStatus, setOrderStatus] = useState<StatusCount[]>([]);
  const [kycFunnel, setKycFunnel] = useState<StatusCount[]>([]);
  const [disputes, setDisputes] = useState<DisputeAnalytics | null>(null);
  const [regional, setRegional] = useState<RegionalBreakdown[]>([]);
  const [topPerformers, setTopPerformers] = useState<TopPerformers | null>(null);
  const [payouts, setPayouts] = useState<PayoutSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Compute active date range
  const dateRange = useMemo(() => {
    if (preset === "custom") {
      return { from: dateFrom || undefined, to: dateTo || undefined };
    }
    const days = PRESET_DAYS[preset] || 30;
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    return {
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
    };
  }, [preset, dateFrom, dateTo]);

  useEffect(() => {
    adminAnalyticsService.getFilterOptions().then(setFilterOptions).catch(() => {});
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    const params = {
      from: dateRange.from,
      to: dateRange.to,
      country: selectedCountry !== "All" ? selectedCountry : undefined,
      category: selectedCategory !== "All" ? selectedCategory : undefined,
    };

    try {
      const [
        overviewRes,
        trendRes,
        orderStatusRes,
        kycFunnelRes,
        disputesRes,
        regionalRes,
        topPerformersRes,
        payoutsRes,
      ] = await Promise.allSettled([
        adminAnalyticsService.getOverview(params),
        adminAnalyticsService.getGmvTrend(params),
        adminAnalyticsService.getOrderStatusBreakdown(params),
        adminAnalyticsService.getKycFunnel(params),
        adminAnalyticsService.getDisputeAnalytics(params),
        adminAnalyticsService.getRegionalBreakdown(params),
        adminAnalyticsService.getTopPerformers(params),
        adminAnalyticsService.getPayoutSummary(params),
      ]);

      let fulfilledCount = 0;

      if (overviewRes.status === "fulfilled" && overviewRes.value) {
        setOverview(overviewRes.value);
        fulfilledCount++;
      } else {
        setOverview(null);
      }

      if (trendRes.status === "fulfilled" && trendRes.value) {
        setTrend(trendRes.value);
        fulfilledCount++;
      } else {
        setTrend([]);
      }

      if (orderStatusRes.status === "fulfilled" && orderStatusRes.value) {
        setOrderStatus(orderStatusRes.value);
        fulfilledCount++;
      } else {
        setOrderStatus([]);
      }

      if (kycFunnelRes.status === "fulfilled" && kycFunnelRes.value) {
        setKycFunnel(kycFunnelRes.value);
        fulfilledCount++;
      } else {
        setKycFunnel([]);
      }

      if (disputesRes.status === "fulfilled" && disputesRes.value) {
        setDisputes(disputesRes.value);
        fulfilledCount++;
      } else {
        setDisputes(null);
      }

      if (regionalRes.status === "fulfilled" && regionalRes.value) {
        setRegional(regionalRes.value);
        fulfilledCount++;
      } else {
        setRegional([]);
      }

      if (topPerformersRes.status === "fulfilled" && topPerformersRes.value) {
        setTopPerformers(topPerformersRes.value);
        fulfilledCount++;
      } else {
        setTopPerformers(null);
      }

      if (payoutsRes.status === "fulfilled" && payoutsRes.value) {
        setPayouts(payoutsRes.value);
        fulfilledCount++;
      } else {
        setPayouts(null);
      }

      if (fulfilledCount === 0) {
        setError("Failed to load analytics data. Please check your network connection.");
      }
    } catch {
      setError("Failed to load analytics data. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [dateRange, selectedCountry, selectedCategory]);

  const kpis = [
    {
      label: "Platform GMV",
      value: overview ? formatNgn(overview.gmv) : "—",
      change: overview?.gmvChangePct ?? 0,
      icon: TrendingUp,
    },
    {
      label: "Commission Revenue",
      value: overview ? formatNgn(overview.commission || overview.gmv * 0.08) : "—",
      change: overview?.commissionChangePct ?? 0,
      icon: Percent,
    },
    {
      label: "Completed Orders",
      value: overview ? overview.totalOrders.toLocaleString() : "—",
      change: overview?.orderCountChangePct ?? 0,
      icon: ShoppingBag,
    },
    {
      label: "Active Merchant Stores",
      value: overview ? overview.activeStores.toLocaleString() : "—",
      change: 0,
      icon: Store,
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Header & Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0A0E11] tracking-tight flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-primary" />
            Performance & Revenue Analytics
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Real-time Gross Merchandise Value, commission breakdown, merchant retention, and settlement volume.
          </p>
        </div>

        {/* Date presets & Filters */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          {/* Preset Buttons */}
          <div className="bg-white p-1 rounded-full border border-gray-200 shadow-xs flex items-center gap-1">
            {(["7d", "30d", "90d", "1y"] as PresetKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setPreset(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  preset === key
                    ? "bg-primary text-white shadow-xs"
                    : "text-gray-500 hover:text-slate-900"
                }`}
              >
                {key.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={() => loadData()}
            disabled={loading}
            className="p-2 rounded-full bg-white border border-gray-200 hover:border-primary text-gray-500 hover:text-primary shadow-xs transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-primary" : ""}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {kpis.map((card, idx) => {
          const Icon = card.icon;
          const isPos = card.change >= 0;
          return (
            <div
              key={idx}
              className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200/70 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-primary-bg text-primary flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                {overview && card.change !== 0 && (
                  <div
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      isPos ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {isPos ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    <span>{Math.abs(card.change)}%</span>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0A0E11] tracking-tight">
                  {card.value}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
                  {card.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 1. Main GMV Trend Chart */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/70 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">Gross Merchandise Value & Commission</h2>
            <p className="text-xs text-gray-400 mt-0.5">Platform volume processed through Paystack gateway</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-3 h-3 rounded-full bg-primary inline-block" /> GMV
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Commission
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          {trend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#800A1D" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#800A1D" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(val) => `₦${(val / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => typeof value === "number" ? `₦${value.toLocaleString()}` : String(value)} />
                <Area type="monotone" dataKey="gmv" stroke="#800A1D" strokeWidth={2.5} fillOpacity={1} fill="url(#colorGmv)" name="GMV" />
                <Area type="monotone" dataKey="commission" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#colorComm)" name="Commission" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-gray-400">
              No GMV trend data available.
            </div>
          )}
        </div>
      </div>

      {/* 2. Side-by-Side Analytics: Order Status & KYC Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200/70 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Order Delivery Status Distribution</h3>
          <div className="h-60 w-full flex items-center justify-center">
            {orderStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {orderStatus.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => `${val} orders`} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-gray-400">
                No order distribution data available.
              </div>
            )}
          </div>
        </div>

        {/* KYC Verification Funnel */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200/70 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Merchant KYC Verification Funnel</h3>
          <div className="h-60 w-full">
            {kycFunnel.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kycFunnel}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="status" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#800A1D" radius={[8, 8, 0, 0]} name="Merchants" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                No KYC funnel data available.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Top Performers & Regional Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Merchants Table */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200/70 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Top Performing Merchant Stores</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="text-gray-400 font-semibold border-b border-gray-100 pb-2">
                  <th className="pb-3 font-medium">Store</th>
                  <th className="pb-3 font-medium text-right">Orders</th>
                  <th className="pb-3 font-medium text-right">GMV (NGN)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-700">
                {topPerformers?.topSellers && topPerformers.topSellers.length > 0 ? (
                  topPerformers.topSellers.map((s, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="py-3 font-bold text-slate-800">{s.name}</td>
                      <td className="py-3 text-right text-gray-500 font-semibold">{s.orders}</td>
                      <td className="py-3 text-right font-extrabold text-slate-900">{formatNgn(s.gmv)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-xs text-gray-400">
                      No merchant performance data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200/70 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Top Categories by Sales Volume</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="text-gray-400 font-semibold border-b border-gray-100 pb-2">
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium text-right">Units Sold</th>
                  <th className="pb-3 font-medium text-right">Sales (NGN)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-700">
                {topPerformers?.topCategories && topPerformers.topCategories.length > 0 ? (
                  topPerformers.topCategories.map((c, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="py-3 font-bold text-slate-800">{c.category}</td>
                      <td className="py-3 text-right text-gray-500 font-semibold">{c.units}</td>
                      <td className="py-3 text-right font-extrabold text-slate-900">{formatNgn(c.gmv)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-xs text-gray-400">
                      No category performance data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
