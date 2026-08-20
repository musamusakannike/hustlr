"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthCard from "@/components/auth/AuthCard";
import GoogleButton from "@/components/auth/GoogleButton";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRegister, useGoogleAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { getErrorMessage, slugify } from "@/lib/utils";

export const PENDING_STORE_KEY = "hustlr_pending_store_name";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const register = useRegister();
  const googleAuth = useGoogleAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState(() => searchParams.get("email") ?? "");
  const [storeName, setStoreName] = useState(
    () => searchParams.get("store") ?? ""
  );
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [showReferral, setShowReferral] = useState(false);

  useEffect(() => {
    const storeParam = searchParams.get("store");
    if (storeParam) {
      try {
        window.sessionStorage.setItem(PENDING_STORE_KEY, storeParam);
      } catch {
        /* storage unavailable — setup wizard just starts empty */
      }
    }
  }, [searchParams]);

  const slugPreview = storeName
    ? slugify(storeName)
    : "your-store";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register.mutate(
      {
        name,
        email,
        password,
        referralCode: referralCode.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast("Account created! Check your email for the OTP.", "success");
          router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
        },
        onError: (err) => toast(getErrorMessage(err), "error"),
      }
    );
  };

  return (
    <AuthCard
      title="Create your Hustlr store"
      subtitle="Register in minutes, verify your email, and start setting up your storefront."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary font-semibold hover:underline"
          >
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Full Name"
          name="name"
          required
          placeholder="e.g. Musa Abdullahi"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />

        <div>
          <Input
            label="Store Name"
            name="storeName"
            placeholder="e.g. Musa's Fashion Hub"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            hint={
              <>
                Your store URL:{" "}
                <span className="font-mono text-primary font-medium">
                  {slugPreview}.hustlr.online
                </span>
              </>
            }
          />
        </div>

        <Input
          label="Email Address"
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <Input
          label="Password"
          type="password"
          name="password"
          required
          minLength={8}
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />

        {showReferral ? (
          <Input
            label="Referral Code (optional)"
            name="referralCode"
            placeholder="e.g. HUSTLR2026"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
          />
        ) : (
          <button
            type="button"
            onClick={() => setShowReferral(true)}
            className="text-left text-xs font-semibold text-primary hover:underline cursor-pointer w-fit"
          >
            Have a referral code?
          </button>
        )}

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={register.isPending}
          className="mt-1"
        >
          Create Account & Verify OTP
        </Button>

        <div className="relative my-1 text-center">
          <span className="bg-white px-3 text-xs text-neutral-400 font-medium relative z-10">
            OR
          </span>
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
        </div>

        <GoogleButton
          onClick={() =>
            googleAuth.mutate(undefined, {
              onSuccess: () => toast("Signed up with Google", "success"),
              onError: (err) => toast(getErrorMessage(err), "error"),
            })
          }
          loading={googleAuth.isPending}
        />

        <p className="text-[11px] text-center text-neutral-400 leading-relaxed">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="underline hover:text-primary">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-primary">
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </AuthCard>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
