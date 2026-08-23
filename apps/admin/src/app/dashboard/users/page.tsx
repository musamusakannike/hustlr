"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Shield,
  Ban,
  CheckCircle,
  Search,
  Loader2,
  Download,
  Eye,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  XCircle,
} from "lucide-react";
import {
  adminUsersService,
  type AdminUserItem,
  type AdminUserStats,
} from "@/lib/api";
import { authService } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";
import BanUserDialog from "@/components/BanUserDialog";
import ConfirmDialog from "@/components/ConfirmDialog";

const PAGE_SIZE = 10;

export default function UsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [stats, setStats] = useState<AdminUserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [bannedFilter, setBannedFilter] = useState("");
  const [page, setPage] = useState(1);

  const [banTarget, setBanTarget] = useState<AdminUserItem | null>(null);
  const [unbanTarget, setUnbanTarget] = useState<AdminUserItem | null>(null);
  const [promoteTarget, setPromoteTarget] = useState<AdminUserItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const canBan = hasPermission(authService.getUser()?.adminRole, "users.ban");
  const isSuperAdmin =
    (authService.getUser()?.adminRole || "super_admin") === "super_admin";

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchUsers = useCallback(async () => {
    const params: Record<string, unknown> = { page, limit: PAGE_SIZE };
    if (search) params.search = search;
    if (roleFilter) params.role = roleFilter;
    if (bannedFilter) params.banned = bannedFilter;
    const res = await adminUsersService.list(params);
    setUsers(res.items ?? []);
    if (res.meta) {
      setMeta({
        page: res.meta.page,
        totalPages: res.meta.totalPages,
        total: res.meta.total,
      });
    }
    setError("");
  }, [page, search, roleFilter, bannedFilter]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const params: Record<string, unknown> = { page, limit: PAGE_SIZE };
        if (search) params.search = search;
        if (roleFilter) params.role = roleFilter;
        if (bannedFilter) params.banned = bannedFilter;
        const res = await adminUsersService.list(params);
        if (!mounted) return;
        setUsers(res.items ?? []);
        if (res.meta) {
          setMeta({
            page: res.meta.page,
            totalPages: res.meta.totalPages,
            total: res.meta.total,
          });
        }
        setError("");
      } catch (e) {
        if (mounted)
          setError(e instanceof Error ? e.message : "Failed to load users.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [page, search, roleFilter, bannedFilter]);

  useEffect(() => {
    adminUsersService
      .getStats()
      .then(setStats)
      .catch(() => {});
  }, []);

  const handleBan = async (reason: string) => {
    if (!banTarget) return;
    setActionLoading(true);
    setActionError("");
    try {
      await adminUsersService.ban(banTarget._id, reason);
      setBanTarget(null);
      fetchUsers();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to ban user.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnban = async () => {
    if (!unbanTarget) return;
    setActionLoading(true);
    setActionError("");
    try {
      await adminUsersService.unban(unbanTarget._id);
      setUnbanTarget(null);
      fetchUsers();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to unban user.");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePromote = async () => {
    if (!promoteTarget) return;
    setActionLoading(true);
    setActionError("");
    try {
      await adminUsersService.promoteAdmin(promoteTarget._id);
      setPromoteTarget(null);
      fetchUsers();
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : "Failed to promote user.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      await adminUsersService.exportCsv();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed.");
    }
  };

  const statCards = [
    {
      label: "Sellers",
      value: stats?.totalSellers ?? "—",
      icon: <Users className="w-5 h-5" />,
      tone: "bg-blue-50 text-blue-700",
    },
    {
      label: "Admins",
      value: stats?.totalAdmins ?? "—",
      icon: <Shield className="w-5 h-5" />,
      tone: "bg-primary-bg text-primary",
    },
    {
      label: "New This Week",
      value: stats?.newThisWeek ?? "—",
      icon: <CheckCircle className="w-5 h-5" />,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "New This Month",
      value: stats?.newThisMonth ?? "—",
      icon: <Download className="w-5 h-5" />,
      tone: "bg-amber-50 text-amber-700",
    },
  ];

  const activeFilters =
    Boolean(search) || Boolean(roleFilter) || Boolean(bannedFilter);

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0A0E11] tracking-tight">
            Users & Merchants
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Manage sellers and platform admin team members.
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary-hover transition-colors disabled:opacity-60"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
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
            <strong className="mt-3 block text-2xl font-extrabold text-slate-900">
              {card.value}
            </strong>
          </article>
        ))}
      </div>

      {actionError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 text-sm font-medium px-4 py-3 rounded-2xl">
          <XCircle className="w-4 h-4 shrink-0" />
          {actionError}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/70 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="bg-gray-50 border border-gray-200 text-xs sm:text-sm font-semibold rounded-xl px-3 py-2 outline-none text-slate-700"
          >
            <option value="">All Roles</option>
            <option value="seller">Sellers</option>
            <option value="admin">Admins</option>
          </select>
          <select
            value={bannedFilter}
            onChange={(e) => {
              setBannedFilter(e.target.value);
              setPage(1);
            }}
            className="bg-gray-50 border border-gray-200 text-xs sm:text-sm font-semibold rounded-xl px-3 py-2 outline-none text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="false">Active</option>
            <option value="true">Banned</option>
          </select>
          {activeFilters && (
            <button
              title="Clear filters"
              onClick={() => {
                setSearchInput("");
                setSearch("");
                setRoleFilter("");
                setBannedFilter("");
                setPage(1);
              }}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-slate-600 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-200/70 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-primary-bg border-b border-gray-200 text-primary font-bold">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Verification</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                    <p className="mt-2 text-xs">Loading users...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-red-500 text-xs font-medium">
                    {error}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-1">
                        {user.name}
                        {user.isVerified && (
                          <span title="Verified account">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-400 font-normal">
                        {user.email}
                      </div>
                      {user.banned && user.banReason && (
                        <div className="mt-1 text-[11px] text-red-500 font-normal italic">
                          Reason: {user.banReason}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          user.role === "admin"
                            ? "bg-primary-bg text-primary"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {user.role === "admin" && <Shield className="w-3 h-3" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.isVerified ? (
                        <span className="text-xs font-semibold text-emerald-700">
                          Verified
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-gray-400">
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${
                          user.banned
                            ? "bg-red-50 text-red-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {user.banned ? "Banned" : "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          title="View details"
                          onClick={() => router.push(`/dashboard/users/${user._id}`)}
                          className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-slate-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canBan && !user.banned && user.role !== "admin" && (
                          <button
                            title="Ban User"
                            onClick={() => setBanTarget(user)}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                        {canBan && user.banned && (
                          <button
                            title="Unban User"
                            onClick={() => setUnbanTarget(user)}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                        {isSuperAdmin && user.role === "seller" && (
                          <button
                            title="Promote to Admin"
                            onClick={() => setPromoteTarget(user)}
                            className="p-1.5 rounded-lg bg-primary-bg hover:bg-[#f3d9de] text-primary transition-colors"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && users.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white">
            <p className="text-xs text-gray-500 font-medium">
              Page {meta.page} of {meta.totalPages}
              {meta.total > 0 && ` · ${meta.total} users`}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!meta || meta.page <= 1 || loading}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!meta || meta.page >= meta.totalPages || loading}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <BanUserDialog
        isOpen={Boolean(banTarget)}
        onClose={() => setBanTarget(null)}
        onConfirm={handleBan}
        userName={banTarget?.name ?? ""}
        isLoading={actionLoading}
      />

      <ConfirmDialog
        isOpen={Boolean(unbanTarget)}
        onClose={() => setUnbanTarget(null)}
        onConfirm={handleUnban}
        title="Unban user"
        description={`${unbanTarget?.name ?? "This user"} will regain access and their store will be re-evaluated for going live.`}
        confirmLabel="Unban"
        isLoading={actionLoading}
      />

      <ConfirmDialog
        isOpen={Boolean(promoteTarget)}
        onClose={() => setPromoteTarget(null)}
        onConfirm={handlePromote}
        title="Promote to admin"
        description={`${promoteTarget?.name ?? "This user"} will gain full platform administrator access. This cannot be undone from this panel.`}
        confirmLabel="Promote"
        isLoading={actionLoading}
      />
    </div>
  );
}
