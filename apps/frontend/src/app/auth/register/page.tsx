"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff, FiCheck, FiAlertCircle } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { ClipLoader } from "react-spinners";
import AuthLayout from "@/components/auth/AuthLayout";
import { authService } from "@/services/auth.service";
import { useSellerAuth } from "@/context/SellerAuthContext";
import { getGoogleIdToken } from "@/services/firebase.client";

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useSellerAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isPasswordMatch = password.length > 0 && password === confirmPassword;
  const isPasswordValidLength = password.length >= 8;

  const isValid =
    fullName.trim().length >= 2 &&
    email.trim().length > 0 &&
    isPasswordValidLength &&
    isPasswordMatch &&
    isAgreed &&
    !loading;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    if (!isPasswordValidLength) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (!isPasswordMatch) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await authService.registerSeller({
        name: fullName.trim(),
        email: email.trim(),
        password,
        referralCode: referralCode.trim() || undefined,
      });

      // Redirect directly to the 6-digit OTP verification screen
      router.replace(
        `/auth/verify-otp?email=${encodeURIComponent(response.email || email.trim())}`,
      );
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Failed to create merchant account. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (loading) return;

    if (!isAgreed) {
      setErrorMessage("Please accept the privacy policy and terms first.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const idToken = await getGoogleIdToken();
      const response = await authService.googleSeller(
        idToken,
        referralCode.trim() || undefined,
      );
      setUser(response.user);
      const nextUrl = await authService.getPostAuthRedirect();
      router.replace(nextUrl);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Google registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      backUrl="/auth/login"
      bannerTitle="Launch your branded store in under 5 minutes."
      bannerSubtitle="Get a custom subdomain (e.g. yourstore.hustlr.shop), access high-converting pro templates, and start selling with automatic escrow protection."
      bannerQuote="“The fastest store setup I've experienced. Within 10 minutes, my products were online and accepting payments.”"
    >
      <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
        {/* Title Section */}
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold font-archivo tracking-tight text-[#0A0E11]">
            Create An Account
          </h1>
          <p className="text-sm text-neutral-500 font-normal">
            You are signing up on Hustlr as a{" "}
            <span className="font-semibold text-primary">seller</span>
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium flex items-start gap-2.5 animate-[shake_0.2s_ease-in-out]">
            <FiAlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Full Name Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-700 tracking-wide">
              Full name
            </label>
            <div className="flex items-center h-12.5 px-4 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
              <input
                type="text"
                required
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-full bg-transparent text-sm text-[#0A0E11] placeholder:text-neutral-400 outline-none"
                autoComplete="name"
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-700 tracking-wide">
              Email
            </label>
            <div className="flex items-center h-12.5 px-4 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-full bg-transparent text-sm text-[#0A0E11] placeholder:text-neutral-400 outline-none"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-700 tracking-wide">
              Password{" "}
              <span className="text-[11px] font-normal text-neutral-400">
                (min. 8 characters)
              </span>
            </label>
            <div className="flex items-center h-12.5 px-4 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              Confirm password
            </label>
            <div className="flex items-center h-12.5 px-4 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                minLength={8}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
            {confirmPassword && !isPasswordMatch && (
              <p className="text-xs text-red-500 font-medium">
                Passwords do not match
              </p>
            )}
          </div>

          {/* Referral Code Field (optional) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-700 tracking-wide">
              Referral code{" "}
              <span className="text-[11px] font-normal text-neutral-400">
                (optional)
              </span>
            </label>
            <div className="flex items-center h-12.5 px-4 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
              <input
                type="text"
                placeholder="e.g. HUSTLR-ABC123"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                className="w-full h-full bg-transparent text-sm text-[#0A0E11] placeholder:text-neutral-400 uppercase outline-none font-mono"
              />
            </div>
          </div>

          {/* Terms & Privacy Agreement Checkbox */}
          <div
            onClick={() => setIsAgreed(!isAgreed)}
            className="flex items-start gap-3 pt-1 cursor-pointer select-none group"
          >
            <div
              className={`w-5 h-5 rounded-md border mt-0.5 flex items-center justify-center transition-all ${
                isAgreed
                  ? "bg-primary border-primary text-white shadow-xs"
                  : "border-neutral-300 bg-white group-hover:border-neutral-400"
              }`}
            >
              {isAgreed && <FiCheck className="w-3.5 h-3.5 stroke-3" />}
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed flex-1">
              By signing up, You agree to all Hustlr{" "}
              <Link
                href="/privacy"
                onClick={(e) => e.stopPropagation()}
                className="font-medium text-primary hover:underline"
              >
                Privacy policy
              </Link>
              , and{" "}
              <Link
                href="/terms"
                onClick={(e) => e.stopPropagation()}
                className="font-medium text-primary hover:underline"
              >
                terms and conditions
              </Link>
            </p>
          </div>

          {/* Actions Section */}
          <div className="pt-3 space-y-4">
            {/* Primary Sign Up Button */}
            <button
              type="submit"
              disabled={!isValid}
              className={`w-full h-13.5 rounded-full font-bold text-sm sm:text-base flex items-center justify-center transition-all shadow-md ${
                isValid
                  ? "bg-primary hover:bg-primary-hover text-white cursor-pointer active:scale-[0.99]"
                  : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <ClipLoader color="#FFFFFF" size={20} />
              ) : (
                <span>Sign up</span>
              )}
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-3">
              <div className="w-full border-t border-neutral-200" />
              <span className="absolute bg-white px-3 text-xs text-neutral-400 font-medium">
                Or
              </span>
            </div>

            {/* Google Sign Up Button */}
            <button
              type="button"
              onClick={handleGoogleSignUp}
              className="w-full h-13.5 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 text-[#0A0E11] font-semibold text-sm flex items-center justify-center gap-3 transition-all cursor-pointer shadow-xs hover:border-neutral-300 active:scale-[0.99]"
            >
              <FcGoogle className="w-5 h-5" />
              <span>Sign up with Google</span>
            </button>
          </div>
        </form>

        {/* Login Footer Link */}
        <div className="text-center pt-1 text-sm text-neutral-500">
          <span>Already have an account? </span>
          <Link
            href="/auth/login"
            className="font-bold text-primary hover:text-primary-hover transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
