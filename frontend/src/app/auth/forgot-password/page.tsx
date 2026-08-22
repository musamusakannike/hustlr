"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FiAlertCircle } from "react-icons/fi";
import { ClipLoader } from "react-spinners";
import AuthLayout from "@/components/auth/AuthLayout";
import { authService } from "@/services/auth.service";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isValid = email.trim().length > 0 && !loading;

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setErrorMessage("");

    try {
      await authService.forgotSellerPassword(email.trim());
      router.push(
        `/auth/forgot-password/verify?email=${encodeURIComponent(email.trim())}`,
      );
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Failed to send reset code. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      backUrl="/auth/login"
      bannerTitle="Rest easy, your merchant account is safe."
      bannerSubtitle="Quick and secure recovery so you can get back to managing your products and fulfilling buyer orders."
      bannerQuote="“Account recovery took less than a minute when I misplaced my credentials.”"
    >
      <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
        {/* Title Section */}
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold font-archivo tracking-tight text-[#0A0E11]">
            Forgot password?
          </h1>
          <p className="text-sm text-neutral-500 font-normal leading-relaxed">
            Enter the email address linked to your account to reset your
            password. A verification code will be sent to your Email.
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium flex items-start gap-2.5 animate-[shake_0.2s_ease-in-out]">
            <FiAlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleContinue} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-700 tracking-wide">
              Email
            </label>
            <div
              className={`flex items-center h-13 px-4 rounded-xl border bg-white transition-all ${
                isFocused || email.length > 0
                  ? "border-primary ring-2 ring-primary/10"
                  : "border-neutral-200 hover:border-neutral-300"
              }`}
            >
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="w-full h-full bg-transparent text-sm text-[#0A0E11] placeholder:text-neutral-400 outline-none"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Continue Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={!isValid}
              className={`w-full h-13.5 rounded-full font-bold text-sm sm:text-base flex items-center justify-center transition-all shadow-md ${
                isValid
                  ? "bg-primary hover:bg-[#660817] text-white cursor-pointer active:scale-[0.99]"
                  : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <ClipLoader color="#FFFFFF" size={20} />
              ) : (
                <span>Continue</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
