"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { buyerAuthService } from "@/services/storefront";
import { storeHref } from "@/lib/store-path";
import { getErrorMessage } from "@/lib/utils";

export default function BuyerForgotPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold">Reset password</h1>
      <form
        className="mt-6 flex flex-col gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          setError("");
          try {
            await buyerAuthService.forgotPassword(slug, { email: email.trim() });
            router.push(storeHref(slug, `/auth/reset-password?email=${encodeURIComponent(email.trim())}`));
          } catch (err) {
            setError(getErrorMessage(err));
          } finally {
            setLoading(false);
          }
        }}
      >
        {error && <p className="text-sm text-danger">{error}</p>}
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-3 rounded-xl border bg-transparent" />
        <Button type="submit" loading={loading}>Send code</Button>
      </form>
    </div>
  );
}
