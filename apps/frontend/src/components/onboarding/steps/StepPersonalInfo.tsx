"use client";

import React from "react";
import { FiCheck, FiCreditCard, FiAward, FiBookOpen } from "react-icons/fi";
import { VerificationType } from "@/services/kyc.service";

interface StepPersonalInfoProps {
  firstName: string;
  setFirstName: (val: string) => void;
  lastName: string;
  setLastName: (val: string) => void;
  otherName: string;
  setOtherName: (val: string) => void;
  verificationType: VerificationType | "";
  setVerificationType: (type: VerificationType) => void;
  onNext: () => void;
  onBack: () => void;
}

const VERIFICATION_METHODS: Array<{
  id: VerificationType;
  title: string;
  description: string;
  icon: React.ElementType;
}> = [
  {
    id: "NIN",
    title: "National Identity Number (NIN)",
    description: "11-digit National Identity slip or digital NIMC ID card",
    icon: FiCreditCard,
  },
  {
    id: "Driver's License",
    title: "Driver's License",
    description: "Valid government-issued national driver's license",
    icon: FiAward,
  },
  {
    id: "International Passport",
    title: "International Passport",
    description: "Valid standard international travel passport data page",
    icon: FiBookOpen,
  },
  {
    id: "Voter's Card",
    title: "Voter's Card",
    description: "Permanent voter's card (PVC) issued by electoral commission",
    icon: FiCreditCard,
  },
];

export default function StepPersonalInfo({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  otherName,
  setOtherName,
  verificationType,
  setVerificationType,
  onNext,
  onBack,
}: StepPersonalInfoProps) {
  const isValid =
    firstName.trim().length >= 2 &&
    lastName.trim().length >= 2 &&
    verificationType.length > 0;

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      {/* Title Section */}
      <div className="space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
          Step 2 of 7
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold font-archivo tracking-tight text-neutral-900">
          Personal information
        </h1>
        <p className="text-sm text-neutral-500 font-normal">
          Tell us about yourself and select how you would like to verify your identity.
        </p>
      </div>

      <div className="space-y-5 pt-2">
        {/* Name Fields Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* First Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-700 tracking-wide">
              First Name
            </label>
            <div className="flex items-center h-12.5 px-4 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
              <input
                type="text"
                placeholder="e.g. Samuel"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full h-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 outline-none"
                required
              />
            </div>
          </div>

          {/* Last Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-700 tracking-wide">
              Last Name / Surname
            </label>
            <div className="flex items-center h-12.5 px-4 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
              <input
                type="text"
                placeholder="e.g. Adebayo"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full h-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 outline-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Other / Middle Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-neutral-700 tracking-wide">
            Middle / Other Name{" "}
            <span className="font-normal text-primary">(Optional)</span>
          </label>
          <div className="flex items-center h-12.5 px-4 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
            <input
              type="text"
              placeholder="e.g. Chukwuma"
              value={otherName}
              onChange={(e) => setOtherName(e.target.value)}
              className="w-full h-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 outline-none"
            />
          </div>
        </div>

        {/* Verification Method Cards */}
        <div className="space-y-2.5 pt-2">
          <label className="block text-xs font-semibold text-neutral-700 tracking-wide">
            Choose Verification Document
          </label>
          <p className="text-xs text-neutral-500 font-light">
            Select the government ID document you will provide in the next step.
          </p>

          <div className="grid grid-cols-1 gap-3 pt-1">
            {VERIFICATION_METHODS.map((method) => {
              const isSelected = verificationType === method.id;
              const Icon = method.icon;

              return (
                <div
                  key={method.id}
                  onClick={() => setVerificationType(method.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? "border-primary bg-primary-light/15 ring-2 ring-primary/20 shadow-xs"
                      : "border-neutral-200 hover:border-neutral-300 bg-white hover:bg-neutral-50/60"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl hidden md:flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-primary text-white"
                          : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p
                        className={`text-sm tracking-tight ${
                          isSelected
                            ? "font-bold text-neutral-900"
                            : "font-medium text-neutral-800"
                        }`}
                      >
                        {method.title}
                      </p>
                      <p className="text-xs text-neutral-400 font-light">
                        {method.description}
                      </p>
                    </div>
                  </div>

                  {/* Indicator Radio / Check */}
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      isSelected
                        ? "border-primary bg-primary text-white shadow-xs"
                        : "border-neutral-300"
                    }`}
                  >
                    {isSelected && <FiCheck className="w-3 h-3 stroke-3" />}
                  </div>
                </div>
              );
            })}
          </div>
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
          Continue
        </button>
      </div>
    </div>
  );
}
