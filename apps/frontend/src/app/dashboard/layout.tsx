"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSellerAuth } from "@/context/SellerAuthContext";
import { Spinner } from "@/components/ui/Spinner";
import DashboardShell from "@/components/dashboard/DashboardShell";

/**
 * Auth gate + shell for the seller dashboard. The Edge proxy performs a
 * coarse cookie check in API mode; this gate is authoritative for mock mode.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useSellerAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen h-full bg-bg-soft flex items-center justify-center">
        <Spinner size="lg" label="Loading your dashboard…" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen h-full bg-bg-soft flex items-center justify-center">
        <Spinner size="lg" label="Redirecting to login…" />
      </div>
    );
  }

  return (
    <div className="min-h-screen h-full bg-bg-soft text-text">
      <DashboardShell>{children}</DashboardShell>
    </div>
  );
}
