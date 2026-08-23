"use client";

import React, { useState } from "react";
import { ShoppingBag, Search, Filter, ShieldCheck, Clock } from "lucide-react";

export default function OrdersPage() {
  const [search, setSearch] = useState("");

  const orders = [
    {
      id: "HST-ORD-88219",
      store: "Apex Electronics Hub",
      buyer: "Emeka Okafor",
      amount: "₦145,000",
      escrowStatus: "Held in Escrow",
      deliveryStatus: "In Transit",
      date: "23 Aug 2026",
    },
    {
      id: "HST-ORD-88218",
      store: "Khadija Luxury Wear",
      buyer: "Fatima Bello",
      amount: "₦65,000",
      escrowStatus: "Released",
      deliveryStatus: "Delivered",
      date: "22 Aug 2026",
    },
    {
      id: "HST-ORD-88217",
      store: "Lagos Sneakers Vault",
      buyer: "Tunde Williams",
      amount: "₦89,000",
      escrowStatus: "Disputed",
      deliveryStatus: "Delayed",
      date: "21 Aug 2026",
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0A0E11] tracking-tight">
            Orders & Escrow Protection
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Track Paystack escrow balances, order fulfillment, and delivery
            confirmations.
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200/70 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order reference or buyer..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200/70 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-primary-bg border-b border-gray-200 text-primary font-bold">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Store</th>
                <th className="px-6 py-4">Buyer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Escrow Status</th>
                <th className="px-6 py-4">Delivery Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-slate-700">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {order.store}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{order.buyer}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">
                    {order.amount}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold ${
                        order.escrowStatus === "Released"
                          ? "bg-emerald-50 text-emerald-700"
                          : order.escrowStatus === "Disputed"
                            ? "bg-red-50 text-red-700"
                            : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      <ShieldCheck className="w-3 h-3" />
                      {order.escrowStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700">
                      {order.deliveryStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {order.date}
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
