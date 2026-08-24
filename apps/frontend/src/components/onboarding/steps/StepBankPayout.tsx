"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FiChevronDown,
  FiSearch,
  FiX,
  FiCheck,
  FiDollarSign,
  FiInfo,
} from "react-icons/fi";
import { ClipLoader } from "react-spinners";
import { Bank, kycService, IBankDetails } from "@/services/kyc.service";

interface StepBankPayoutProps {
  bankDetails: IBankDetails;
  setBankDetails: (details: IBankDetails) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepBankPayout({
  bankDetails,
  setBankDetails,
  onNext,
  onBack,
}: StepBankPayoutProps) {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoadingBanks(true);
      try {
        const list = await kycService.getBanks();
        if (isMounted) setBanks(list);
      } catch {
        // Handled in service fallback
      } finally {
        if (isMounted) setLoadingBanks(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredBanks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return banks;
    return banks.filter((b) => b.name.toLowerCase().includes(q));
  }, [banks, search]);

  const isValid =
    bankDetails.bankName.trim().length > 0 &&
    bankDetails.bankCode.trim().length > 0 &&
    bankDetails.accountNumber.trim().length >= 10 &&
    bankDetails.accountName.trim().length >= 2;

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      {/* Title Section */}
      <div className="space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
          Step 6 of 7
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold font-archivo tracking-tight text-neutral-900">
          Payout bank account
        </h1>
        <p className="text-sm text-neutral-500 font-normal">
          Enter your settlement bank account details where sales payouts and escrow releases will be disbursed.
        </p>
      </div>

      <div className="space-y-5 pt-2">
        {/* Bank Selection Trigger */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-neutral-700 tracking-wide">
            Bank Name
          </label>
          <button
            type="button"
            onClick={() => setIsBankModalOpen(true)}
            className="w-full flex items-center justify-between h-12.5 px-4 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-left cursor-pointer"
          >
            <span
              className={`text-sm ${
                bankDetails.bankName
                  ? "font-medium text-neutral-900"
                  : "text-neutral-400"
              }`}
            >
              {bankDetails.bankName || "Select your bank"}
            </span>
            <FiChevronDown className="w-4 h-4 text-neutral-400" />
          </button>
        </div>

        {/* Account Number */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-neutral-700 tracking-wide">
            Account Number (10 digits)
          </label>
          <div className="flex items-center h-12.5 px-4 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
            <input
              type="text"
              maxLength={10}
              placeholder="e.g. 0123456789"
              value={bankDetails.accountNumber}
              onChange={(e) =>
                setBankDetails({
                  ...bankDetails,
                  accountNumber: e.target.value.replace(/\D/g, ""),
                })
              }
              className="w-full h-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 outline-none font-mono tracking-wider"
              required
            />
          </div>
        </div>

        {/* Account Holder Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-neutral-700 tracking-wide">
            Account Holder Name
          </label>
          <div className="flex items-center h-12.5 px-4 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
            <input
              type="text"
              placeholder="e.g. Samuel Adebayo"
              value={bankDetails.accountName}
              onChange={(e) =>
                setBankDetails({
                  ...bankDetails,
                  accountName: e.target.value,
                })
              }
              className="w-full h-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 outline-none"
              required
            />
          </div>
          <p className="text-[11px] text-neutral-400">
            Account holder name should match the name on your identity document.
          </p>
        </div>

        {/* Payout Information Notice */}
        <div className="p-3.5 rounded-xl bg-primary-light/20 border border-primary/20 flex items-start gap-3 text-xs text-neutral-600 leading-relaxed">
          <FiDollarSign className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <span>
            Payouts are processed automatically in local currency via Paystack escrow settlement protocols directly to this bank account.
          </span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="w-1/3 h-13 rounded-full border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-semibold text-sm transition-all cursor-pointer"
        >
          Back
        </button>

        <button
          type="button"
          disabled={!isValid}
          onClick={onNext}
          className={`flex-1 h-13 rounded-full font-bold text-sm sm:text-base flex items-center justify-center transition-all shadow-md ${
            isValid
              ? "bg-primary hover:bg-primary-hover text-white cursor-pointer active:scale-[0.99]"
              : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
          }`}
        >
          Continue to Final Step
        </button>
      </div>

      {/* Bank Selection Modal */}
      {isBankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-[fade-in_0.2s_ease-out]">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-neutral-200 flex flex-col max-h-[80vh] animate-[scale-up_0.2s_ease-out]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h3 className="text-base font-bold font-archivo text-neutral-900">
                Select Settlement Bank
              </h3>
              <button
                type="button"
                onClick={() => setIsBankModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-neutral-100">
              <div className="flex items-center h-11 px-3.5 rounded-xl border border-neutral-200 bg-neutral-50/60 focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                <FiSearch className="w-4 h-4 text-neutral-400 shrink-0 mr-2.5" />
                <input
                  type="text"
                  placeholder="Search bank name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400 outline-none"
                  autoFocus
                />
              </div>
            </div>

            {/* Banks List */}
            <div className="overflow-y-auto p-2 divide-y divide-neutral-50">
              {loadingBanks ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2">
                  <ClipLoader color="var(--color-primary, #800A1D)" size={24} />
                  <span className="text-xs text-neutral-400">
                    Loading bank directory...
                  </span>
                </div>
              ) : filteredBanks.length > 0 ? (
                filteredBanks.map((b) => {
                  const isSelected = bankDetails.bankCode === b.code;
                  return (
                    <button
                      key={b.code + b.name}
                      type="button"
                      onClick={() => {
                        setBankDetails({
                          ...bankDetails,
                          bankName: b.name,
                          bankCode: b.code,
                        });
                        setIsBankModalOpen(false);
                        setSearch("");
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-left ${
                        isSelected
                          ? "bg-primary-light/30 text-primary font-semibold"
                          : "hover:bg-neutral-50 text-neutral-700 font-normal"
                      }`}
                    >
                      <span className="text-sm">{b.name}</span>
                      {isSelected && (
                        <FiCheck className="w-4 h-4 text-primary shrink-0" />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-neutral-400">
                  No bank found matching &quot;{search}&quot;
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
