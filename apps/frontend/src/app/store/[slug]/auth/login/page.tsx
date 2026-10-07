"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight, Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { buyerAuthService } from "@/services/storefront";
import { useBuyerAuth } from "@/context/BuyerAuthContext";
import { useStorefrontInfo } from "@/hooks/useStorefront";
import { getGoogleIdToken } from "@/services/firebase.client";
import { storeHref } from "@/lib/store-path";
import { getErrorMessage } from "@/lib/utils";

export default function BuyerLoginPage() {
  const { slug } = useParams<{ slug: string }>();
  const { setBuyer } = useBuyerAuth();
  const { data: info } = useStorefrontInfo(slug);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const go = (path: string) => router.replace(storeHref(slug, path));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await buyerAuthService.login(slug, { email: email.trim(), password });
      setBuyer(res.user ?? (res as unknown as { buyer?: typeof res.user }).buyer ?? null);
      go("/");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      const token = await getGoogleIdToken();
      const res = await buyerAuthService.google(slug, { idToken: token });
      setBuyer(res.user ?? (res as unknown as { buyer?: typeof res.user }).buyer ?? null);
      go("/");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen text-black">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 w-full">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 font-normal"
        >
          <Link href={storeHref(slug, "/")} className="hover:text-black transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-black font-medium">Sign in</span>
        </nav>
      </div>

      {/* Main Form Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 w-full flex justify-center">
        <div className="w-full max-w-md">
          {/* ShopCo Styled Card */}
          <div className="border border-gray-200 rounded-[24px] sm:rounded-[32px] p-6 sm:p-10 bg-white shadow-xs">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="font-integral text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-black">
                SIGN IN
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-2 font-normal">
                Welcome back to {info?.name || "our store"}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-600 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-4">
              {/* Email Input */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#F0F0F0] rounded-full py-3.5 pl-11 pr-4 text-sm text-black placeholder-gray-400 outline-none transition-all focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Password
                  </label>
                  <Link
                    href={storeHref(slug, "/auth/forgot-password")}
                    className="text-xs text-gray-500 hover:text-black font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={show ? "text" : "password"}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#F0F0F0] rounded-full py-3.5 pl-11 pr-12 text-sm text-black placeholder-gray-400 outline-none transition-all focus:ring-2 focus:ring-black"
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-1 transition-colors"
                    onClick={() => setShow((s) => !s)}
                  >
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Pill Button (Powered by var(--store-primary, #000000)) */}
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full text-white font-medium py-3.5 px-6 rounded-full text-sm sm:text-base hover:opacity-90 transition shadow-sm text-center cursor-pointer mt-2 disabled:opacity-50 active:scale-[0.98]"
                style={{ backgroundColor: "var(--store-primary, #000000)" }}
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-gray-200 w-full" />
                <span className="bg-white px-3 text-xs text-gray-400 uppercase tracking-wider font-semibold">
                  or
                </span>
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                className="w-full border border-gray-200 bg-white hover:bg-gray-50 text-black font-semibold py-3.5 px-6 rounded-full text-sm flex items-center justify-center gap-2.5 transition shadow-2xs cursor-pointer"
              >
                <FaGoogle className="w-4 h-4 text-red-500" />
                <span>Continue with Google</span>
              </button>
            </form>

            {/* Bottom Link */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs sm:text-sm text-gray-500">
              <span>New to {info?.name || "this store"}? </span>
              <Link
                className="font-bold text-black underline hover:opacity-80 transition-opacity ml-1"
                href={storeHref(slug, "/auth/register")}
              >
                Create an account
              </Link>
            </div>
          </div>

          {/* Escrow badge */}
          <div className="flex items-center justify-center gap-2 mt-6 text-xs text-gray-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Secure &amp; Escrow-Protected Buyer Account</span>
          </div>
        </div>
      </main>
    </div>
  );
}
