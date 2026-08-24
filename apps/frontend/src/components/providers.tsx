"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@/components/ui/Toast";
import { SellerAuthProvider } from "@/context/SellerAuthContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: (failureCount, error) => {
              const status =
                typeof error === "object" && error !== null && "status" in error
                  ? (error as { status: number }).status
                  : 0;
              if (status === 401 || status === 403 || status === 404) {
                return false;
              }
              return failureCount < 2;
            },
            refetchOnWindowFocus: false,
          },
          mutations: { retry: false },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <SellerAuthProvider>{children}</SellerAuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
