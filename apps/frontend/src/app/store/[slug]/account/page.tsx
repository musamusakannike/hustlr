"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import Button from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useBuyerAuth } from "@/context/BuyerAuthContext";
import { storeHref } from "@/lib/store-path";

export default function BuyerAccountPage() {
  const { slug } = useParams<{ slug: string }>();
  const { buyer, isAuthenticated, isLoading, logout } = useBuyerAuth();
  const router = useRouter();
  const href = (p: string) => storeHref(slug, p);

  if (isLoading) return <Spinner />;
  if (!isAuthenticated) {
    router.replace(href("/auth/login"));
    return <Spinner />;
  }

  const links = [
    { href: href("/account/orders"), label: "Orders" },
    { href: href("/account/wishlist"), label: "Wishlist" },
    { href: href("/account/referrals"), label: "Referrals" },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold">{buyer?.name}</h1>
      <p className="text-sm opacity-70">{buyer?.email}</p>
      <ul className="mt-6 flex flex-col gap-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="flex items-center justify-between border rounded-2xl px-4 py-3">
              <span className="font-semibold text-sm">{l.label}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </li>
        ))}
      </ul>
      <Button variant="danger" className="mt-8" onClick={() => logout()}>
        Log out
      </Button>
    </div>
  );
}
