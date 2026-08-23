"use client";

import React from "react";
import {
  TrendingUp,
  BarChart2,
  DollarSign,
  Store,
  ShoppingBag,
} from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0A0E11] tracking-tight">
            Analytics & Platform Performance
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Real-time Gross Merchandise Value (GMV), store growth metrics, and
            payment conversion rates.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-gray-200/70 shadow-xs">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            30-Day GMV
          </p>
          <h3 className="text-3xl font-extrabold text-[#0A0E11] mt-2">
            ₦42.8M
          </h3>
          <p className="text-xs font-semibold text-emerald-700 mt-1">
            +24.2% vs last month
          </p>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-gray-200/70 shadow-xs">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Total Commission Earned
          </p>
          <h3 className="text-3xl font-extrabold text-primary mt-2">₦3.1M</h3>
          <p className="text-xs font-semibold text-emerald-700 mt-1">
            7.2% effective take rate
          </p>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-gray-200/70 shadow-xs">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Escrow Release Speed
          </p>
          <h3 className="text-3xl font-extrabold text-[#0A0E11] mt-2">
            2.4 Days
          </h3>
          <p className="text-xs font-semibold text-emerald-700 mt-1">
            Average fulfillment to payout
          </p>
        </div>
      </div>

      {/* Chart Mockup Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/70 shadow-xs">
        <div className="flex items-center justify-between pb-6 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              GMV Trajectory (NGN)
            </h3>
            <p className="text-xs text-gray-400">
              Daily sales volume across all storefront subdomains
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-primary-bg text-primary text-xs font-bold">
            Live Paystack Feed
          </span>
        </div>

        <div className="h-64 flex items-end justify-between gap-2 pt-8">
          {[40, 65, 55, 80, 70, 95, 85, 110, 90, 125, 140, 160].map((h, i) => (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-2 group"
            >
              <div
                style={{ height: `${(h / 160) * 100}%` }}
                className="w-full bg-primary/80 group-hover:bg-primary rounded-t-xl transition-all"
              />
              <span className="text-[10px] text-gray-400 font-semibold">
                Wk {i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
