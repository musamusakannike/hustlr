"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { ClipLoader } from "react-spinners";
import AuthLayout from "@/components/auth/AuthLayout";
import OtpInput from "@/components/auth/OtpInput";
import { authService } from "@/services/auth.service";

function ForgotPasswordVerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const emailParam = searchParams.get("email") || "";
  const targetEmail = emailParam.trim() || "merchant@hustlr.shop";

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successInfo, setSuccessInfo] = useState("");

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const isValid = otp.every((digit) => digit.trim().length > 0) && !loading;

  const handleContinue = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const codeStr = otp.join("").trim();
    if (codeStr.length !== 6 || loading) return;

    setLoading(true);
    // Direct navigation to reset password page with email and verified code
    router.push(
      `/auth/forgot-password/reset?email=${encodeURIComponent(
        targetEmail
      )}&code=${encodeURIComponent(codeStr)}`
    );
  };

  const handleResend = async () => {
    if (resending || timer > 0) return;
    setResending(true);
    setErrorMessage("");
    setSuccessInfo("");

    try {
      await authService.forgotSellerPassword(targetEmail);
      setTimer(60);
      setOtp(["", "", "", "", "", ""]);
      setSuccessInfo("A new password reset code has been sent to your email.");
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Failed to resend reset code."
      );
    } finally {
      setResending(false);
    }
  };

  const formattedTimer = `00:${timer < 10 ? `0${timer}` : timer}s`;

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      {/* Title Section */}
      <div className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-bold font-archivo tracking-tight text-[#0A0E11]">
          Enter the password reset code
        </h1>
        <p className="text-sm text-neutral-500 font-normal">
          Enter the 6-digit one-time code sent to{" "}
          <span className="font-semibold text-[#0A0E11]">{targetEmail}</span>
        </p>
      </div>

      {/* Success Info Banner */}
      {successInfo && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium flex items-center gap-2.5">
          <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successInfo}</span>
        </div>
      )}

      {/* Error Alert Box */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium flex items-start gap-2.5 animate-[shake_0.2s_ease-in-out]">
          <FiAlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* OTP Grid Form */}
      <form onSubmit={handleContinue} className="space-y-6">
        <div className="space-y-4">
          <OtpInput value={otp} onChange={setOtp} disabled={loading} />

          {/* Timer & Resend Row */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-neutral-400">
              {timer > 0 ? (
                <>Code expires in <span className="font-mono font-medium text-neutral-600">{formattedTimer}</span></>
              ) : (
                "Code has expired"
              )}
            </span>
            <button
              type="button"
              disabled={timer > 0 || resending}
              onClick={handleResend}
              className={`font-semibold transition-colors cursor-pointer ${
                timer > 0 || resending
                  ? "text-neutral-300 cursor-not-allowed"
                  : "text-[#800A1D] hover:text-[#660817]"
              }`}
            >
              {resending ? "Sending..." : "Resend code"}
            </button>
          </div>
        </div>

        {/* Continue Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={!isValid}
            className={`w-full h-13.5 rounded-full font-bold text-sm sm:text-base flex items-center justify-center transition-all shadow-md ${
              isValid
                ? "bg-[#800A1D] hover:bg-[#660817] text-white cursor-pointer active:scale-[0.99]"
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
  );
}

export default function ForgotPasswordVerifyPage() {
  return (
    <AuthLayout
      backUrl="/auth/forgot-password"
      bannerTitle="Fast and encrypted password recovery."
      bannerSubtitle="Enter your OTP code to set a new password and immediately resume your storefront operations."
      bannerQuote="“Protected access ensures only verified store owners can modify store settings or withdraw funds.”"
    >
      <Suspense fallback={<div className="py-12 text-center"><ClipLoader color="#800A1D" size={28} /></div>}>
        <ForgotPasswordVerifyContent />
      </Suspense>
    </AuthLayout>
  );
}
