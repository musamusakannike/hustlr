"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Buyer } from "@/types/buyer";
import { buyerAuthService, storefrontService } from "@/services/storefront";

interface BuyerAuthValue {
  slug: string;
  buyer: Buyer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setBuyer: (buyer: Buyer | null) => void;
  logout: () => Promise<void>;
}

const BuyerAuthContext = createContext<BuyerAuthValue | null>(null);

export function BuyerAuthProvider({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  const handleSet = useCallback((next: Buyer | null) => {
    setBuyer(next);
    if (typeof window === "undefined") return;
    if (next) localStorage.setItem("hustlr_buyer_user", JSON.stringify(next));
    else {
      localStorage.removeItem("hustlr_buyer_user");
      localStorage.removeItem("hustlr_buyer_token");
    }
  }, []);

  useEffect(() => {
    storefrontService.setSlug(slug);
    let cancelled = false;
    buyerAuthService
      .me(slug)
      .then((res) => {
        if (!cancelled) handleSet(res.user);
      })
      .catch(() => {
        if (!cancelled) handleSet(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, handleSet]);

  const logout = useCallback(async () => {
    await buyerAuthService.logout(slug).catch(() => undefined);
    handleSet(null);
    queryClient.removeQueries({ queryKey: ["cart", slug] });
  }, [slug, handleSet, queryClient]);

  return (
    <BuyerAuthContext.Provider
      value={{
        slug,
        buyer,
        isAuthenticated: buyer !== null,
        isLoading,
        setBuyer: handleSet,
        logout,
      }}
    >
      {children}
    </BuyerAuthContext.Provider>
  );
}

export function useBuyerAuth() {
  const ctx = useContext(BuyerAuthContext);
  if (!ctx) throw new Error("useBuyerAuth must be used within BuyerAuthProvider");
  return ctx;
}

export function useOptionalBuyerAuth() {
  return useContext(BuyerAuthContext);
}
