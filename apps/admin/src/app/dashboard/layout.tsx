"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import AdminHeader from "@/components/AdminHeader";
import { authService } from "@/lib/api";
import { canAccessPath } from "@/lib/permissions";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!authService.isAdminAuthenticated()) {
      router.replace("/login");
    } else {
      setIsChecking(false);
    }
  }, [router]);

  const adminRole = authService.getUser()?.adminRole || "super_admin";
  const allowed = canAccessPath(adminRole, pathname);

  const getPageTitle = () => {
    if (pathname.includes("/kyc")) return "KYC Verification";
    if (pathname.includes("/stores")) return "Storefront Management";
    if (pathname.includes("/users")) return "Users & Sellers";
    if (pathname.includes("/orders")) return "Orders & Escrow";
    if (pathname.includes("/payouts")) return "Merchant Payouts";
    if (pathname.includes("/dispute")) return "Dispute Resolution";
    if (pathname.includes("/support-tickets")) return "Support Tickets";
    if (pathname.includes("/plans")) return "Subscription Plans";
    if (pathname.includes("/templates")) return "Store Templates";
    if (pathname.includes("/categories")) return "Global Categories";
    if (pathname.includes("/reviews")) return "Product Reviews";
    if (pathname.includes("/transactions")) return "Platform Transactions";
    if (pathname.includes("/referrals")) return "Referral Tracking";
    if (pathname.includes("/analytics")) return "Analytics & Reports";
    if (pathname.includes("/activity-logs")) return "Audit & Activity Logs";
    if (pathname.includes("/settings")) return "Platform Settings";
    if (pathname.includes("/help")) return "Help & Documentation";
    return "Operations Overview";
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-sans">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-sm font-semibold text-gray-600">
          Authenticating admin session...
        </p>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex font-sans">
        <Sidebar
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
        <div className="flex-1 flex flex-col md:pl-64 min-w-0">
          <AdminHeader
            onMenuClick={() => setMobileMenuOpen(true)}
            pageTitle="Access Restricted"
          />
          <main className="flex-1 p-6 lg:p-10 max-w-7xl w-full mx-auto">
            <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-xs">
              <h2 className="text-xl font-bold text-slate-800">
                You do not have access to this section
              </h2>
              <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                Your assigned role does not grant permission to view this
                module. If you require access, please reach out to the lead
                administrator.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-soft flex font-sans">
      {/* Mobile Drawer Overlay Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs md:hidden transition-opacity"
        />
      )}

      {/* Persistent Left Sidebar */}
      <Sidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Container Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <AdminHeader
          onMenuClick={() => setMobileMenuOpen(true)}
          pageTitle={getPageTitle()}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
