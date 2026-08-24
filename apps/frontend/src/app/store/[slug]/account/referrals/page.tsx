"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/Spinner";
import { useBuyerAuth } from "@/context/BuyerAuthContext";
import { storeHref } from "@/lib/store-path";
import { getTransport } from "@/lib/transport";
import { useQuery } from "@tanstack/react-query";

export default function BuyerReferralsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated, isLoading: authLoading, buyer } = useBuyerAuth();
  const router = useRouter();
  const { data } = useQuery({
    queryKey: ["buyer-referrals", slug],
    queryFn: () => getTransport().buyerReferrals(slug),
    enabled: isAuthenticated,
  });

  if (authLoading) return <Spinner />;
  if (!isAuthenticated) {
    router.replace(storeHref(slug, "/auth/login"));
    return <Spinner />;
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold">Referrals</h1>
      <p className="text-sm opacity-70 mt-1">Share your code. Your first confirmed order can credit the friend who invited you.</p>
      <p className="mt-6 font-mono text-2xl font-bold">{data?.code || buyer?.referralCode}</p>
    </div>
  );
}
