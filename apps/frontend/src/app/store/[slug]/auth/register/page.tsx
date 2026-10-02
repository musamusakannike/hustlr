"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight, Eye, EyeOff, Lock, Mail, ShieldCheck, User } from "lucide-react";
import { buyerAuthService } from "@/services/storefront";
import { useStorefrontInfo } from "@/hooks/useStorefront";
import { storeHref } from "@/lib/store-path";
import { getErrorMessage } from "@/lib/utils";

export default function BuyerRegisterPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: info } = useStorefrontInfo(slug);
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await buyerAuthService.register(slug, { name, email: email.trim(), password });
      router.replace(
        storeHref(slug, `/auth/verify-otp?email=${encodeURIComponent(email.trim())}`)
      );
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
          <span className="text-black font-medium">Create Account</span>
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
                CREATE ACCOUNT
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-2 font-normal">
                Join {info?.name || "our store"} for exclusive perks and faster checkout
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-600 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-4">
              {/* Full Name */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 pointer-events-none">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#F0F0F0] rounded-full py-3.5 pl-11 pr-4 text-sm text-black placeholder-gray-400 outline-none transition-all focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              {/* Email Address */}
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

              {/* Password */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                  Password (8+ characters)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={show ? "text" : "password"}
                    required
                    minLength={8}
                    placeholder="Create a strong password"
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

              {/* Submit Pill Button */}
              <button
                type="submit"
                disabled={loading || !name || !email || password.length < 8}
                className="w-full text-white font-medium py-3.5 px-6 rounded-full text-sm sm:text-base hover:opacity-90 transition shadow-sm text-center cursor-pointer mt-2 disabled:opacity-50 active:scale-[0.98]"
                style={{ backgroundColor: "var(--store-primary, #000000)" }}
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            {/* Bottom Link */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs sm:text-sm text-gray-500">
              <span>Already have an account? </span>
              <Link
                className="font-bold text-black underline hover:opacity-80 transition-opacity ml-1"
                href={storeHref(slug, "/auth/login")}
              >
                Sign in
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
