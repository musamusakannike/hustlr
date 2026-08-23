"use client";

import React, { useState, useMemo } from "react";
import { FiSearch, FiX, FiCheck } from "react-icons/fi";

export interface CountryItem {
  name: string;
  code: string;
  flagEmoji: string;
  dialCode: string;
}

export const SUPPORTED_COUNTRIES: CountryItem[] = [
  { name: "Nigeria", code: "NG", flagEmoji: "🇳🇬", dialCode: "+234" },
  { name: "Ghana", code: "GH", flagEmoji: "🇬🇭", dialCode: "+233" },
  { name: "Kenya", code: "KE", flagEmoji: "🇰🇪", dialCode: "+254" },
  { name: "South Africa", code: "ZA", flagEmoji: "🇿🇦", dialCode: "+27" },
  { name: "Rwanda", code: "RW", flagEmoji: "🇷🇼", dialCode: "+250" },
  { name: "Uganda", code: "UG", flagEmoji: "🇺🇬", dialCode: "+256" },
  { name: "Egypt", code: "EG", flagEmoji: "🇪🇬", dialCode: "+20" },
  { name: "Cameroon", code: "CM", flagEmoji: "🇨🇲", dialCode: "+237" },
  { name: "Côte d'Ivoire", code: "CI", flagEmoji: "🇨🇮", dialCode: "+225" },
  { name: "Tanzania", code: "TZ", flagEmoji: "🇹🇿", dialCode: "+255" },
  { name: "Senegal", code: "SN", flagEmoji: "🇸🇳", dialCode: "+221" },
  { name: "United Kingdom", code: "GB", flagEmoji: "🇬🇧", dialCode: "+44" },
  { name: "United States", code: "US", flagEmoji: "🇺🇸", dialCode: "+1" },
  { name: "Canada", code: "CA", flagEmoji: "🇨🇦", dialCode: "+1" },
];

interface CountryPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (country: CountryItem) => void;
  selectedCountryCode?: string;
}

export default function CountryPickerModal({
  isOpen,
  onClose,
  onSelect,
  selectedCountryCode = "NG",
}: CountryPickerModalProps) {
  const [search, setSearch] = useState("");

  const filteredCountries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return SUPPORTED_COUNTRIES;
    return SUPPORTED_COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.dialCode.includes(q)
    );
  }, [search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-[fade-in_0.2s_ease-out]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-neutral-200 flex flex-col max-h-[85vh] animate-[scale-up_0.2s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h3 className="text-base font-bold font-archivo text-neutral-900">
            Select Country
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-neutral-100">
          <div className="flex items-center h-11 px-3.5 rounded-xl border border-neutral-200 bg-neutral-50/60 focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10 transition-all">
            <FiSearch className="w-4 h-4 text-neutral-400 shrink-0 mr-2.5" />
            <input
              type="text"
              placeholder="Search country name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400 outline-none"
              autoFocus
            />
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto p-2 divide-y divide-neutral-50">
          {filteredCountries.map((c) => {
            const isSelected = c.code === selectedCountryCode;
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  onSelect(c);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-left ${
                  isSelected
                    ? "bg-primary-light/30 text-primary font-semibold"
                    : "hover:bg-neutral-50 text-neutral-700 font-normal"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{c.flagEmoji}</span>
                  <span className="text-sm">{c.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400 font-mono">
                    {c.dialCode}
                  </span>
                  {isSelected && (
                    <FiCheck className="w-4 h-4 text-primary shrink-0" />
                  )}
                </div>
              </button>
            );
          })}

          {filteredCountries.length === 0 && (
            <div className="py-8 text-center text-xs text-neutral-400">
              No country found matching &quot;{search}&quot;
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
