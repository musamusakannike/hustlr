"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "@/types/auth";
import { authService } from "@/services/auth";
import { setAuthCookie, clearAuthCookie } from "@/lib/auth-cookie";

interface SellerAuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

const SellerAuthContext = createContext<SellerAuthContextValue | null>(null);

export function SellerAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = window.localStorage.getItem("hustlr_user");
      const token = window.localStorage.getItem("hustlr_token") || window.localStorage.getItem("token");
      if (token) setAuthCookie(token);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  const handleSetUser = useCallback((newUser: User | null) => {
    setUser(newUser);
    if (typeof window !== "undefined") {
      if (newUser) {
        window.localStorage.setItem("hustlr_user", JSON.stringify(newUser));
        const token = window.localStorage.getItem("hustlr_token") || window.localStorage.getItem("token");
        if (token) setAuthCookie(token);
      } else {
        window.localStorage.removeItem("hustlr_user");
        window.localStorage.removeItem("hustlr_token");
        window.localStorage.removeItem("hustlr_mock_session");
        clearAuthCookie();
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    authService
      .me()
      .then((res) => {
        if (!cancelled) {
          const me =
            res && typeof res === "object" && "user" in res
              ? (res as any).user
              : res;
          if (me) {
            handleSetUser(me);
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          handleSetUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [handleSetUser]);

  const logout = useCallback(async () => {
    await authService.logout().catch(() => undefined);
    handleSetUser(null);
    queryClient.clear();
  }, [handleSetUser, queryClient]);

  return (
    <SellerAuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        setUser: handleSetUser,
        logout,
      }}
    >
      {children}
    </SellerAuthContext.Provider>
  );
}

export function useSellerAuth() {
  const ctx = useContext(SellerAuthContext);
  if (!ctx) {
    throw new Error("useSellerAuth must be used within a SellerAuthProvider");
  }
  return ctx;
}
