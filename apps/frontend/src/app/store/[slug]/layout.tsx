"use client";

import React from "react";
import { useParams } from "next/navigation";
import { BuyerAuthProvider } from "@/context/BuyerAuthContext";
import { useStorefrontInfo } from "@/hooks/useStorefront";
import { StorefrontFooter, StorefrontHeader } from "@/components/storefront/StorefrontChrome";
import { Spinner } from "@/components/ui/Spinner";
import { storefrontService } from "@/services/storefront";

function ThemedShell({ slug, children }: { slug: string; children: React.ReactNode }) {
  const { data: info, isLoading, error } = useStorefrontInfo(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner label="Loading store…" />
      </div>
    );
  }

  if (error || !info) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center">
        <div>
          <h1 className="text-2xl font-bold">This store isn’t available</h1>
          <p className="text-sm text-muted mt-2 max-w-md">
            It may still be setting up, or the subscription is paused. Try again later.
          </p>
        </div>
      </div>
    );
  }

  const scheme = info.colorScheme;
  const style = {
    ["--store-primary" as string]: scheme?.primary || "#800A1D",
    ["--store-secondary" as string]: scheme?.secondary || "#0A0E11",
    ["--store-accent" as string]: scheme?.accent || "#800A1D",
    ["--store-bg" as string]: scheme?.background || "#FFFFFF",
    ["--store-text" as string]: scheme?.text || "#0A0E11",
    background: "var(--store-bg)",
    color: "var(--store-text)",
  } as React.CSSProperties;

  return (
    <div className="min-h-screen flex flex-col font-space-grotesk" style={style}>
      <StorefrontHeader info={info} />
      <main className="flex-1">{children}</main>
      <StorefrontFooter info={info} />
    </div>
  );
}

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const { slug } = useParams<{ slug: string }>();
  storefrontService.setSlug(slug);
  return (
    <BuyerAuthProvider slug={slug}>
      <ThemedShell slug={slug}>{children}</ThemedShell>
    </BuyerAuthProvider>
  );
}
