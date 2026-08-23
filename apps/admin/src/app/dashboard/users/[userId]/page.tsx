"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Ban,
  RotateCcw,
  Shield,
  Mail,
  Store,
  IdCard,
  Wallet,
  Package,
  Crown,
  CheckCircle,
  XCircle,
  XCircle as UnverifiedIcon,
} from "lucide-react";
import {
  adminUsersService,
  authService,
  type AdminUserDetail,
} from "@/lib/api";
import { hasPermission } from "@/lib/permissions";
import BanUserDialog from "@/components/BanUserDialog";
import ConfirmDialog from "@/components/ConfirmDialog";

function formatMoney(amount?: number | null) {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();

  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [banOpen, setBanOpen] = useState(false);
  const [unbanOpen, setUnbanOpen] = useState(false);
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const canBan = hasPermission(authService.getUser()?.adminRole, "users.ban");
  const isSuperAdmin =
    (authService.getUser()?.adminRole || "super_admin") === "super_admin";

  const fetchDetail = useCallback(async () => {
    const res = await adminUsersService.getById(String(userId));
    setDetail(res);
    setError("");
    return res;
  }, [userId]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await adminUsersService.getById(String(userId));
        if (!mounted) return;
        setDetail(res);
        setError("");
      } catch (e) {
        if (mounted)
          setError(e instanceof Error ? e.message : "Failed to load user.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const user = detail?.user;

  const handleBan = async (reason: string) => {
    setActionLoading(true);
    setActionError("");
    try {
      await adminUsersService.ban(String(userId), reason);
      setBanOpen(false);
      await fetchDetail();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to ban user.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnban = async () => {
    setActionLoading(true);
    setActionError("");
    try {
      await adminUsersService.unban(String(userId));
      setUnbanOpen(false);
      await fetchDetail();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to unban user.");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePromote = async () => {
    setActionLoading(true);
    setActionError("");
    try {
      await adminUsersService.promoteAdmin(String(userId));
      setPromoteOpen(false);
      await fetchDetail();
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : "Failed to promote user.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <p className="ml-3 text-sm text-gray-500 font-medium">Loading user...</p>
      </div>
    );
  }

  if (error || !detail || !user) {
    return (
      <div className="bg-white rounded-3xl border border-gray-200/70 p-12 text-center shadow-xs">
        <XCircle className="w-10 h-10 text-red-400 mx-auto" />
        <h2 className="mt-4 text-lg font-bold text-slate-800">
          {error || "User not found"}
        </h2>
        <button
          onClick={() => router.push("/dashboard/users")}
          className="mt-6 px-5 py-2.5 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary-hover transition-colors"
        >
          Back to Users
        </button>
      </div>
    );
  }

  const infoRows = [
    { label: "Email", value: user.email, icon: <Mail className="w-4 h-4" /> },
    {
      label: "Role",
      value: user.role,
      icon: <Shield className="w-4 h-4" />,
    },
    {
      label: "Referral Code",
      value: user.referralCode,
      icon: <Crown className="w-4 h-4" />,
    },
    {
      label: "Joined",
      value: new Date(user.createdAt).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      icon: null,
    },
    ...(user.bannedAt
      ? [
          {
            label: "Banned At",
            value: new Date(user.bannedAt).toLocaleString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            icon: <Ban className="w-4 h-4" />,
          },
        ]
      : []),
  ];

  const overviewCards = [
    {
      label: "Store",
      value: detail.store?.name ?? "No store yet",
      sub: detail.store ? `/${detail.store.slug}` : undefined,
      icon: <Store className="w-5 h-5" />,
      tone: "bg-blue-50 text-blue-700",
    },
    {
      label: "KYC Status",
      value: detail.kyc ? detail.kyc.status.replace("_", " ") : "Not submitted",
      icon: <IdCard className="w-5 h-5" />,
      tone:
        detail.kyc?.status === "approved"
          ? "bg-emerald-50 text-emerald-700"
          : detail.kyc?.status === "rejected"
            ? "bg-red-50 text-red-700"
            : "bg-amber-50 text-amber-700",
    },
    {
      label: "Wallet Balance",
      value: formatMoney(detail.wallet?.balance),
      icon: <Wallet className="w-5 h-5" />,
      tone: "bg-violet-50 text-violet-700",
    },
    {
      label: "Orders",
      value: String(detail.orderCount),
      icon: <Package className="w-5 h-5" />,
      tone: "bg-cyan-50 text-cyan-700",
    },
    {
      label: "Subscription",
      value: detail.subscription
        ? `${detail.subscription.planName} (${detail.subscription.billingCycle})`
        : "None",
      sub: detail.subscription ? detail.subscription.status : undefined,
      icon: <Crown className="w-5 h-5" />,
      tone: "bg-amber-50 text-amber-700",
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <button
            onClick={() => router.push("/dashboard/users")}
            title="Back to users"
            className="mt-1 p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-extrabold text-[#0A0E11] tracking-tight">
                {user.name}
              </h1>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                  user.role === "admin"
                    ? "bg-primary-bg text-primary"
                    : "bg-blue-50 text-blue-700"
                }`}
              >
                {user.role}
              </span>
              <span
                className={`inline-block px-3 py-0.5 rounded-full text-[11px] font-bold ${
                  user.banned
                    ? "bg-red-50 text-red-700"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {user.banned ? "Banned" : "Active"}
              </span>
            </div>
            <p className="text-sm text-gray-500 font-medium mt-1 flex items-center gap-1.5">
              {user.isVerified ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Email verified
                </>
              ) : (
                <>
                  <UnverifiedIcon className="w-3.5 h-3.5 text-gray-400" />
                  Not verified
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canBan && !user.banned && user.role !== "admin" && (
            <button
              onClick={() => setBanOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-red-600 text-white text-sm font-bold shadow-sm hover:bg-red-700 transition-colors"
            >
              <Ban className="w-4 h-4" />
              Ban User
            </button>
          )}
          {canBan && user.banned && (
            <button
              onClick={() => setUnbanOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-600 text-white text-sm font-bold shadow-sm hover:bg-emerald-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Unban User
            </button>
          )}
          {isSuperAdmin && user.role === "seller" && (
            <button
              onClick={() => setPromoteOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary-hover transition-colors"
            >
              <Shield className="w-4 h-4" />
              Promote to Admin
            </button>
          )}
        </div>
      </div>

      {user.banned && user.banReason && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 text-sm font-medium px-4 py-3 rounded-2xl">
          <Ban className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            <strong>Ban reason:</strong> {user.banReason}
          </span>
        </div>
      )}

      {actionError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 text-sm font-medium px-4 py-3 rounded-2xl">
          <XCircle className="w-4 h-4 shrink-0" />
          {actionError}
        </div>
      )}

      {/* Overview cards */}
      <div className="grid gap-4 grid-cols-2 xl:grid-cols-5">
        {overviewCards.map((card) => (
          <article
            key={card.label}
            className="bg-white p-5 rounded-2xl border border-gray-200/70 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                {card.label}
              </p>
              <span className={`p-2 rounded-xl ${card.tone}`}>{card.icon}</span>
            </div>
            <strong className="mt-3 block text-sm font-extrabold text-slate-900 capitalize break-words">
              {card.value}
            </strong>
            {card.sub && (
              <span className="mt-0.5 block text-[11px] text-gray-400 font-medium capitalize">
                {card.sub}
              </span>
            )}
          </article>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* Account information */}
        <section className="bg-white rounded-3xl border border-gray-200/70 shadow-xs overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-base font-bold text-slate-800">
              Account Information
            </h2>
          </div>
          <dl className="divide-y divide-gray-100">
            {infoRows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between px-6 py-4 text-xs sm:text-sm"
              >
                <dt className="text-gray-500 font-semibold flex items-center gap-2">
                  {row.icon}
                  {row.label}
                </dt>
                <dd className="font-semibold text-slate-800 text-right max-w-[60%] break-words">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Store details */}
        <section className="bg-white rounded-3xl border border-gray-200/70 shadow-xs overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">Store Details</h2>
            {detail.store && (
              <button
                onClick={() =>
                  router.push(`/dashboard/stores/${detail.store!._id}`)
                }
                className="text-xs font-bold text-primary hover:underline"
              >
                Open in Stores →
              </button>
            )}
          </div>
          {detail.store ? (
            <dl className="divide-y divide-gray-100">
              {[
                { label: "Name", value: detail.store.name },
                { label: "Slug", value: `/${detail.store.slug}` },
                {
                  label: "Live Status",
                  value: detail.store.isLive ? "Live" : "Offline",
                },
                {
                  label: "Custom Domain",
                  value: detail.store.customDomain || "—",
                },
                {
                  label: "Created",
                  value: new Date(detail.store.createdAt).toLocaleDateString(
                    "en-GB",
                    { day: "numeric", month: "short", year: "numeric" },
                  ),
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between px-6 py-4 text-xs sm:text-sm"
                >
                  <dt className="text-gray-500 font-semibold">{row.label}</dt>
                  <dd className="font-semibold text-slate-800">{row.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="px-6 py-12 text-center text-sm text-gray-400">
              This user has not created a store.
            </p>
          )}
        </section>
      </div>

      {/* KYC summary */}
      {detail.kyc && (
        <section className="bg-white rounded-3xl border border-gray-200/70 shadow-xs overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">
              KYC Submission
            </h2>
            <button
              onClick={() => router.push(`/dashboard/kyc`)}
              className="text-xs font-bold text-primary hover:underline"
            >
              Review in KYC →
            </button>
          </div>
          <dl className="divide-y divide-gray-100">
            {[
              { label: "Document Type", value: detail.kyc.idType || "—" },
              { label: "ID Number", value: detail.kyc.idNumber || "—" },
              {
                label: "Status",
                value: detail.kyc.status.replace("_", " "),
              },
              {
                label: "Submitted",
                value: new Date(detail.kyc.createdAt).toLocaleDateString(
                  "en-GB",
                  { day: "numeric", month: "short", year: "numeric" },
                ),
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between px-6 py-4 text-xs sm:text-sm"
              >
                <dt className="text-gray-500 font-semibold">{row.label}</dt>
                <dd className="font-semibold text-slate-800 capitalize">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Dialogs */}
      <BanUserDialog
        isOpen={banOpen}
        onClose={() => setBanOpen(false)}
        onConfirm={handleBan}
        userName={user.name}
        isLoading={actionLoading}
      />

      <ConfirmDialog
        isOpen={unbanOpen}
        onClose={() => setUnbanOpen(false)}
        onConfirm={handleUnban}
        title="Unban user"
        description={`${user.name} will regain access and their store will be re-evaluated for going live.`}
        confirmLabel="Unban"
        isLoading={actionLoading}
      />

      <ConfirmDialog
        isOpen={promoteOpen}
        onClose={() => setPromoteOpen(false)}
        onConfirm={handlePromote}
        title="Promote to admin"
        description={`${user.name} will gain full platform administrator access. This cannot be undone from this panel.`}
        confirmLabel="Promote"
        isLoading={actionLoading}
      />
    </div>
  );
}
