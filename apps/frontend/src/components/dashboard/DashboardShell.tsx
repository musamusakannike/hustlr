"use client";

import React, { useState } from "react";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex flex-col flex-1 min-w-0">
        <DashboardHeader onOpenMobileNav={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 font-space-grotesk">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
