"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import AuthCard from "@/components/auth/AuthCard";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useForgotPassword } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { getErrorMessage } from "@/lib/utils";
import { isMockTransportActive } from "@/lib/transport";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const forgot = useForgotPassword();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    forgot.mutate(email, {
      onSuccess: (res) => {
        setSent(true);
        toast(res.message ?? "OTP sent.", "success");
      },
      onError: (err) => toast(getErrorMessage(err), "error"),
    });
  };

  if (sent) {
    return (
      <AuthCard
        title="Check your inbox"
        subtitle={
          <>
            We sent a password reset code to{" "}
            <span className="font-semibold text-text">{email}</span>. It expires
            in 10 minutes.
          </>
        }
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
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-14 h-14 rounded-full bg-primary-light/60 text-primary flex items-center justify-center">
            <MailCheck className="w-6 h-6" />
          </div>
          {isMockTransportActive() && (
            <p className="text-xs text-muted bg-primary-light/50 rounded-xl px-4 py-3 text-center">
              Demo mode — reset code is{" "}
              <span className="font-mono font-bold text-primary">123456</span>.
            </p>
          )}
          <Link
            href={`/reset-password?email=${encodeURIComponent(email)}`}
            className="w-full"
          >
            <Button fullWidth size="lg">
              Enter Reset Code
            </Button>
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter the email you registered with and we'll send you a reset code."
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
        <Button type="submit" fullWidth size="lg" loading={forgot.isPending}>
          Send Reset Code
        </Button>
      </form>
    </AuthCard>
  );
}
