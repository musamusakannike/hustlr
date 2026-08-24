"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { colors } from "@/constants/colors";
import { authService } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("reason") === "session_expired") {
        return "Your session has expired. Please log in again.";
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      await authService.login(email, password);
      router.push("/dashboard/overview");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Authentication failed. Please verify your credentials.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full bg-white font-sans">
      {/* Left Maroon Brand Panel */}
      <div
        className="w-full md:w-1/2 lg:w-[46%] flex flex-col items-center justify-between p-8 md:p-14 min-h-70 md:min-h-screen relative overflow-hidden"
        style={{ backgroundColor: colors.primary }}
      >
        {/* Subtle decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-white/5 pointer-events-none" />

        <div className="my-auto flex flex-col items-center text-center z-10 max-w-sm">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 mb-6 flex items-center justify-center transition-transform hover:scale-105 duration-300">
            <Image
              src="/nav-icon.webp"
              alt="Hustlr Logo"
              width={112}
              height={112}
              priority
              className="object-contain drop-shadow-xl"
            />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Hustlr Admin
          </h2>
          <p className="text-sm font-medium text-white/80 mt-2 leading-relaxed">
            Centralized operations, dispute resolution, escrow management, and
            store oversight.
          </p>
        </div>

        <div className="w-full text-center z-10 hidden md:block">
          <p className="text-xs text-white/60">
            © {new Date().getFullYear()} Hustlr Shop Inc. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Login Form Panel */}
      <div className="w-full md:w-1/2 lg:w-[54%] flex flex-col items-center justify-center p-6 md:p-12 lg:p-20 flex-1">
        <div className="w-full max-w-md flex flex-col space-y-8">
          {/* Header */}
          <div>
            <h1
              className="text-2xl md:text-3xl font-bold tracking-tight"
              style={{ color: colors.heading }}
            >
              Sign In to Hustlr Admin
            </h1>
            <p className="text-sm font-medium text-gray-500 mt-1">
              Enter your platform administrator credentials to continue.
            </p>
          </div>

          {/* Error Message Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm flex items-start gap-3 shadow-xs animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold mb-2"
                style={{ color: colors.heading }}
              >
                Admin Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@hustlr.online"
                className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 transition-all outline-none font-medium placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/15 text-slate-800"
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold mb-2"
                style={{ color: colors.heading }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3.5 pr-11 rounded-2xl border border-gray-200 transition-all outline-none font-medium placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/15 text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-full font-bold text-white text-base shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-4 bg-primary hover:bg-primary-hover"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span>Verifying admin permissions...</span>
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Quick Helper Notes */}
          <div className="pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              Need assistance or lost access? Contact your systems lead.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
