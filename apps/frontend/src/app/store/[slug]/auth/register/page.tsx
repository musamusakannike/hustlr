"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { buyerAuthService } from "@/services/storefront";
import { storeHref } from "@/lib/store-path";
import { getErrorMessage } from "@/lib/utils";

export default function BuyerRegisterPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold">Create account</h1>
      <form
        className="mt-6 flex flex-col gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          setError("");
          try {
            await buyerAuthService.register(slug, { name, email: email.trim(), password });
            router.replace(
              storeHref(slug, `/auth/verify-otp?email=${encodeURIComponent(email.trim())}`)
            );
          } catch (err) {
            setError(getErrorMessage(err));
          } finally {
            setLoading(false);
          }
        }}
      >
        {error && <p className="text-sm text-danger">{error}</p>}
        <input required placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl border bg-transparent" />
        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border bg-transparent" />
        <input type="password" required minLength={8} placeholder="Password (8+ characters)" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border bg-transparent" />
        <Button type="submit" loading={loading}>Create account</Button>
      </form>
      <p className="text-sm mt-4">
        Already have an account?{" "}
        <Link className="font-semibold" href={storeHref(slug, "/auth/login")}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
