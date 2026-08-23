"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import { APP_NAME, LOGO_PATH } from "@/constants/app.constants";

interface StartStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StartStoreModal({
  isOpen,
  onClose,
}: StartStoreModalProps) {
  const router = useRouter();
  const [storeName, setStoreName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const redirectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (redirectRef.current) clearTimeout(redirectRef.current);
    };
  }, []);

  const slugPreview = storeName
    ? storeName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
    : "your-store";

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const params = new URLSearchParams();
    if (storeName) params.set("store", storeName);
    if (email) params.set("email", email);
    redirectRef.current = setTimeout(() => {
      onClose();
      router.push(`/register?${params.toString()}`);
    }, 2000);
  };

  const handleGoogle = () => {
    onClose();
    router.push("/register?google=1");
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-space-grotesk animate-[fade-in_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden text-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden relative border border-neutral-200">
              <Image
                src={LOGO_PATH}
                alt={`${APP_NAME} Logo`}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="font-bold text-xl text-text tracking-tight">
                Launch Your {APP_NAME} Store
              </h3>
              <p className="text-xs text-muted">
                Get live in under 5 minutes • Zero credit card required
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-black transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {submitted ? (
          <div className="py-8 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary-light/40 text-primary flex items-center justify-center text-3xl font-bold">
              ✓
            </div>
            <h4 className="text-2xl font-bold text-text">Registration Started!</h4>
            <p className="text-sm text-muted max-w-xs">
              We&apos;re preparing your store dashboard at{" "}
              <span className="font-mono text-primary font-semibold">
                {slugPreview}.hustlr.online
              </span>
              . Check your email for OTP verification.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                Store Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Musa's Fashion Hub"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-primary text-sm text-text"
              />
              <p className="text-xs text-neutral-400 mt-1">
                Your store URL:{" "}
                <span className="font-mono text-primary font-medium">
                  {slugPreview}.hustlr.online
                </span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                Merchant Email Address
              </label>
              <input
                type="email"
                required
                placeholder="musa@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-primary text-sm text-text"
              />
            </div>

            <Button type="submit" fullWidth size="lg" className="mt-2">
              <span>Create Store &amp; Verify OTP</span>
              <ArrowRight className="w-5 h-5" />
            </Button>

            <div className="relative my-2 text-center">
              <span className="bg-white px-3 text-xs text-neutral-400 font-medium relative z-10">
                OR
              </span>
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
            </div>

            <Button
              type="button"
              variant="light"
              fullWidth
              onClick={handleGoogle}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
