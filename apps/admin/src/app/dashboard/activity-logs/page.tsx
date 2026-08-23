"use client";

import React, { useEffect, useState } from "react";
import {
  Activity,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  X,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  Eye,
  UserCircle,
  Clock,
  Filter,
} from "lucide-react";
import { auditLogService, type AuditLog } from "@/lib/api";

export interface AuditLogFilters {
  limit?: number;
  sortOrder?: "asc" | "desc";
  category?: string;
  action?: string;
  outcome?: string;
  source?: string;
  actorType?: string;
  entityType?: string;
  from?: string;
  to?: string;
  userSearch?: string;
  ipAddress?: string;
  entityId?: string;
  search?: string;
}

const label = (value: string) =>
  value.replace(/[._]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const dateLabel = (value?: string) =>
  value
    ? new Date(value).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
    : "—";

const shortDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

function outcomeBadge(outcome: string) {
  if (outcome === "success") return { label: "Success", classes: "bg-emerald-50 text-emerald-700" };
  if (outcome === "failure") return { label: "Failure", classes: "bg-rose-50 text-rose-700" };
  return { label: label(outcome), classes: "bg-gray-100 text-gray-600" };
}

function readScopeFromUrl(): { userId: string | null; userName: string | null } {
  if (typeof window === "undefined") return { userId: null, userName: null };
  const params = new URLSearchParams(window.location.search);
  const uid = params.get("userId");
  const uname = params.get("name");
  return { userId: uid, userName: uname || uid };
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [options, setOptions] = useState<{
    actions: string[];
    categories: string[];
    entityTypes: string[];
    sources: string[];
    actorTypes: string[];
    outcomes: string[];
  }>({ actions: [], categories: [], entityTypes: [], sources: [], actorTypes: [], outcomes: [] });

  const [filters, setFilters] = useState<AuditLogFilters>({ limit: 25, sortOrder: "desc" });
  const [draft, setDraft] = useState<AuditLogFilters>({ limit: 25, sortOrder: "desc" });
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState({ successCount: 0, failureCount: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [selected, setSelected] = useState<AuditLog | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const initialScope = readScopeFromUrl();
  const [scopeUserId, setScopeUserId] = useState<string | null>(initialScope.userId);
  const [scopeUserName, setScopeUserName] = useState<string | null>(initialScope.userName);
  const [searchInput, setSearchInput] = useState("");

  const limit = filters.limit || 25;
  const pageCount = Math.max(1, Math.ceil(total / limit));

  const clearScope = () => {
    setScopeUserId(null);
    setScopeUserName(null);
    if (typeof window !== "undefined" && window.history?.replaceState) {
      const url = new URL(window.location.href);
      url.searchParams.delete("userId");
      url.searchParams.delete("name");
      window.history.replaceState({}, "", url.pathname);
    }
  };

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setLoading(true);
      auditLogService
        .list({ ...filters, userId: scopeUserId || undefined, page })
        .then((result) => {
          if (!active) return;
          setLogs(result.logs);
          setTotal(result.total);
          setSummary(result.summary);
          setLoading(false);
        })
        .catch((error) => {
          if (!active) return;
          console.error("Failed to load activity logs", error);
          setLoading(false);
        });
    });
    return () => {
      active = false;
    };
  }, [filters, page, scopeUserId]);

  useEffect(() => {
    auditLogService
      .getFilterOptions()
      .then(setOptions)
      .catch((error) => console.error("Failed to load log filters", error));
  }, []);

  const setDraftValue = (key: keyof AuditLogFilters, value: string) =>
    setDraft((current) => ({ ...current, [key]: value || undefined }));

  const applyFilters = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(1);
    setFilters({ ...draft });
    setFiltersOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    const next = { ...draft, search: searchInput.trim() || undefined };
    setDraft(next);
    setFilters(next);
  };

  const reset = () => {
    const next: AuditLogFilters = { limit: 25, sortOrder: "desc" };
    setDraft(next);
    setFilters(next);
    setSearchInput("");
    setPage(1);
    setFiltersOpen(false);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await auditLogService.export({ ...filters, userId: scopeUserId || undefined });
    } catch (error) {
      console.error("Failed to export activity logs", error);
    } finally {
      setExporting(false);
    }
  };

  const activeFilterCount =
    [
      filters.category,
      filters.action,
      filters.outcome,
      filters.source,
      filters.actorType,
      filters.entityType,
      filters.from,
      filters.to,
      filters.userSearch,
      filters.ipAddress,
      filters.entityId,
      filters.search,
    ].filter(Boolean).length;

  const statCards = [
    { label: "Total events", value: total, icon: Activity },
    { label: "Successful", value: summary.successCount, icon: CheckCircle2, color: "text-emerald-700" },
    { label: "Failed", value: summary.failureCount, icon: XCircle, color: "text-rose-600" },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0A0E11] tracking-tight flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-primary" />
            Activity Logs & Audit Trail
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            System audit trail capturing admin interventions, merchant status changes, and critical security events.
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting || total === 0}
          className="px-4 py-2.5 rounded-full bg-white border border-gray-200 hover:border-primary text-slate-700 hover:text-primary font-bold text-xs shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{exporting ? "Exporting..." : "Export CSV"}</span>
        </button>
      </div>

      {/* Scope banner if filtered by user */}
      {scopeUserId && (
        <div className="flex items-center justify-between p-3.5 bg-primary-bg border border-primary-light rounded-2xl text-xs">
          <div className="flex items-center gap-2 text-primary font-bold">
            <UserCircle className="w-4 h-4" />
            <span>Scoped to user: {scopeUserName}</span>
          </div>
          <button
            onClick={clearScope}
            className="text-xs font-semibold text-primary underline hover:text-primary-hover"
          >
            Clear scope
          </button>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="bg-white p-5 rounded-3xl border border-gray-200/70 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{c.label}</p>
                <p className={`text-2xl font-extrabold mt-1 ${c.color || "text-[#0A0E11]"}`}>
                  {c.value.toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-primary-bg text-primary flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search action, description, email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-white border border-gray-200 pl-10 pr-4 py-2.5 rounded-full text-xs font-medium text-slate-800 placeholder-gray-400 shadow-xs outline-none focus:border-primary transition-all"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </form>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 border ${
              activeFilterCount > 0
                ? "bg-primary text-white border-primary"
                : "bg-white text-slate-700 border-gray-200 hover:border-gray-300"
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}</span>
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={reset}
              className="p-2.5 rounded-full text-gray-400 hover:text-slate-700 bg-white border border-gray-200"
              title="Reset all filters"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Expandable Filter Drawer */}
      {filtersOpen && (
        <form onSubmit={applyFilters} className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200/70 shadow-xs space-y-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
              <select
                value={draft.category || ""}
                onChange={(e) => setDraftValue("category", e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-primary"
              >
                <option value="">All Categories</option>
                {options.categories.map((c) => (
                  <option key={c} value={c}>
                    {label(c)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Outcome</label>
              <select
                value={draft.outcome || ""}
                onChange={(e) => setDraftValue("outcome", e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-primary"
              >
                <option value="">All Outcomes</option>
                <option value="success">Success</option>
                <option value="failure">Failure</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">From Date</label>
              <input
                type="date"
                value={draft.from || ""}
                onChange={(e) => setDraftValue("from", e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-primary"
              >
              </input>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">To Date</label>
              <input
                type="date"
                value={draft.to || ""}
                onChange={(e) => setDraftValue("to", e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-primary"
              >
              </input>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={reset}
              className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-slate-800"
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </form>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-3xl border border-gray-200/70 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-primary-bg border-b border-gray-200 text-primary font-bold">
              <tr>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Actor</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Outcome</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 text-xs">
                    Loading audit trail logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 text-xs">
                    No activity logs found matching the current criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const badge = outcomeBadge(log.outcome);
                  return (
                    <tr key={log._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{label(log.action)}</div>
                        <div className="text-[11px] text-gray-400 truncate max-w-xs">{log.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{log.user?.name || log.actorType || "System"}</div>
                        <div className="text-[11px] text-gray-400">{log.user?.email || log.ipAddress || ""}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-slate-600">
                          {label(log.category)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${badge.classes}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">{dateLabel(log.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelected(log)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-slate-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pager */}
        {pageCount > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 text-xs">
            <span className="text-gray-500">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-full border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1.5 font-bold text-slate-700">
                {page} / {pageCount}
              </span>
              <button
                disabled={page >= pageCount || loading}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                className="px-3 py-1.5 rounded-full border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="py-10 text-center text-xs text-gray-400 bg-white rounded-3xl border border-gray-200/70">
            Loading audit trail logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="py-10 text-center text-xs text-gray-400 bg-white rounded-3xl border border-gray-200/70">
            No activity logs found.
          </div>
        ) : (
          logs.map((log) => {
            const badge = outcomeBadge(log.outcome);
            return (
              <div
                key={log._id}
                onClick={() => setSelected(log)}
                className="bg-white p-4 rounded-2xl border border-gray-200/70 shadow-xs space-y-3 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-sm font-bold text-slate-900">{label(log.action)}</span>
                    <p className="text-xs text-gray-500 mt-0.5">{log.user?.name || log.actorType || "System"}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badge.classes}`}>
                    {badge.label}
                  </span>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">{log.description}</p>
                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-100">
                  <span>{label(log.category)}</span>
                  <span>{shortDate(log.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-slate-900">Audit Log Details</h3>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs sm:text-sm">
              <div>
                <span className="text-gray-400 block text-xs font-bold uppercase">Action</span>
                <span className="font-bold text-slate-900 text-base">{label(selected.action)}</span>
              </div>

              <div>
                <span className="text-gray-400 block text-xs font-bold uppercase">Description</span>
                <p className="text-slate-700 mt-0.5 leading-relaxed">{selected.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div>
                  <span className="text-gray-400 block text-xs font-bold uppercase">Actor</span>
                  <span className="font-semibold text-slate-800">{selected.user?.name || selected.actorType}</span>
                  <span className="text-gray-400 text-xs block">{selected.user?.email || ""}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-xs font-bold uppercase">Category</span>
                  <span className="font-semibold text-slate-800">{label(selected.category)}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-xs font-bold uppercase">IP Address</span>
                  <span className="font-mono text-slate-700 text-xs">{selected.ipAddress || "—"}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-xs font-bold uppercase">Timestamp</span>
                  <span className="text-slate-700 text-xs">{dateLabel(selected.createdAt)}</span>
                </div>
              </div>

              {selected.metadata && Object.keys(selected.metadata).length > 0 && (
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-gray-400 block text-xs font-bold uppercase mb-1">Metadata</span>
                  <pre className="p-3 bg-gray-50 rounded-xl text-xs font-mono text-slate-700 overflow-x-auto">
                    {JSON.stringify(selected.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelected(null)}
                className="px-5 py-2 rounded-full bg-slate-800 text-white text-xs font-bold hover:bg-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
