"use client";

import React, { useState } from "react";
import { FolderTree, Plus, Edit, Trash2 } from "lucide-react";

export default function CategoriesPage() {
  const categories = [
    {
      id: "cat_01",
      name: "Fashion & Apparel",
      slug: "fashion-apparel",
      productCount: 412,
    },
    {
      id: "cat_02",
      name: "Electronics & Gadgets",
      slug: "electronics-gadgets",
      productCount: 298,
    },
    {
      id: "cat_03",
      name: "Beauty & Personal Care",
      slug: "beauty-personal-care",
      productCount: 184,
    },
    {
      id: "cat_04",
      name: "Footwear & Sneakers",
      slug: "footwear-sneakers",
      productCount: 140,
    },
    {
      id: "cat_05",
      name: "Home & Lifestyle",
      slug: "home-lifestyle",
      productCount: 92,
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0A0E11] tracking-tight">
            Global Categories
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Standard platform catalog classifications and merchant store
            categories.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200/70 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-primary-bg border-b border-gray-200 text-primary font-bold">
              <tr>
                <th className="px-6 py-4">Category Name</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">Products Listed</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-slate-700">
              {categories.map((cat) => (
                <tr
                  key={cat.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4 font-bold text-slate-900">
                    {cat.name}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">
                    {cat.slug}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700">
                    {cat.productCount}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-slate-700 transition-colors">
                        <Edit className="w-4 h-4" />
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
