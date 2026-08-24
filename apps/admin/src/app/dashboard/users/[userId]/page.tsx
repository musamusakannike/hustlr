"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Ban,
  RotateCcw,
  Shield,
  Mail,
  Store,
  IdCard,
  Wallet,
  Package,
  Crown,
  XCircle,
  BadgeCheck,
  Calendar,
  ExternalLink,
  ShieldCheck,
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

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function roleBadgeClasses(role: string) {
  if (role === "admin") return "bg-primary-bg text-primary";
  if (role === "seller") return "bg-indigo-50 text-indigo-600";
  return "bg-sky-50 text-sky-600";
}

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();

  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const [banOpen, setBanOpen] = useState(false);
  const [unbanOpen, setUnbanOpen] = useState(false);
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const canBan = hasPermission(authService.getUser()?.adminRole, "users.ban");
  const isSuperAdmin =
    (authService.getUser()?.adminRole || "super_admin") === "super_admin";

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

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
      showFeedback(`${user?.name ?? "User"} has been banned.`);
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
      showFeedback(`${user?.name ?? "User"} has been unbanned.`);
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
      showFeedback(`${user?.name ?? "User"} has been promoted to Admin.`);
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
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        <p className="text-xs sm:text-sm text-gray-400 font-normal">
          Loading user details...
        </p>
      </div>
    );
  }

  if (error || !detail || !user) {
    return (
      <div className="bg-bg-soft rounded-2xl border border-gray-100/80 p-12 text-center shadow-2xs">
        <XCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <h2 className="mt-4 text-base font-bold text-slate-800">
          {error || "User not found"}
        </h2>
        <button
          onClick={() => router.push("/dashboard/users")}
          className="mt-5 px-4 py-2.5 rounded-xl bg-white border border-gray-200 hover:border-primary hover:bg-primary-bg/50 text-slate-700 font-semibold text-xs shadow-2xs transition-all inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Users
        </button>
      </div>
    );
  }

  const infoRows = [
    {
      label: "Email",
      value: user.email,
      icon: <Mail className="w-4 h-4 text-gray-400" />,
    },
    {
      label: "Role",
      value: (
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${roleBadgeClasses(user.role)}`}
        >
          {user.role}
        </span>
      ),
      icon: <Shield className="w-4 h-4 text-gray-400" />,
    },
    {
      label: "Verification Status",
      value: (
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
            user.isVerified
              ? "bg-emerald-50 text-emerald-600"
              : "bg-gray-100 text-gray-400"
          }`}
        >
          {user.isVerified ? "Verified" : "Unverified"}
        </span>
      ),
      icon: <BadgeCheck className="w-4 h-4 text-gray-400" />,
    },
    {
      label: "Referral Code",
      value: user.referralCode || "—",
      icon: <Crown className="w-4 h-4 text-gray-400" />,
    },
    {
      label: "Joined",
      value: formatDate(user.createdAt),
      icon: <Calendar className="w-4 h-4 text-gray-400" />,
    },
    ...(user.bannedAt
      ? [
          {
            label: "Banned At",
            value: formatDate(user.bannedAt),
            icon: <Ban className="w-4 h-4 text-rose-500" />,
          },
        ]
      : []),
  ];

  const overviewCards = [
    {
      label: "Store",
      value: detail.store?.name ?? "No store yet",
      sub: detail.store ? `/${detail.store.slug}` : undefined,
      icon: Store,
    },
    {
      label: "KYC Status",
      value: detail.kyc ? detail.kyc.status.replace("_", " ") : "Not submitted",
      icon: IdCard,
    },
    {
      label: "Wallet Balance",
      value: formatMoney(detail.wallet?.balance),
      icon: Wallet,
    },
    {
      label: "Total Orders",
      value: String(detail.orderCount),
      icon: Package,
    },
    {
      label: "Subscription",
      value: detail.subscription
        ? `${detail.subscription.planName} (${detail.subscription.billingCycle})`
        : "Free / None",
      sub: detail.subscription ? detail.subscription.status : undefined,
      icon: Crown,
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {actionLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard/users")}
            title="Back to users"
            className="p-2 rounded-xl bg-white border border-gray-200 hover:border-primary hover:bg-primary-bg/50 text-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={44}
                  height={44}
                  unoptimized
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-bold text-gray-400">
                  {user.name?.charAt(0)?.toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
                  {user.name}
                </h1>
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${roleBadgeClasses(
                    user.role,
                  )}`}
                >
                  {user.role}
                </span>
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    user.banned
                      ? "bg-rose-50 text-rose-600"
                      : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  {user.banned ? "Banned" : "Active"}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-normal mt-0.5">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {canBan && !user.banned && user.role !== "admin" && (
            <button
              onClick={() => setBanOpen(true)}
              className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs shadow-2xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Ban User</span>
            </button>
          )}
          {canBan && user.banned && (
            <button
              onClick={() => setUnbanOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs shadow-2xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Unban User</span>
            </button>
          )}
          {isSuperAdmin && user.role === "seller" && (
            <button
              onClick={() => setPromoteOpen(true)}
              className="px-4 py-2 rounded-xl bg-white border border-gray-200 hover:border-primary hover:bg-primary-bg/50 text-primary font-semibold text-xs shadow-2xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Make Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold text-center">
          {feedbackMessage}
        </div>
      )}

      {/* Error Banner */}
      {actionError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold text-center">
          {actionError}
        </div>
      )}

      {user.banned && user.banReason && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 flex items-start gap-2">
          <Ban className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Ban reason: </span>
            {user.banReason}
          </div>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {overviewCards.map((card) => (
          <div
            key={card.label}
            className="bg-bg-soft p-4 sm:p-5 rounded-2xl border border-gray-100/80 shadow-2xs"
          >
            <card.icon className="w-4 h-4 text-primary mb-2" />
            <p className="text-base sm:text-lg font-bold text-slate-800 capitalize truncate">
              {card.value}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
            {card.sub && (
              <span className="inline-block text-[11px] text-gray-400 font-medium capitalize mt-1">
                {card.sub}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Account Information */}
        <section className="bg-bg-soft rounded-2xl border border-gray-100/80 shadow-2xs overflow-hidden">
          <div className="border-b border-gray-100/80 px-5 py-4 bg-gray-50/50">
            <h2 className="text-sm font-bold text-slate-800">
              Account Information
            </h2>
          </div>
          <dl className="divide-y divide-gray-100/60 bg-white">
            {infoRows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between px-5 py-3.5 text-xs sm:text-sm"
              >
                <dt className="text-gray-500 font-medium flex items-center gap-2">
                  {row.icon}
                  {row.label}
                </dt>
                <dd className="font-semibold text-slate-800 text-right max-w-[60%] truncate">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Store details */}
        <section className="bg-bg-soft rounded-2xl border border-gray-100/80 shadow-2xs overflow-hidden">
          <div className="border-b border-gray-100/80 px-5 py-4 flex items-center justify-between bg-gray-50/50">
            <h2 className="text-sm font-bold text-slate-800">Store Details</h2>
            {detail.store && (
              <button
                onClick={() =>
                  router.push(`/dashboard/stores/${detail.store!._id}`)
                }
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                Open in Stores
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
          {detail.store ? (
            <dl className="divide-y divide-gray-100/60 bg-white">
              {[
                { label: "Name", value: detail.store.name },
                { label: "Slug", value: `/${detail.store.slug}` },
                {
                  label: "Live Status",
                  value: (
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        detail.store.isLive
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {detail.store.isLive ? "Live" : "Offline"}
                    </span>
                  ),
                },
                {
                  label: "Custom Domain",
                  value: detail.store.customDomain || "—",
                },
                {
                  label: "Created",
                  value: formatDate(detail.store.createdAt),
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between px-5 py-3.5 text-xs sm:text-sm"
                >
                  <dt className="text-gray-500 font-medium">{row.label}</dt>
                  <dd className="font-semibold text-slate-800">{row.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <div className="px-5 py-12 text-center text-xs text-gray-400 bg-white">
              This user has not created a store.
            </div>
          )}
        </section>
      </div>

      {/* KYC Summary */}
      {detail.kyc && (
        <section className="bg-bg-soft rounded-2xl border border-gray-100/80 shadow-2xs overflow-hidden">
          <div className="border-b border-gray-100/80 px-5 py-4 flex items-center justify-between bg-gray-50/50">
            <h2 className="text-sm font-bold text-slate-800">
              KYC Verification Submission
            </h2>
            <button
              onClick={() => router.push(`/dashboard/kyc`)}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              Review in KYC
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <dl className="divide-y divide-gray-100/60 bg-white">
            {[
              { label: "Document Type", value: detail.kyc.idType || "—" },
              { label: "ID Number", value: detail.kyc.idNumber || "—" },
              {
                label: "Status",
                value: (
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      detail.kyc.status === "approved"
                        ? "bg-emerald-50 text-emerald-600"
                        : detail.kyc.status === "rejected"
                          ? "bg-rose-50 text-rose-600"
                          : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {detail.kyc.status.replace("_", " ")}
                  </span>
                ),
              },
              {
                label: "Submitted",
                value: formatDate(detail.kyc.createdAt),
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between px-5 py-3.5 text-xs sm:text-sm"
              >
                <dt className="text-gray-500 font-medium">{row.label}</dt>
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
        description={`${user.name} will regain access to their account immediately.`}
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
