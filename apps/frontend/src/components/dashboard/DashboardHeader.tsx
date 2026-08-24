"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, LogOut, ExternalLink, Bell } from "lucide-react";
import Dropdown from "@/components/ui/Dropdown";
import { Badge } from "@/components/ui/Badge";
import { useSellerAuth } from "@/context/SellerAuthContext";
import { useLogout } from "@/hooks/useAuth";
import { useStore } from "@/hooks/useStore";
import { initialsOf, storePublicUrl } from "@/lib/utils";
import { currentNavItem } from "./nav";
import { useUnreadCount } from "@/hooks/useCommerce";

export default function DashboardHeader({
  onOpenMobileNav,
}: {
  onOpenMobileNav: () => void;
}) {
  const pathname = usePathname();
  const { user } = useSellerAuth();
  const logout = useLogout();
  const { data: store } = useStore();
  const { data: unread } = useUnreadCount();
  const unreadCount = unread?.count ?? 0;

  const current = currentNavItem(pathname);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-border font-space-grotesk flex items-center justify-between px-4 sm:px-6 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileNav}
          aria-label="Open navigation"
          className="lg:hidden p-2 text-text hover:text-primary cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold tracking-tight truncate">
          {current.label}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {store?.isLive && (
          <Badge variant="success" className="hidden sm:inline-flex">
            Store Live
          </Badge>
        )}

        <Link
          href="/dashboard/notifications"
          aria-label="Notifications"
          className="relative p-2 text-neutral-500 hover:text-primary transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
          )}
        </Link>

        <Dropdown
          trigger={
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                {user ? initialsOf(user.name) : "…"}
              </div>
            </div>
          }
          options={[
            {
              value: "store",
              label: store?.isLive ? "View Store" : "Store Preview",
              icon: <ExternalLink className="w-4 h-4" />,
            },
            {
              value: "logout",
              label: "Log Out",
              icon: <LogOut className="w-4 h-4" />,
              danger: true,
            },
          ]}
          onSelect={(value) => {
            if (value === "logout") logout.mutate();
            if (value === "store" && store?.slug) {
              window.open(storePublicUrl(store.slug), "_blank");
            }
          }}
        />
      </div>
    </header>
  );
}
