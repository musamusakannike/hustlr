import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Store,
  Palette,
  Package,
  FolderTree,
  ShieldCheck,
  CreditCard,
  ShoppingBag,
  Wallet,
  MessageSquareWarning,
  Star,
  TicketPercent,
  BarChart3,
  Newspaper,
  Gift,
  Bell,
  LifeBuoy,
  Globe,
  Settings,
} from "lucide-react";

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  entitlement?: "allowBlog" | "allowCustomDomain";
}

export interface DashboardNavGroup {
  id: string;
  label: string;
  items: DashboardNavItem[];
}

export const DASHBOARD_NAV_GROUPS: DashboardNavGroup[] = [
  {
    id: "store",
    label: "Store",
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/dashboard/setup", label: "Store Setup", icon: Store },
      { href: "/dashboard/templates", label: "Templates", icon: Palette },
      { href: "/dashboard/kyc", label: "KYC Verification", icon: ShieldCheck },
    ],
  },
  {
    id: "catalog",
    label: "Catalog",
    items: [
      { href: "/dashboard/products", label: "Products", icon: Package },
      { href: "/dashboard/categories", label: "Categories", icon: FolderTree },
    ],
  },
  {
    id: "commerce",
    label: "Commerce",
    items: [
      { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
      { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
      { href: "/dashboard/disputes", label: "Disputes", icon: MessageSquareWarning },
      { href: "/dashboard/reviews", label: "Reviews", icon: Star },
      { href: "/dashboard/coupons", label: "Coupons", icon: TicketPercent },
    ],
  },
  {
    id: "growth",
    label: "Growth",
    items: [
      { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/dashboard/blog", label: "Blog", icon: Newspaper, entitlement: "allowBlog" },
      { href: "/dashboard/referrals", label: "Referrals", icon: Gift },
    ],
  },
  {
    id: "account",
    label: "Account",
    items: [
      { href: "/dashboard/billing", label: "Billing & Plan", icon: CreditCard },
      { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
      { href: "/dashboard/support", label: "Support", icon: LifeBuoy },
      { href: "/dashboard/settings/domain", label: "Custom Domain", icon: Globe, entitlement: "allowCustomDomain" },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ],
  },
];

export const DASHBOARD_NAV: DashboardNavItem[] = DASHBOARD_NAV_GROUPS.flatMap(
  (group) => group.items
);

export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  if (pathname === href) return true;
  if (!pathname.startsWith(`${href}/`)) return false;
  const moreSpecific = DASHBOARD_NAV.some(
    (item) =>
      item.href !== href &&
      item.href.startsWith(`${href}/`) &&
      (pathname === item.href || pathname.startsWith(`${item.href}/`))
  );
  return !moreSpecific;
}

export function currentNavItem(pathname: string): DashboardNavItem {
  const matches = DASHBOARD_NAV.filter((item) => isNavActive(pathname, item.href));
  return (
    matches.sort((a, b) => b.href.length - a.href.length)[0] ?? DASHBOARD_NAV[0]
  );
}
