"use client";

import React, { useState } from "react";
import { FiChevronDown, FiGlobe, FiTag } from "react-icons/fi";
import CountryPickerModal, {
  CountryItem,
  SUPPORTED_COUNTRIES,
} from "../CountryPickerModal";

export const STORE_CATEGORIES = [
  "Food & Spices",
  "Fashion & Apparel",
  "Beauty & Cosmetics",
  "Arts & Crafts",
  "Home & Living",
  "Gifts & Souvenirs",
  "Entertainment & Books",
  "Lifestyle & Wellness",
  "Accessories & Jewelry",
  "Kitchen & Dining",
  "Outdoor & Travel",
  "Electronics & Gadgets",
  "Kids & Baby",
  "Pharmacy & Health",
];

interface StepStoreDetailsProps {
  storeName: string;
  setStoreName: (name: string) => void;
  country: CountryItem | null;
  setCountry: (country: CountryItem) => void;
  categories: string[];
  setCategories: (cats: string[]) => void;
  onNext: () => void;
  onSkip?: () => void;
}

export default function StepStoreDetails({
  storeName,
  setStoreName,
  country,
  setCountry,
  categories,
  setCategories,
  onNext,
  onSkip,
}: StepStoreDetailsProps) {
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);

  const toggleCategory = (cat: string) => {
    if (categories.includes(cat)) {
      setCategories(categories.filter((c) => c !== cat));
    } else {
      setCategories([...categories, cat]);
    }
  };

  const isValid =
    storeName.trim().length >= 2 && country !== null && categories.length > 0;

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      {/* Title Section */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Step 1 of 7
          </span>
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="text-xs font-medium text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              Skip store details
            </button>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-archivo tracking-tight text-neutral-900">
          Create your seller profile
        </h1>
        <p className="text-sm text-neutral-500 font-normal">
          Let&apos;s personalize your store and storefront details for your customers.
        </p>
      </div>

      <div className="space-y-5 pt-2">
        {/* Store Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-neutral-700 tracking-wide">
            Store Name
          </label>
          <div className="flex items-center h-12.5 px-4 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
            <input
              type="text"
              placeholder="e.g. AfroGlow Beauty & Botanicals"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full h-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 outline-none"
              required
            />
          </div>
          <p className="text-[11px] text-neutral-400">
            This will be displayed on your invoices and customer storefront.
          </p>
        </div>

        {/* Country Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-neutral-700 tracking-wide">
            Country of Operation
          </label>
          <button
            type="button"
            onClick={() => setIsCountryModalOpen(true)}
            className="w-full flex items-center justify-between h-12.5 px-4 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-left cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <FiGlobe className="w-4 h-4 text-neutral-400 shrink-0" />
              {country ? (
                <span className="text-sm text-neutral-900 flex items-center gap-2">
                  <span className="text-base">{country.flagEmoji}</span>
                  <span className="font-medium">{country.name}</span>
                </span>
              ) : (
                <span className="text-sm text-neutral-400">Select country</span>
              )}
            </div>
            <FiChevronDown className="w-4 h-4 text-neutral-400" />
          </button>
        </div>

        {/* Categories Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-neutral-700 tracking-wide flex items-center gap-1.5">
              <FiTag className="w-3.5 h-3.5 text-neutral-400" />
              <span>Product Categories</span>
            </label>
            <span className="text-[11px] text-neutral-400">
              {categories.length} selected
            </span>
          </div>

          <p className="text-xs text-neutral-500 font-light">
            Select one or more categories that best describe the products you sell.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {STORE_CATEGORIES.map((cat) => {
              const isSelected = categories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`px-3.5 py-2 rounded-full text-xs transition-all cursor-pointer select-none ${
                    isSelected
                      ? "bg-primary text-white font-medium shadow-xs scale-[1.02]"
                      : "bg-neutral-100/80 hover:bg-neutral-200/80 text-neutral-700 font-normal"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="pt-4">
        <button
          type="button"
          disabled={!isValid}
          onClick={onNext}
          className={`w-full h-13 rounded-full font-bold text-sm sm:text-base flex items-center justify-center transition-all shadow-md ${
            isValid
              ? "bg-primary hover:bg-primary-hover text-white cursor-pointer active:scale-[0.99]"
              : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
          }`}
        >
          Continue to Identity Verification
        </button>
      </div>

      {/* Country Modal */}
      <CountryPickerModal
        isOpen={isCountryModalOpen}
        onClose={() => setIsCountryModalOpen(false)}
        onSelect={(c) => setCountry(c)}
        selectedCountryCode={country?.code || SUPPORTED_COUNTRIES[0].code}
      />
    </div>
  );
}
