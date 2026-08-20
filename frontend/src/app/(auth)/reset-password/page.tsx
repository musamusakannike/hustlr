"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AuthCard from "@/components/auth/AuthCard";
import OtpInput from "@/components/auth/OtpInput";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useResetPassword } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { getErrorMessage } from "@/lib/utils";
import { isMockTransportActive } from "@/lib/transport";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const reset = useResetPassword();

  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hasError, setHasError] = useState(false);

  const passwordsMatch =
    confirmPassword.length === 0 || newPassword === confirmPassword;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast("Passwords do not match.", "error");
      return;
    }
    reset.mutate(
      { email, otp, newPassword },
      {
        onSuccess: (res) => {
          toast(res.message ?? "Password updated.", "success");
        },
        onError: (err) => {
          setHasError(true);
          setOtp("");
          toast(getErrorMessage(err), "error");
        },
      }
    );
  };

  return (
    <AuthCard
      title="Set a new password"
      subtitle="Enter the reset code from your email and choose a new password."
      footer={
        <>
          Remembered it?{" "}
          <Link
            href="/login"
            className="text-primary font-semibold hover:underline"
          >
            Back to login
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

        <div>
          <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
            Reset Code
          </label>
          <OtpInput
            value={otp}
            onChange={(v) => {
              setOtp(v);
              setHasError(false);
            }}
            disabled={reset.isPending}
            hasError={hasError}
          />
        </div>

        {isMockTransportActive() && (
          <p className="text-xs text-muted bg-primary-light/50 rounded-xl px-4 py-3 text-center">
            Demo mode — reset code is{" "}
            <span className="font-mono font-bold text-primary">123456</span>.
          </p>
        )}

        <Input
          label="New Password"
          type="password"
          name="newPassword"
          required
          minLength={8}
          placeholder="At least 8 characters"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
        />

        <Input
          label="Confirm New Password"
          type="password"
          name="confirmPassword"
          required
          minLength={8}
          placeholder="Re-enter your new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          error={
            !passwordsMatch && confirmPassword.length > 0
              ? "Passwords do not match"
              : undefined
          }
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={reset.isPending}
          disabled={otp.length !== 6 || !passwordsMatch}
          className="mt-1"
        >
          Reset Password
        </Button>
      </form>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
