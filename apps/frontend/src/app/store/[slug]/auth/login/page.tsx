"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Button from "@/components/ui/Button";
import { buyerAuthService } from "@/services/storefront";
import { useBuyerAuth } from "@/context/BuyerAuthContext";
import { getGoogleIdToken } from "@/services/firebase.client";
import { storeHref } from "@/lib/store-path";
import { getErrorMessage } from "@/lib/utils";

export default function BuyerLoginPage() {
  const { slug } = useParams<{ slug: string }>();
  const { setBuyer } = useBuyerAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const go = (path: string) => router.replace(storeHref(slug, path));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await buyerAuthService.login(slug, { email: email.trim(), password });
      setBuyer(res.user);
      go("/");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold">Sign in</h1>
      <p className="text-sm opacity-70 mt-1">This account only works in this store.</p>
      <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
        {error && <p className="text-sm text-danger">{error}</p>}
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border bg-transparent"
        />
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border bg-transparent pr-10"
          />
          <button type="button" className="absolute right-3 top-3.5" onClick={() => setShow((s) => !s)}>
            {show ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>
        <Button type="submit" loading={loading} disabled={!email || !password}>
          Sign in
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={async () => {
            setLoading(true);
            try {
              const token = await getGoogleIdToken();
              const res = await buyerAuthService.google(slug, { idToken: token });
              setBuyer(res.user);
              go("/");
            } catch (err) {
              setError(getErrorMessage(err));
            } finally {
              setLoading(false);
            }
          }}
        >
          Continue with Google
        </Button>
      </form>
      <p className="text-sm mt-4">
        New here?{" "}
        <Link className="font-semibold" href={storeHref(slug, "/auth/register")}>
          Create an account
        </Link>
      </p>
      <p className="text-sm mt-2">
        <Link href={storeHref(slug, "/auth/forgot-password")}>Forgot password?</Link>
      </p>
    </div>
  );
}
