"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MailCheck } from "lucide-react";
import AuthCard from "@/components/auth/AuthCard";
import OtpInput from "@/components/auth/OtpInput";
import Button from "@/components/ui/Button";
import { useVerifyOtp, useResendOtp } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { getErrorMessage } from "@/lib/utils";
import { isMockTransportActive } from "@/lib/transport";

const RESEND_COOLDOWN_SECONDS = 60;

function VerifyOtpForm() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const verifyOtp = useVerifyOtp();
  const resendOtp = useResendOtp();

  const [email] = useState(searchParams.get("email") ?? "");
  const [otp, setOtp] = useState("");
  const [hasError, setHasError] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const hasAutoSubmitted = useRef(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleComplete = (code: string) => {
    if (hasAutoSubmitted.current) return;
    hasAutoSubmitted.current = true;
    submit(code);
  };

  const submit = (code: string) => {
    if (!email) {
      toast("Missing email. Please register again.", "error");
      return;
    }
    verifyOtp.mutate(
      { email, otp: code },
      {
        onSuccess: () => {
          toast("Email verified! Welcome to Hustlr.", "success");
        },
        onError: (err) => {
          hasAutoSubmitted.current = false;
          setHasError(true);
          setOtp("");
          toast(getErrorMessage(err), "error");
        },
      }
    );
  };

  const handleResend = () => {
    if (!email) {
      toast("Missing email. Please register again.", "error");
      return;
    }
    resendOtp.mutate(email, {
      onSuccess: () => {
        setCooldown(RESEND_COOLDOWN_SECONDS);
        setOtp("");
        setHasError(false);
        toast("A fresh OTP has been sent to your email.", "success");
      },
      onError: (err) => toast(getErrorMessage(err), "error"),
    });
  };

  return (
    <AuthCard
      title="Verify your email"
      subtitle={
        <>
          We sent a 6-digit code to{" "}
          <span className="font-semibold text-text">{email || "your email"}</span>
          . It expires in 10 minutes.
        </>
      }
      footer={
        <>
          Wrong email?{" "}
          <Link
            href="/register"
            className="text-primary font-semibold hover:underline"
          >
            Register again
          </Link>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (otp.length === 6) submit(otp);
        }}
        className="flex flex-col gap-5"
      >
        <OtpInput
          value={otp}
          onChange={(v) => {
            setOtp(v);
            setHasError(false);
          }}
          onComplete={handleComplete}
          disabled={verifyOtp.isPending}
          hasError={hasError}
        />

        {isMockTransportActive() && (
          <p className="flex items-center gap-2 text-xs text-muted bg-primary-light/50 rounded-xl px-4 py-3">
            <MailCheck className="w-4 h-4 text-primary shrink-0" />
            <span>
              Demo mode — use OTP{" "}
              <span className="font-mono font-bold text-primary">123456</span>{" "}
              for any email.
            </span>
          </p>
        )}

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={verifyOtp.isPending}
          disabled={otp.length !== 6}
        >
          Verify & Continue
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || resendOtp.isPending}
            className="text-sm font-semibold text-primary hover:underline disabled:text-neutral-400 disabled:no-underline cursor-pointer disabled:cursor-not-allowed"
          >
            {cooldown > 0
              ? `Resend code in ${cooldown}s`
              : "Didn't get the code? Resend"}
          </button>
        </div>
      </form>
    </AuthCard>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense>
      <VerifyOtpForm />
    </Suspense>
  );
}
