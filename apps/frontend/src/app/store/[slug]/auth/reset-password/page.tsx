"use client";

import React, { Suspense, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import { buyerAuthService } from "@/services/storefront";
import { storeHref } from "@/lib/store-path";
import { getErrorMessage } from "@/lib/utils";

function Inner() {
  const { slug } = useParams<{ slug: string }>();
  const search = useSearchParams();
  const email = search.get("email") ?? "";
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold">New password</h1>
      <form
        className="mt-6 flex flex-col gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          setError("");
          try {
            await buyerAuthService.resetPassword(slug, { email, otp, newPassword: password });
            router.replace(storeHref(slug, "/auth/login"));
          } catch (err) {
            setError(getErrorMessage(err));
          } finally {
            setLoading(false);
          }
        }}
      >
        {error && <p className="text-sm text-danger">{error}</p>}
        <input placeholder="6-digit code" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full px-4 py-3 rounded-xl border bg-transparent" />
        <input type="password" minLength={8} placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border bg-transparent" />
        <Button type="submit" loading={loading}>Update password</Button>
      </form>
    </div>
  );
}

export default function BuyerResetPage() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}
