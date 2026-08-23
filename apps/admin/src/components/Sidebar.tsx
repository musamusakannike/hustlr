"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  IdCard,
  Store,
  Users,
  ShoppingBag,
  Scale,
  Wallet,
  CreditCard,
  Palette,
  FolderTree,
  Star,
  MessageCircleQuestion,
  ArrowLeftRight,
  Gift,
  TrendingUp,
  Activity,
  Settings,
  HelpCircle,
  LogOut,
  X,
} from "lucide-react";
import {
  authService,
  adminTicketsService,
  adminKycService,
  adminPayoutsService,
} from "@/lib/api";
import {
  hasPermission,
  type AdminPermission,
  type AdminRole,
} from "@/lib/permissions";
import HustlrLogo from "./HustlrLogo";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  permission?: AdminPermission;
}

export const navItems: NavItem[] = [
  {
    name: "Overview",
    href: "/dashboard/overview",
    icon: LayoutGrid,
  },
  {
    name: "KYC Verification",
    href: "/dashboard/kyc",
    icon: IdCard,
    permission: "kyc.review",
  },
  {
    name: "Stores",
    href: "/dashboard/stores",
    icon: Store,
    permission: "stores.view",
  },
  {
    name: "Users & Sellers",
    href: "/dashboard/users",
    icon: Users,
    permission: "users.view",
  },
  {
    name: "Orders & Escrow",
    href: "/dashboard/orders",
    icon: ShoppingBag,
    permission: "orders.view",
  },
  {
    name: "Disputes",
    href: "/dashboard/dispute",
    icon: Scale,
    permission: "disputes.manage",
  },
  {
    name: "Payouts",
    href: "/dashboard/payouts",
    icon: Wallet,
    permission: "payouts.manage",
  },
  {
    name: "Subscription Plans",
    href: "/dashboard/plans",
    icon: CreditCard,
    permission: "plans.manage",
  },
  {
    name: "Store Templates",
    href: "/dashboard/templates",
    icon: Palette,
    permission: "templates.manage",
  },
  {
    name: "Categories",
    href: "/dashboard/categories",
    icon: FolderTree,
    permission: "categories.manage",
  },
  {
    name: "Reviews",
    href: "/dashboard/reviews",
    icon: Star,
    permission: "reviews.manage",
  },
  {
    name: "Support Tickets",
    href: "/dashboard/support-tickets",
    icon: MessageCircleQuestion,
    permission: "tickets.manage",
  },
  {
    name: "Transactions",
    href: "/dashboard/transactions",
    icon: ArrowLeftRight,
    permission: "analytics.view",
  },
  {
    name: "Referrals",
    href: "/dashboard/referrals",
    icon: Gift,
    permission: "payouts.manage",
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: TrendingUp,
    permission: "analytics.view",
  },
  {
    name: "Activity Logs",
    href: "/dashboard/activity-logs",
    icon: Activity,
    permission: "audit.view",
  },
];

export const bottomNavItems: NavItem[] = [
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    permission: "settings.manage",
  },
  {
    name: "Help & Docs",
    href: "/dashboard/help",
    icon: HelpCircle,
  },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [pendingKycCount, setPendingKycCount] = useState(0);
  const [unreadTicketCount, setUnreadTicketCount] = useState(0);
  const [pendingPayoutsCount, setPendingPayoutsCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchBadges = async () => {
      try {
        const [ticketUnread, kycRes, payoutsRes] = await Promise.allSettled([
          adminTicketsService.getUnreadCount(),
          adminKycService.list({ status: "pending", limit: 1 }),
          adminPayoutsService.list({ status: "pending", limit: 1 }),
        ]);

        if (!cancelled) {
          if (ticketUnread.status === "fulfilled") {
            setUnreadTicketCount(ticketUnread.value);
          }
          if (kycRes.status === "fulfilled") {
            setPendingKycCount(kycRes.value?.total ?? 0);
          }
          if (payoutsRes.status === "fulfilled") {
            setPendingPayoutsCount(payoutsRes.value?.total ?? 0);
          }
        }
      } catch {
        // Badges are non-critical
      }
    };

    void fetchBadges();
    const interval = setInterval(() => void fetchBadges(), 45000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    router.replace("/login");
  };

  const adminRole = (authService.getUser()?.adminRole ||
    "super_admin") as AdminRole;
  const visibleNavItems = navItems.filter(
    (item) => !item.permission || hasPermission(adminRole, item.permission),
  );
  const visibleBottomNavItems = bottomNavItems.filter(
    (item) => !item.permission || hasPermission(adminRole, item.permission),
  );

  const isActiveRoute = (href: string) => {
    if (href === "/dashboard/overview") {
      return pathname === "/dashboard" || pathname === "/dashboard/overview";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 overflow-y-auto transition-transform duration-300 ease-in-out md:translate-x-0 ${
        isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:shadow-none"
      }`}
    >
      <div className="flex flex-col justify-between min-h-full p-5">
        {/* Header & Navigation */}
        <div className="space-y-6">
          {/* Logo & Mobile Close Button */}
          <div className="flex items-center justify-between pt-1">
            <Link href="/dashboard/overview" onClick={onClose}>
              <HustlrLogo />
            </Link>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 md:hidden transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Main Navigation Links */}
          <nav className="space-y-1">
            {visibleNavItems.map((item) => {
              const active = isActiveRoute(item.href);
              const Icon = item.icon;
              let badgeCount = 0;
              if (item.name.includes("KYC")) badgeCount = pendingKycCount;
              if (item.name.includes("Tickets")) badgeCount = unreadTicketCount;
              if (item.name.includes("Payouts"))
                badgeCount = pendingPayoutsCount;
              const showBadge = badgeCount > 0;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3.5 px-4 py-2.5 rounded-full font-medium text-sm transition-all duration-200 ${
                    active
                      ? "bg-primary text-white shadow-sm font-semibold"
                      : "text-gray-600 hover:text-primary hover:bg-primary-bg"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 stroke-[2.2] ${
                      active ? "text-white" : "text-gray-400"
                    }`}
                  />
                  <span className="flex-1 truncate">{item.name}</span>
                  {showBadge && (
                    <span
                      className={`inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10px] font-bold leading-none ${
                        active
                          ? "bg-white text-primary"
                          : "bg-primary text-white"
                      }`}
                    >
                      {badgeCount > 99 ? "99+" : badgeCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Nav Links & Logout */}
        <div className="space-y-1 pt-4 mt-6 border-t border-gray-100">
          {visibleBottomNavItems.map((item) => {
            const active = isActiveRoute(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3.5 px-4 py-2.5 rounded-full font-medium text-sm transition-all duration-200 ${
                  active
                    ? "bg-primary text-white shadow-sm font-semibold"
                    : "text-gray-500 hover:text-primary hover:bg-primary-bg"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 stroke-[2.2] ${
                    active ? "text-white" : "text-gray-400"
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}

          {/* Working Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-full font-medium text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 cursor-pointer text-left"
          >
            <LogOut className="w-4 h-4 shrink-0 text-gray-400 stroke-[2.2]" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
