"use client";

import React from "react";
import { Star, EyeOff, Trash2, Flag } from "lucide-react";

export default function ReviewsPage() {
  const reviews = [
    {
      id: "rev_01",
      product: "Pro Wireless Noise Cancelling Headphones",
      reviewer: "David Adeleke",
      rating: 5,
      comment:
        "Super fast delivery and the escrow protection gives so much confidence!",
      date: "22 Aug 2026",
      status: "Published",
    },
    {
      id: "rev_02",
      product: "Silk Modest Kaftan Dress",
      reviewer: "Zainab Ahmed",
      rating: 4,
      comment: "Great quality stitching, exactly as pictured.",
      date: "20 Aug 2026",
      status: "Published",
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0A0E11] tracking-tight">
            Customer Reviews & Ratings
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Moderate buyer product reviews, flag suspicious content, and ensure
            feedback integrity.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200/70 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-primary-bgg border-b border-gray-200 text-primary font-bold">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Buyer</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Review Text</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-slate-700">
              {reviews.map((rev) => (
                <tr
                  key={rev.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4 font-bold text-slate-900">
                    {rev.product}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{rev.reviewer}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span>{rev.rating}.0</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-600 max-w-xs truncate">
                    {rev.comment}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        title="Hide Review"
                        className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-slate-700"
                      >
                        <EyeOff className="w-4 h-4" />
                      </button>
                    </div>
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
