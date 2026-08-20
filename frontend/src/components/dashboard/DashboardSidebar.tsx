"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Palette,
  Package,
  FolderTree,
  ShieldCheck,
  CreditCard,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
import { cn, initialsOf } from "@/lib/utils";
import { useSellerAuth } from "@/context/SellerAuthContext";
import { useStore } from "@/hooks/useStore";
import { APP_NAME, LOGO_PATH } from "@/constants/app.constants";

export const DASHBOARD_NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/setup", label: "Store Setup", icon: Store },
  { href: "/dashboard/templates", label: "Templates", icon: Palette },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/categories", label: "Categories", icon: FolderTree },
  { href: "/dashboard/kyc", label: "KYC Verification", icon: ShieldCheck },
  { href: "/dashboard/billing", label: "Billing & Plan", icon: CreditCard },
];

function NavLinks({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { data: store } = useStore();

  return (
    <nav className="flex flex-col gap-1 px-3">
      {DASHBOARD_NAV.map((item) => {
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
              isActive
                ? "bg-primary text-white shadow-sm"
                : "text-neutral-600 hover:text-text hover:bg-black/5"
            )}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );
      })}

      {!collapsed && store && (
        <div className="mt-4 mx-1 rounded-xl border border-border bg-bg-soft p-3.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1">
            Your Store
          </p>
          <p className="text-sm font-semibold text-text truncate">
            {store.name || "Unnamed store"}
          </p>
          <p className="text-xs text-muted truncate font-mono">
            {store.slug || "your-store"}.hustlr.online
          </p>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 mt-2 text-xs font-bold px-2.5 py-1 rounded-full",
              store.isLive
                ? "bg-success-light text-success"
                : "bg-warning-light text-warning"
            )}
          >
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                store.isLive ? "bg-success" : "bg-warning"
              )}
            />
            {store.isLive ? "Live" : "Offline"}
          </span>
        </div>
      )}
    </nav>
  );
}

export default function DashboardSidebar({
  mobileOpen,
  onCloseMobile,
}: {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useSellerAuth();

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col shrink-0 h-screen sticky top-0 bg-white border-r border-border transition-all duration-200 font-space-grotesk",
          collapsed ? "w-20" : "w-64"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2.5 px-5 h-16 border-b border-border",
            collapsed && "justify-center px-0"
          )}
        >
          <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-border shrink-0">
              <Image
                src={LOGO_PATH}
                alt={`${APP_NAME} Logo`}
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            {!collapsed && (
              <span className="font-bold text-xl tracking-tight text-text font-archivo truncate">
                {APP_NAME}
              </span>
            )}
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar py-4">
          <NavLinks collapsed={collapsed} />
        </div>

        <div className="border-t border-border p-3">
          {collapsed ? (
            <div className="w-9 h-9 mx-auto rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
              {user ? initialsOf(user.name) : "…"}
            </div>
          ) : (
            <div className="flex items-center gap-2.5 px-2">
              <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">
                {user ? initialsOf(user.name) : "…"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text truncate">
                  {user?.name ?? "—"}
                </p>
                <p className="text-xs text-muted truncate">{user?.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className={cn(
              "mt-3 w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-muted hover:text-text hover:bg-black/5 transition-colors cursor-pointer",
              collapsed && "justify-center px-0"
            )}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden transition-all duration-300",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity",
            mobileOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={onCloseMobile}
        />
        <aside
          className={cn(
            "absolute left-0 top-0 h-full w-72 bg-white border-r border-border flex flex-col font-space-grotesk transition-transform duration-300",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between px-5 h-16 border-b border-border">
            <Link
              href="/dashboard"
              onClick={onCloseMobile}
              className="flex items-center gap-2.5"
            >
              <div className="w-9 h-9 rounded-xl overflow-hidden border border-border">
                <Image
                  src={LOGO_PATH}
                  alt={`${APP_NAME} Logo`}
                  width={36}
                  height={36}
                  className="object-contain"
                />
              </div>
              <span className="font-bold text-xl tracking-tight text-text font-archivo">
                {APP_NAME}
              </span>
            </Link>
            <button
              onClick={onCloseMobile}
              aria-label="Close navigation"
              className="p-2 text-muted hover:text-text cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar py-4">
            <NavLinks collapsed={false} onNavigate={onCloseMobile} />
          </div>
        </aside>
      </div>
    </>
  );
}
