"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import AuthCard from "@/components/auth/AuthCard";
import GoogleButton from "@/components/auth/GoogleButton";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLogin, useGoogleAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { getErrorMessage } from "@/lib/utils";
import { isMockTransportActive } from "@/lib/transport";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const login = useLogin();
  const googleAuth = useGoogleAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const nextPath = searchParams.get("next") ?? "/dashboard";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(
      { email, password },
      {
        onSuccess: () => {
          toast("Welcome back!", "success");
          router.replace(nextPath);
        },
        onError: (err) => toast(getErrorMessage(err), "error"),
      }
    );
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to manage your store, orders and payouts."
      footer={
        <>
          New to Hustlr?{" "}
          <Link
            href="/register"
            className="text-primary font-semibold hover:underline"
          >
            Create your free store
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
          <Input
            label="Password"
            type="password"
            name="password"
            required
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <div className="text-right mt-1.5">
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={login.isPending}
          className="mt-2"
        >
          Log In
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
              onSuccess: () => toast("Signed in with Google", "success"),
              onError: (err) => toast(getErrorMessage(err), "error"),
            })
          }
          loading={googleAuth.isPending}
        />

        {isMockTransportActive() && (
          <p className="text-xs text-center text-muted bg-primary-light/50 rounded-xl px-4 py-3 mt-2 leading-relaxed">
            Demo mode — log in with{" "}
            <span className="font-mono font-semibold text-primary">
              demo@hustlr.online
            </span>{" "}
            /{" "}
            <span className="font-mono font-semibold text-primary">
              password123
            </span>
          </p>
        )}
      </form>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
