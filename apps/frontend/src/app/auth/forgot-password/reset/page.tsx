"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiEye, FiEyeOff, FiAlertCircle } from "react-icons/fi";
import { ClipLoader } from "react-spinners";
import AuthLayout from "@/components/auth/AuthLayout";
import { authService } from "@/services/auth.service";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";
  const code = searchParams.get("code") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmFocused, setIsConfirmFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isMatch = password.length > 0 && password === confirmPassword;
  const isValidLength = password.length >= 8;
  const isValid = isValidLength && isMatch && !loading;

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    if (!email || !code) {
      setErrorMessage(
        "Missing reset credentials. Please start the recovery process again.",
      );
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      await authService.resetSellerPassword(email, code, password);
      router.push("/auth/forgot-password/success");
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Failed to update password. Code may have expired.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      {/* Title Section */}
      <div className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-bold font-archivo tracking-tight text-[#0A0E11]">
          Enter a new password
        </h1>
        <p className="text-sm text-neutral-500 font-normal">
          Create a new password to secure your Hustlr account
        </p>
      </div>

      {/* Error Alert Box */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium flex items-start gap-2.5 animate-[shake_0.2s_ease-in-out]">
          <FiAlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Password Reset Form */}
      <form onSubmit={handleSavePassword} className="space-y-4">
        {/* Password Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-neutral-700 tracking-wide">
            New Password{" "}
            <span className="text-[11px] font-normal text-neutral-400">
              (min. 8 characters)
            </span>
          </label>
          <div
            className={`flex items-center h-13 px-4 rounded-xl border bg-white transition-all ${
              isPasswordFocused
                ? "border-primary ring-2 ring-primary/10"
                : "border-neutral-200 hover:border-neutral-300"
            }`}
          >
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              className="w-full h-full bg-transparent text-sm text-[#0A0E11] placeholder:text-neutral-400 outline-none pr-2"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-neutral-400 hover:text-neutral-600 p-1 cursor-pointer transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <FiEyeOff className="w-4 h-4" />
              ) : (
                <FiEye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-neutral-700 tracking-wide">
            Confirm new password
          </label>
          <div
            className={`flex items-center h-13 px-4 rounded-xl border bg-white transition-all ${
              isConfirmFocused
                ? "border-primary ring-2 ring-primary/10"
                : "border-neutral-200 hover:border-neutral-300"
            }`}
          >
            <input
              type={showConfirmPassword ? "text" : "password"}
              required
              minLength={8}
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onFocus={() => setIsConfirmFocused(true)}
              onBlur={() => setIsConfirmFocused(false)}
              className="w-full h-full bg-transparent text-sm text-[#0A0E11] placeholder:text-neutral-400 outline-none pr-2"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-neutral-400 hover:text-neutral-600 p-1 cursor-pointer transition-colors"
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
            >
              {showConfirmPassword ? (
                <FiEyeOff className="w-4 h-4" />
              ) : (
                <FiEye className="w-4 h-4" />
              )}
            </button>
          </div>
          {confirmPassword && !isMatch && (
            <p className="text-xs text-red-500 font-medium">
              Passwords do not match
            </p>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={!isValid}
            className={`w-full h-13.5 rounded-full font-bold text-sm sm:text-base flex items-center justify-center transition-all shadow-md ${
              isValid
                ? "bg-primary hover:bg-primary-hoverover text-white cursor-pointer active:scale-[0.99]"
                : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
            }`}
          >
            {loading ? (
              <ClipLoader color="#FFFFFF" size={20} />
            ) : (
              <span>Save password</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      backUrl="/auth/forgot-password/verify"
      bannerTitle="Strong credentials protect your business."
      bannerSubtitle="Choose a password that is unique and easy for you to remember."
      bannerQuote="“All sensitive store credentials and payouts are guarded with industry standard encryption.”"
    >
      <Suspense
        fallback={
          <div className="py-12 text-center">
            <ClipLoader color="#800A1D" size={28} />
          </div>
        }
      >
        <ResetPasswordContent />
      </Suspense>
    </AuthLayout>
  );
}
