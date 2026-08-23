"use client";

import React from "react";
import { Palette, Eye, Plus, Sparkles } from "lucide-react";

export default function TemplatesPage() {
  const templates = [
    {
      id: "free-template",
      name: "Modern Minimalist",
      tier: "Free Tier",
      description:
        "Clean, high-performance storefront layout designed for boutique fashion & craft brands.",
      storesUsing: 84,
      status: "Active",
    },
    {
      id: "pro-template",
      name: "Bold Electronics & Gadgets",
      tier: "Pro Plan",
      description:
        "Dark-themed immersive layout optimized for tech, gadgets, and multi-category catalogs.",
      storesUsing: 38,
      status: "Active",
    },
    {
      id: "proplus-template",
      name: "Aurelia Pro+ Luxury",
      tier: "Pro+ VIP Plan",
      description:
        "High-end storefront featuring video hero, gold accents, and express Paystack checkout.",
      storesUsing: 12,
      status: "Active",
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0A0E11] tracking-tight">
            Storefront Templates
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Manage merchant website templates, theme layouts, and tier
            availability.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-white rounded-3xl p-6 border border-gray-200/70 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary-bg text-primary">
                  {tpl.tier}
                </span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  {tpl.status}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-3">
                {tpl.name}
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                {tpl.description}
              </p>
              <p className="text-xs font-semibold text-gray-700 mt-4">
                Active stores:{" "}
                <span className="font-bold text-slate-900">
                  {tpl.storesUsing}
                </span>
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2">
              <button className="flex-1 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-slate-800 text-xs font-bold transition-all">
                Edit Layout
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
