"use client";

import React, { Suspense, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import { buyerAuthService } from "@/services/storefront";
import { useBuyerAuth } from "@/context/BuyerAuthContext";
import { storeHref } from "@/lib/store-path";
import { getErrorMessage } from "@/lib/utils";

function Inner() {
  const { slug } = useParams<{ slug: string }>();
  const search = useSearchParams();
  const email = search.get("email") ?? "";
  const { setBuyer } = useBuyerAuth();
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold">Verify email</h1>
      <p className="text-sm opacity-70 mt-1">We sent a 6-digit code to {email}</p>
      <form
        className="mt-6 flex flex-col gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          setError("");
          try {
            const res = await buyerAuthService.verifyOtp(slug, { email, otp });
            setBuyer(res.user);
            router.replace(storeHref(slug, "/"));
          } catch (err) {
            setError(getErrorMessage(err));
          } finally {
            setLoading(false);
          }
        }}
      >
        {error && <p className="text-sm text-danger">{error}</p>}
        <input
          inputMode="numeric"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border bg-transparent tracking-[0.4em] text-center text-lg"
        />
        <Button type="submit" loading={loading} disabled={otp.length !== 6}>
          Verify
        </Button>
      </form>
    </div>
  );
}

export default function BuyerVerifyPage() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}
