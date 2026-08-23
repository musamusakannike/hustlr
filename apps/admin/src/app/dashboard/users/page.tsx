"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Users as UsersIcon,
  Shield,
  Ban,
  BadgeCheck,
  CheckCircle,
  Search,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  ArrowUpDown,
  MoreVertical,
  Store,
  UserCheck,
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  ExternalLink,
} from "lucide-react";
import {
  adminUsersService,
  type AdminUserItem,
  type AdminUserStats,
  type AdminUserDetail,
} from "@/lib/api";
import { authService } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";
import BanUserDialog from "@/components/BanUserDialog";
import ConfirmDialog from "@/components/ConfirmDialog";

const PAGE_SIZE = 10;

function roleBadgeClasses(role: string) {
  if (role === "admin") return "bg-primary-bg text-primary";
  if (role === "seller") return "bg-indigo-50 text-indigo-600";
  return "bg-sky-50 text-sky-600";
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function UsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [stats, setStats] = useState<AdminUserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Filters
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [bannedFilter, setBannedFilter] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  // Selection & 3-dots menus
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  // Quick Detail Modal
  const [detailUser, setDetailUser] = useState<AdminUserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Action Dialogs
  const [banTarget, setBanTarget] = useState<AdminUserItem | null>(null);
  const [unbanTarget, setUnbanTarget] = useState<AdminUserItem | null>(null);
  const [promoteTarget, setPromoteTarget] = useState<AdminUserItem | null>(null);
  const [bulkBanOpen, setBulkBanOpen] = useState(false);
  const [bulkUnbanOpen, setBulkUnbanOpen] = useState(false);
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

  // Close row menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        (menuRef.current && menuRef.current.contains(target)) ||
        (mobileMenuRef.current && mobileMenuRef.current.contains(target))
      ) {
        return;
      }
      setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const fetchUsers = useCallback(async () => {
    try {
      const params: Record<string, unknown> = { page, limit: PAGE_SIZE };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (bannedFilter) params.banned = bannedFilter;
      if (sortField) params.sortField = sortField;
      if (sortOrder) params.sortOrder = sortOrder;

      const res = await adminUsersService.list(params);
      setUsers(res.items ?? []);
      if (res.meta) {
        setMeta({
          page: res.meta.page,
          totalPages: res.meta.totalPages,
          total: res.meta.total,
        });
      }
      setSelectedIds(new Set());
      setActionError("");
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to load users.");
    }
  }, [page, search, roleFilter, bannedFilter, sortField, sortOrder]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const params: Record<string, unknown> = { page, limit: PAGE_SIZE };
        if (search) params.search = search;
        if (roleFilter) params.role = roleFilter;
        if (bannedFilter) params.banned = bannedFilter;
        if (sortField) params.sortField = sortField;
        if (sortOrder) params.sortOrder = sortOrder;

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
        setSelectedIds(new Set());
        setActionError("");
      } catch (e) {
        if (mounted)
          setActionError(e instanceof Error ? e.message : "Failed to load users.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [page, search, roleFilter, bannedFilter, sortField, sortOrder]);

  useEffect(() => {
    adminUsersService
      .getStats()
      .then(setStats)
      .catch(() => {});
  }, []);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const toggleSelectAll = () => {
    const selectableUsers = users.filter((u) => u.role !== "admin");
    if (selectedIds.size === selectableUsers.length && selectableUsers.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(selectableUsers.map((u) => u._id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleOpenDetail = async (userId: string) => {
    setOpenMenuId(null);
    setDetailLoading(true);
    try {
      const detail = await adminUsersService.getById(userId);
      setDetailUser(detail);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to load user details.");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleBan = async (reason: string) => {
    if (!banTarget) return;
    setActionLoading(true);
    setActionError("");
    try {
      await adminUsersService.ban(banTarget._id, reason);
      showFeedback(`${banTarget.name} has been banned.`);
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
      showFeedback(`${unbanTarget.name} has been unbanned.`);
      setUnbanTarget(null);
      fetchUsers();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to unban user.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkBan = async (reason: string) => {
    const count = selectedIds.size;
    setActionLoading(true);
    setActionError("");
    try {
      for (const id of Array.from(selectedIds)) {
        await adminUsersService.ban(id, reason);
      }
      showFeedback(`${count} user(s) banned.`);
      setBulkBanOpen(false);
      fetchUsers();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to ban selected users.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkUnban = async () => {
    const count = selectedIds.size;
    setActionLoading(true);
    setActionError("");
    try {
      for (const id of Array.from(selectedIds)) {
        await adminUsersService.unban(id);
      }
      showFeedback(`${count} user(s) unbanned.`);
      setBulkUnbanOpen(false);
      fetchUsers();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to unban selected users.");
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
      showFeedback(`${promoteTarget.name} has been promoted to Admin.`);
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
    setExporting(true);
    try {
      await adminUsersService.exportCsv();
      showFeedback("User export started.");
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Export failed.");
    } finally {
      setExporting(false);
    }
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setRoleFilter("");
    setBannedFilter("");
    setSortField("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  const activeFilterCount =
    (search ? 1 : 0) + (roleFilter ? 1 : 0) + (bannedFilter ? 1 : 0);

  const statCards = [
    {
      label: "Total Sellers",
      value: stats?.totalSellers ?? "—",
      icon: Store,
    },
    {
      label: "Total Admins",
      value: stats?.totalAdmins ?? "—",
      icon: ShieldCheck,
    },
    {
      label: "New This Week",
      value: stats?.newThisWeek ?? "—",
      icon: BadgeCheck,
    },
    {
      label: "New This Month",
      value: stats?.newThisMonth ?? "—",
      icon: UsersIcon,
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {(detailLoading || actionLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Manage Users</h1>
          <p className="text-xs sm:text-sm text-gray-400 font-normal mt-0.5">
            View, verify, and moderate all platform users, sellers, and administrators
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting || loading}
          className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 hover:border-primary hover:bg-primary-bg/50 text-slate-700 font-semibold text-xs shadow-2xs transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          <Download className="w-4 h-4 text-slate-600" />
          <span>{exporting ? "Exporting..." : "Export CSV"}</span>
        </button>
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

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-[#F9FAFB] p-4 sm:p-5 rounded-2xl border border-gray-100/80 shadow-2xs"
          >
            <card.icon className="w-4 h-4 text-primary mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-slate-800">{card.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            {/* Role Filter */}
            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="appearance-none bg-white border border-gray-200/80 px-3.5 py-2 pr-8 rounded-xl text-slate-700 font-medium cursor-pointer shadow-2xs outline-none focus:border-primary"
              >
                <option value="">Role: All</option>
                <option value="seller">Role: Seller</option>
                <option value="admin">Role: Admin</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={bannedFilter}
                onChange={(e) => {
                  setBannedFilter(e.target.value);
                  setPage(1);
                }}
                className="appearance-none bg-white border border-gray-200/80 px-3.5 py-2 pr-8 rounded-xl text-slate-700 font-medium cursor-pointer shadow-2xs outline-none focus:border-primary"
              >
                <option value="">Status: All</option>
                <option value="false">Status: Active</option>
                <option value="true">Status: Banned</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={`${sortField}:${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split(":");
                  setSortField(field);
                  setSortOrder(order as "asc" | "desc");
                  setPage(1);
                }}
                className="appearance-none bg-white border border-gray-200/80 px-3.5 py-2 pr-8 rounded-xl text-slate-700 font-medium cursor-pointer shadow-2xs outline-none focus:border-primary"
              >
                <option value="createdAt:desc">Newest first</option>
                <option value="createdAt:asc">Oldest first</option>
                <option value="name:asc">Name: A–Z</option>
                <option value="name:desc">Name: Z–A</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-primary transition-colors px-2 py-2"
              >
                <X className="w-3.5 h-3.5" />
                Clear filters
              </button>
            )}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by name or email"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-white border border-gray-200/80 pl-9 pr-4 py-2 rounded-xl text-xs text-slate-700 placeholder-gray-400 shadow-2xs outline-none focus:border-primary transition-all"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedIds.size > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-primary-bg/60 border border-primary-light/60 rounded-xl px-4 py-2.5">
            <p className="text-xs font-semibold text-slate-700">
              {selectedIds.size} user{selectedIds.size > 1 ? "s" : ""} selected
            </p>
            <div className="flex items-center gap-2">
              {canBan && (
                <button
                  onClick={() => setBulkBanOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs shadow-2xs transition-colors"
                >
                  Ban selected
                </button>
              )}
              {canBan && (
                <button
                  onClick={() => setBulkUnbanOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-slate-700 font-semibold text-xs shadow-2xs transition-colors"
                >
                  Unban selected
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ==================== DESKTOP TABLE ==================== */}
      <div className="hidden md:block bg-[#F9FAFB] rounded-2xl border border-gray-100/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="text-gray-400 font-semibold border-b border-gray-100/80 bg-gray-50/50">
                <th className="py-3.5 px-4 font-medium w-10">
                  <input
                    type="checkbox"
                    checked={
                      users.some((user) => user.role !== "admin") &&
                      selectedIds.size ===
                        users.filter((user) => user.role !== "admin").length
                    }
                    onChange={toggleSelectAll}
                    className="w-3.5 h-3.5 rounded accent-primary cursor-pointer"
                  />
                </th>
                <th
                  className="py-3.5 px-4 font-medium cursor-pointer select-none"
                  onClick={() => handleSort("name")}
                >
                  <span className="inline-flex items-center gap-1">
                    User <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
                <th className="py-3.5 px-4 font-medium">Role</th>
                <th className="py-3.5 px-4 font-medium">Verification</th>
                <th className="py-3.5 px-4 font-medium">Status</th>
                <th
                  className="py-3.5 px-4 font-medium cursor-pointer select-none"
                  onClick={() => handleSort("createdAt")}
                >
                  <span className="inline-flex items-center gap-1">
                    Joined <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
                <th className="py-3.5 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/60 text-slate-700">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-gray-400 text-xs"
                  >
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-gray-400 text-xs"
                  >
                    No users found matching your filters.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-white transition-colors">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(u._id)}
                        onChange={() => toggleSelectOne(u._id)}
                        disabled={u.role === "admin"}
                        className="w-3.5 h-3.5 rounded accent-primary cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                          {u.avatar ? (
                            <Image
                              src={u.avatar}
                              alt={u.name}
                              width={32}
                              height={32}
                              unoptimized
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[10px] font-bold text-gray-400">
                              {u.name?.charAt(0)?.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate max-w-44">
                            {u.name}
                          </p>
                          <p className="text-gray-400 text-xs truncate max-w-48">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${roleBadgeClasses(
                          u.role,
                        )}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          u.isVerified
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {u.isVerified ? "Verified" : "Unverified"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          u.banned
                            ? "bg-rose-50 text-rose-600"
                            : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {u.banned ? "Banned" : "Active"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right relative">
                      <button
                        onClick={() =>
                          setOpenMenuId(openMenuId === u._id ? null : u._id)
                        }
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-slate-500" />
                      </button>
                      {openMenuId === u._id && (
                        <div
                          ref={menuRef}
                          className="absolute right-4 top-10 z-20 w-52 bg-white rounded-xl border border-gray-100 shadow-lg py-1.5 text-left"
                        >
                          <button
                            onClick={() => handleOpenDetail(u._id)}
                            className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-gray-50"
                          >
                            <Eye className="w-3.5 h-3.5 text-gray-400" /> Quick preview
                          </button>
                          <button
                            onClick={() => {
                              setOpenMenuId(null);
                              router.push(`/dashboard/users/${u._id}`);
                            }}
                            className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-gray-50"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-gray-400" /> View full page
                          </button>
                          {canBan &&
                            u.role !== "admin" &&
                            (u.banned ? (
                              <button
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setUnbanTarget(u);
                                }}
                                className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-emerald-600 hover:bg-gray-50"
                              >
                                <UserCheck className="w-3.5 h-3.5" /> Unban user
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setBanTarget(u);
                                }}
                                className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-gray-50"
                              >
                                <Ban className="w-3.5 h-3.5" /> Ban user
                              </button>
                            ))}
                          {isSuperAdmin && u.role === "seller" && (
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                setPromoteTarget(u);
                              }}
                              className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-primary hover:bg-primary-bg/50"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" /> Make admin
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta.total > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100/80">
            <p className="text-xs text-gray-400">
              Showing {(page - 1) * PAGE_SIZE + 1}-
              {Math.min(page * PAGE_SIZE, meta.total)} of {meta.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-white"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <span className="text-xs font-semibold text-slate-700 px-2">
                {page} / {meta.totalPages}
              </span>
              <button
                onClick={() =>
                  setPage((prev) => Math.min(meta.totalPages, prev + 1))
                }
                disabled={page >= meta.totalPages}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-white"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==================== MOBILE CARD LIST ==================== */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="py-12 text-center text-gray-400 text-xs bg-[#F9FAFB] rounded-2xl border border-gray-100/80">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-xs bg-[#F9FAFB] rounded-2xl border border-gray-100/80">
            No users found matching your filters.
          </div>
        ) : (
          users.map((u) => (
            <div
              key={u._id}
              className="bg-[#F9FAFB] rounded-2xl border border-gray-100/80 shadow-2xs p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(u._id)}
                    onChange={() => toggleSelectOne(u._id)}
                    disabled={u.role === "admin"}
                    className="w-3.5 h-3.5 rounded accent-primary cursor-pointer shrink-0"
                  />
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                    {u.avatar ? (
                      <Image
                        src={u.avatar}
                        alt={u.name}
                        width={36}
                        height={36}
                        unoptimized
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-bold text-gray-400">
                        {u.name?.charAt(0)?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">
                      {u.name}
                    </p>
                    <p className="text-gray-400 text-xs truncate">{u.email}</p>
                  </div>
                </div>
                <div className="relative shrink-0">
                  <button
                    onClick={() =>
                      setOpenMenuId(openMenuId === u._id ? null : u._id)
                    }
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-slate-500" />
                  </button>
                  {openMenuId === u._id && (
                    <div
                      ref={mobileMenuRef}
                      className="absolute right-0 top-9 z-20 w-52 bg-white rounded-xl border border-gray-100 shadow-lg py-1.5 text-left"
                    >
                      <button
                        onClick={() => handleOpenDetail(u._id)}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-gray-50"
                      >
                        <Eye className="w-3.5 h-3.5 text-gray-400" /> Quick preview
                      </button>
                      <button
                        onClick={() => {
                          setOpenMenuId(null);
                          router.push(`/dashboard/users/${u._id}`);
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-gray-50"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400" /> View full page
                      </button>
                      {canBan &&
                        u.role !== "admin" &&
                        (u.banned ? (
                          <button
                            onClick={() => {
                              setOpenMenuId(null);
                              setUnbanTarget(u);
                            }}
                            className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-emerald-600 hover:bg-gray-50"
                          >
                            <UserCheck className="w-3.5 h-3.5" /> Unban user
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setOpenMenuId(null);
                              setBanTarget(u);
                            }}
                            className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-gray-50"
                          >
                            <Ban className="w-3.5 h-3.5" /> Ban user
                          </button>
                        ))}
                      {isSuperAdmin && u.role === "seller" && (
                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            setPromoteTarget(u);
                          }}
                          className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-primary hover:bg-primary-bg/50"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" /> Make admin
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${roleBadgeClasses(
                    u.role,
                  )}`}
                >
                  {u.role}
                </span>
                <span
                  className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                    u.isVerified
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {u.isVerified ? "Verified" : "Unverified"}
                </span>
                <span
                  className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                    u.banned
                      ? "bg-rose-50 text-rose-600"
                      : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  {u.banned ? "Banned" : "Active"}
                </span>
              </div>

              <p className="text-xs text-gray-400">
                Joined {formatDate(u.createdAt)}
              </p>
            </div>
          ))
        )}

        {meta.total > 0 && (
          <div className="flex items-center justify-between px-1 py-2">
            <p className="text-xs text-gray-400">
              {(page - 1) * PAGE_SIZE + 1}-
              {Math.min(page * PAGE_SIZE, meta.total)} of {meta.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-white"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <span className="text-xs font-semibold text-slate-700 px-2">
                {page} / {meta.totalPages}
              </span>
              <button
                onClick={() =>
                  setPage((prev) => Math.min(meta.totalPages, prev + 1))
                }
                disabled={page >= meta.totalPages}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-white"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==================== USER DETAIL MODAL ==================== */}
      {detailUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="text-sm font-bold text-slate-800">User Details</h3>
              <button
                onClick={() => setDetailUser(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                  {detailUser.user.avatar ? (
                    <Image
                      src={detailUser.user.avatar}
                      alt={detailUser.user.name}
                      width={56}
                      height={56}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-bold text-gray-400">
                      {detailUser.user.name?.charAt(0)?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 text-base truncate">
                    {detailUser.user.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {detailUser.user.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-gray-400">Role</p>
                  <p className="font-semibold text-slate-800 mt-0.5 capitalize">
                    {detailUser.user.role}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Status</p>
                  <p
                    className={`font-semibold mt-0.5 ${
                      detailUser.user.banned ? "text-rose-600" : "text-emerald-600"
                    }`}
                  >
                    {detailUser.user.banned ? "Banned" : "Active"}
                  </p>
                </div>
                {detailUser.store && (
                  <div>
                    <p className="text-gray-400">Store Name</p>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {detailUser.store.name}
                    </p>
                  </div>
                )}
                {detailUser.user.referralCode && (
                  <div>
                    <p className="text-gray-400">Referral Code</p>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {detailUser.user.referralCode}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-gray-400">Joined</p>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {formatDate(detailUser.user.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Orders</p>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {detailUser.orderCount}
                  </p>
                </div>
              </div>

              {detailUser.user.banned && detailUser.user.banReason && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700">
                  <span className="font-bold">Ban reason: </span>
                  {detailUser.user.banReason}
                </div>
              )}

              {detailUser.kyc && (
                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <p className="text-xs font-bold text-slate-800">KYC Status</p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-gray-400">Status</p>
                      <span
                        className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${
                          detailUser.kyc.status === "approved"
                            ? "bg-emerald-50 text-emerald-600"
                            : detailUser.kyc.status === "rejected"
                              ? "bg-rose-50 text-rose-600"
                              : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {detailUser.kyc.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-400">Document Type</p>
                      <p className="font-semibold text-slate-800 mt-0.5">
                        {detailUser.kyc.idType || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-100 pt-4 flex justify-end">
                <button
                  onClick={() => {
                    const id = detailUser.user._id;
                    setDetailUser(null);
                    router.push(`/dashboard/users/${id}`);
                  }}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Full Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Dialogs */}
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
        description={`${unbanTarget?.name ?? "This user"} will regain access to their account immediately.`}
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

      {/* Bulk Ban Dialog */}
      <BanUserDialog
        isOpen={bulkBanOpen}
        onClose={() => setBulkBanOpen(false)}
        onConfirm={handleBulkBan}
        userName={`${selectedIds.size} selected user(s)`}
        isLoading={actionLoading}
      />

      {/* Bulk Unban Dialog */}
      <ConfirmDialog
        isOpen={bulkUnbanOpen}
        onClose={() => setBulkUnbanOpen(false)}
        onConfirm={handleBulkUnban}
        title={`Unban ${selectedIds.size} user(s)?`}
        description="They will regain access to their accounts immediately."
        confirmLabel="Unban Selected"
        isLoading={actionLoading}
      />
    </div>
  );
}

