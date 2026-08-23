export type AdminRole = "super_admin" | "support" | "finance" | "operations" | "risk";

export type AdminPermission =
  | "stores.view"
  | "stores.manage"
  | "users.view"
  | "users.ban"
  | "kyc.review"
  | "orders.view"
  | "payouts.manage"
  | "disputes.manage"
  | "tickets.manage"
  | "plans.manage"
  | "templates.manage"
  | "categories.manage"
  | "reviews.manage"
  | "analytics.view"
  | "audit.view"
  | "settings.manage";

const ROLE_PERMS: Record<AdminRole, AdminPermission[] | "*"> = {
  super_admin: "*",
  support: [
    "stores.view",
    "users.view",
    "orders.view",
    "tickets.manage",
    "disputes.manage",
    "reviews.manage",
    "analytics.view",
  ],
  finance: [
    "orders.view",
    "payouts.manage",
    "disputes.manage",
    "analytics.view",
  ],
  operations: [
    "stores.view",
    "stores.manage",
    "plans.manage",
    "templates.manage",
    "categories.manage",
    "analytics.view",
  ],
  risk: [
    "users.view",
    "users.ban",
    "kyc.review",
    "disputes.manage",
    "reviews.manage",
    "audit.view",
    "analytics.view",
  ],
};

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  support: "Support Specialist",
  finance: "Finance Manager",
  operations: "Operations Lead",
  risk: "Trust & Risk Specialist",
};

export function hasPermission(
  role: AdminRole | undefined | null,
  permission: AdminPermission,
): boolean {
  const resolved: AdminRole = role || "super_admin";
  const granted = ROLE_PERMS[resolved];
  if (!granted) return true;
  if (granted === "*") return true;
  return granted.includes(permission);
}

export const ROUTE_PERMISSIONS: Array<{ prefix: string; permission?: AdminPermission }> = [
  { prefix: "/dashboard/users", permission: "users.view" },
  { prefix: "/dashboard/stores", permission: "stores.view" },
  { prefix: "/dashboard/kyc", permission: "kyc.review" },
  { prefix: "/dashboard/orders", permission: "orders.view" },
  { prefix: "/dashboard/payouts", permission: "payouts.manage" },
  { prefix: "/dashboard/dispute", permission: "disputes.manage" },
  { prefix: "/dashboard/support-tickets", permission: "tickets.manage" },
  { prefix: "/dashboard/plans", permission: "plans.manage" },
  { prefix: "/dashboard/templates", permission: "templates.manage" },
  { prefix: "/dashboard/categories", permission: "categories.manage" },
  { prefix: "/dashboard/reviews", permission: "reviews.manage" },
  { prefix: "/dashboard/transactions", permission: "analytics.view" },
  { prefix: "/dashboard/referrals", permission: "payouts.manage" },
  { prefix: "/dashboard/analytics", permission: "analytics.view" },
  { prefix: "/dashboard/activity-logs", permission: "audit.view" },
  { prefix: "/dashboard/settings", permission: "settings.manage" },
  { prefix: "/dashboard/help" },
  { prefix: "/dashboard/overview" },
  { prefix: "/dashboard" },
];

export function permissionForPath(pathname: string): AdminPermission | undefined {
  const match = ROUTE_PERMISSIONS.find(
    (r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`),
  );
  return match?.permission;
}

export function canAccessPath(
  role: AdminRole | undefined | null,
  pathname: string,
): boolean {
  const permission = permissionForPath(pathname);
  if (!permission) return true;
  return hasPermission(role, permission);
}
