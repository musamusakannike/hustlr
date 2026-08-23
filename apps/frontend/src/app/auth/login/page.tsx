"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff, FiAlertCircle } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { ClipLoader } from "react-spinners";
import AuthLayout from "@/components/auth/AuthLayout";
import { authService } from "@/services/auth.service";
import { useAuth } from "@/context/auth.context";
import { getGoogleIdToken } from "@/services/firebase.client";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isValid = email.trim().length > 0 && password.length > 0 && !loading;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await authService.loginSeller(email.trim(), password);
      setUser(response.user);
      const nextUrl = await authService.getPostAuthRedirect();
      router.replace(nextUrl);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Invalid credentials. Please verify and try again.";
      setErrorMessage(message);

      // If user is not verified, offer direct navigation to OTP verification
      if (message.toLowerCase().includes("verify your email")) {
        setTimeout(() => {
          router.push(
            `/auth/verify-otp?email=${encodeURIComponent(email.trim())}`,
          );
        }, 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (loading) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const idToken = await getGoogleIdToken();
      const response = await authService.googleSeller(idToken);
      setUser(response.user);
      const nextUrl = await authService.getPostAuthRedirect();
      router.replace(nextUrl);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Google sign-in failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      backUrl="/"
      bannerTitle="Manage and scale your storefront anywhere."
      bannerSubtitle="Real-time order notifications, escrow wallet payouts, and instant inventory management at your fingertips."
      bannerQuote="“Logistics and payments are headache-free. Hustlr escrow gave our buyers 100% confidence to order.”"
    >
      <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
        {/* Title Section */}
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold font-archivo tracking-tight text-[#0A0E11]">
            Welcome Back!
          </h1>
          <p className="text-sm text-neutral-500 font-normal">
            Log in to your Hustlr merchant account
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium flex items-start gap-2.5 animate-[shake_0.2s_ease-in-out]">
            <FiAlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-700 tracking-wide">
              Email
            </label>
            <div
              className={`flex items-center h-13 px-4 rounded-xl border bg-white transition-all ${
                isEmailFocused || email.length > 0
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
                onFocus={() => setIsEmailFocused(true)}
                onBlur={() => setIsEmailFocused(false)}
                className="w-full h-full bg-transparent text-sm text-[#0A0E11] placeholder:text-neutral-400 outline-none"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-700 tracking-wide">
              Password
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                className="w-full h-full bg-transparent text-sm text-[#0A0E11] placeholder:text-neutral-400 outline-none pr-2"
                autoComplete="current-password"
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

            {/* Forgot Password Link */}
            <div className="flex justify-end pt-1">
              <Link
                href="/auth/forgot-password"
                className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {/* Actions Section */}
          <div className="pt-2 space-y-4">
            {/* Primary Log In Button */}
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
                <span>Log In</span>
              )}
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="w-full border-t border-neutral-200" />
              <span className="absolute bg-white px-3 text-xs text-neutral-400 font-medium">
                Or
              </span>
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full h-13.5 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 text-[#0A0E11] font-semibold text-sm flex items-center justify-center gap-3 transition-all cursor-pointer shadow-xs hover:border-neutral-300 active:scale-[0.99]"
            >
              <FcGoogle className="w-5 h-5" />
              <span>Log In with Google</span>
            </button>
          </div>
        </form>

        {/* Sign Up Footer Row */}
        <div className="text-center pt-2 text-sm text-neutral-500">
          <span>New to Hustlr? </span>
          <Link
            href="/auth/register"
            className="font-bold text-primary hover:text-primary-hover transition-colors"
          >
            Sign up Now
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
