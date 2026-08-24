"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Palette,
  Eye,
  Plus,
  Sparkles,
  Search,
  Check,
  X,
  Edit2,
  Trash2,
  Power,
  Layers,
  Store,
  RefreshCw,
  LayoutGrid,
  List,
  AlertCircle,
  ExternalLink,
  Shield,
  Sliders,
  CheckCircle2,
  Tag,
  ArrowRight,
} from "lucide-react";
import {
  adminTemplatesService,
  type AdminTemplateItem,
  type AdminTemplatePayload,
  type ColorVariable,
  type LayoutSection,
} from "@/lib/api";
import { authService } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";
import ConfirmDialog from "@/components/ConfirmDialog";

const PRESET_IMAGES = [
  { label: "Free Modern Minimal", url: "/template-free.png" },
  { label: "Pro Bold Tech", url: "/template-pro.png" },
  { label: "Pro+ Luxury Gold", url: "/template-proplus.png" },
];

const DEFAULT_COLOR_VARS: ColorVariable[] = [
  { variableName: "--primary-color", defaultValue: "#800A1D", label: "Primary Accent" },
  { variableName: "--background-color", defaultValue: "#FFFFFF", label: "Background Color" },
  { variableName: "--text-color", defaultValue: "#0A0E11", label: "Text Color" },
];

const DEFAULT_LAYOUT_SECTIONS: LayoutSection[] = [
  { sectionId: "hero", sectionName: "Hero Banner", isRequired: true },
  { sectionId: "featured-products", sectionName: "Featured Products Grid", isRequired: true },
  { sectionId: "categories-slider", sectionName: "Category Slider", isRequired: false },
  { sectionId: "testimonials", sectionName: "Customer Testimonials", isRequired: false },
  { sectionId: "newsletter-signup", sectionName: "Newsletter Box", isRequired: false },
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<AdminTemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AdminTemplateItem | null>(null);
  const [inspectingTemplate, setInspectingTemplate] = useState<AdminTemplateItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminTemplateItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Permissions
  const user = authService.getUser();
  const canManage = hasPermission(user?.adminRole, "templates.manage");

  const notify = (message: string, type: "success" | "error" = "success") => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const fetchTemplates = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const data = await adminTemplatesService.list();
      setTemplates(data || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load storefront templates.";
      notify(message, "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTemplates(true);
  };

  // Toggle active status
  const handleToggleStatus = async (tpl: AdminTemplateItem) => {
    if (!canManage) {
      notify("You do not have permission to manage templates.", "error");
      return;
    }
    const newStatus = !tpl.isActive;
    try {
      await adminTemplatesService.toggleActive(tpl._id, newStatus);
      setTemplates((prev) =>
        prev.map((item) => (item._id === tpl._id ? { ...item, isActive: newStatus } : item))
      );
      notify(`Template "${tpl.name}" is now ${newStatus ? "Active" : "Inactive"}.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update template status.";
      notify(message, "error");
    }
  };

  // Delete template
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await adminTemplatesService.delete(deleteTarget._id);
      setTemplates((prev) => prev.filter((item) => item._id !== deleteTarget._id));
      notify(`Template "${deleteTarget.name}" deleted successfully.`);
      setDeleteTarget(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete template.";
      notify(message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((tpl) => {
      if (tierFilter !== "all" && tpl.tier !== tierFilter) return false;
      if (statusFilter === "active" && !tpl.isActive) return false;
      if (statusFilter === "inactive" && tpl.isActive) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = tpl.name?.toLowerCase().includes(q);
        const matchCategory = tpl.category?.toLowerCase().includes(q);
        const matchSlug = tpl.slug?.toLowerCase().includes(q);
        const matchDesc = tpl.description?.toLowerCase().includes(q);
        if (!matchName && !matchCategory && !matchSlug && !matchDesc) return false;
      }
      return true;
    });
  }, [templates, tierFilter, statusFilter, search]);

  // Metrics summary
  const metrics = useMemo(() => {
    const total = templates.length;
    const active = templates.filter((t) => t.isActive).length;
    const totalStores = templates.reduce((acc, t) => acc + (t.storesUsing || 0), 0);
    return { total, active, totalStores };
  }, [templates]);

  return (
    <div className="space-y-6 font-sans max-w-7xl mx-auto pb-12">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-sm font-medium transition-all animate-in fade-in slide-in-from-top-3 duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-950 text-emerald-100 border-emerald-800"
              : "bg-red-950 text-red-100 border-red-800"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="ml-2 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A0E11] tracking-tight">
            Storefront Templates
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Manage merchant website theme designs, tier availability, and layout configurations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            title="Refresh templates"
            className="p-2.5 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-primary" : ""}`} />
          </button>

          {canManage && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-sm transition-all transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Template</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-gray-200/70 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Templates</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{loading ? "—" : metrics.total}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Available in catalogue</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-primary-bg flex items-center justify-center text-primary">
            <Palette className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-200/70 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Themes</p>
            <h3 className="text-2xl font-black text-emerald-700 mt-1">{loading ? "—" : metrics.active}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Published & selectable</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-200/70 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Store Deployments</p>
            <h3 className="text-2xl font-black text-indigo-700 mt-1">{loading ? "—" : metrics.totalStores}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Active merchant websites</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Store className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 border border-gray-200/70 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates by name, slug or category..."
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800 placeholder-gray-400"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Tier & Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tier Tabs */}
          <div className="flex items-center bg-gray-100 p-1 rounded-full text-xs font-semibold">
            {["all", "free", "pro", "pro+"].map((tier) => (
              <button
                key={tier}
                onClick={() => setTierFilter(tier)}
                className={`px-3 py-1.5 rounded-full capitalize transition-all ${
                  tierFilter === tier
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-gray-500 hover:text-slate-800"
                }`}
              >
                {tier === "all" ? "All Tiers" : tier === "pro+" ? "Pro+ VIP" : tier}
              </button>
            ))}
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-full text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center bg-gray-100 p-1 rounded-full text-gray-500">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-full transition-all ${
                viewMode === "grid" ? "bg-white text-primary shadow-xs" : "hover:text-slate-800"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-full transition-all ${
                viewMode === "table" ? "bg-white text-primary shadow-xs" : "hover:text-slate-800"
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 space-y-4">
              <div className="h-44 bg-gray-100 rounded-2xl w-full" />
              <div className="h-5 bg-gray-100 rounded-full w-2/3" />
              <div className="h-3 bg-gray-100 rounded-full w-full" />
              <div className="h-3 bg-gray-100 rounded-full w-4/5" />
              <div className="h-10 bg-gray-100 rounded-full w-full mt-4" />
            </div>
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200/70 p-12 text-center shadow-xs">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400 mb-3">
            <Palette className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Storefront Templates Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
            {search || tierFilter !== "all" || statusFilter !== "all"
              ? "No templates match your current filter criteria. Try resetting filters."
              : "No templates have been configured yet. Add your first template to get started."}
          </p>
          {(search || tierFilter !== "all" || statusFilter !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setTierFilter("all");
                setStatusFilter("all");
              }}
              className="mt-4 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-slate-800 text-xs font-bold transition-all"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((tpl) => (
            <TemplateCard
              key={tpl._id}
              template={tpl}
              canManage={canManage}
              onInspect={() => setInspectingTemplate(tpl)}
              onEdit={() => setEditingTemplate(tpl)}
              onToggleStatus={() => handleToggleStatus(tpl)}
              onDelete={() => setDeleteTarget(tpl)}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-3xl border border-gray-200/70 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50/75 border-b border-gray-200 text-gray-600 font-bold text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Template</th>
                  <th className="px-6 py-4">Tier</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Active Stores</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-700">
                {filteredTemplates.map((tpl) => (
                  <tr key={tpl._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-10 rounded-xl bg-gray-100 overflow-hidden relative shrink-0 border border-gray-200/70">
                          {tpl.previewImageUrl ? (
                            <Image
                              src={tpl.previewImageUrl}
                              alt={tpl.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Palette className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{tpl.name}</p>
                          <p className="text-[11px] font-mono text-gray-400">/{tpl.slug}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <TierBadge tier={tpl.tier} />
                    </td>

                    <td className="px-6 py-4">
                      <span className="capitalize text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                        {tpl.category || "General"}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-bold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-gray-400" />
                        <span>{tpl.storesUsing ?? 0}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => canManage && handleToggleStatus(tpl)}
                        disabled={!canManage}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                          tpl.isActive
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            tpl.isActive ? "bg-emerald-500" : "bg-gray-400"
                          }`}
                        />
                        <span>{tpl.isActive ? "Active" : "Inactive"}</span>
                      </button>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInspectingTemplate(tpl)}
                          title="Preview & Details"
                          className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canManage && (
                          <>
                            <button
                              onClick={() => setEditingTemplate(tpl)}
                              title="Edit Template"
                              className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-slate-700 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(tpl)}
                              title="Delete Template"
                              className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Template Modal */}
      {(isCreateOpen || editingTemplate) && (
        <TemplateFormModal
          isOpen={true}
          initialData={editingTemplate}
          onClose={() => {
            setIsCreateOpen(false);
            setEditingTemplate(null);
          }}
          onSuccess={(savedTemplate, isEdit) => {
            if (isEdit) {
              setTemplates((prev) =>
                prev.map((t) => (t._id === savedTemplate._id ? { ...t, ...savedTemplate } : t))
              );
              notify(`Template "${savedTemplate.name}" updated successfully.`);
            } else {
              setTemplates((prev) => [savedTemplate, ...prev]);
              notify(`Template "${savedTemplate.name}" created successfully.`);
            }
            setIsCreateOpen(false);
            setEditingTemplate(null);
          }}
        />
      )}

      {/* Inspect & Preview Modal */}
      {inspectingTemplate && (
        <TemplateInspectModal
          template={inspectingTemplate}
          onClose={() => setInspectingTemplate(null)}
          onEdit={() => {
            const t = inspectingTemplate;
            setInspectingTemplate(null);
            setEditingTemplate(t);
          }}
          canManage={canManage}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Storefront Template"
        description={
          deleteTarget?.storesUsing && deleteTarget.storesUsing > 0
            ? `Warning: ${deleteTarget.storesUsing} active store(s) are currently configured with "${deleteTarget.name}". You must deactivate this template rather than deleting it.`
            : `Are you sure you want to permanently delete "${deleteTarget?.name}"? This action cannot be undone.`
        }
        confirmLabel="Delete Template"
        isDestructive={true}
        isLoading={actionLoading}
      />
    </div>
  );
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: "free" | "pro" | "pro+" | string }) {
  if (tier === "free") {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
        Free Tier
      </span>
    );
  }
  if (tier === "pro") {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
        Pro Plan
      </span>
    );
  }
  return (
    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
      <Sparkles className="w-2.5 h-2.5 text-amber-600" />
      <span>Pro+ VIP</span>
    </span>
  );
}

interface TemplateCardProps {
  template: AdminTemplateItem;
  canManage: boolean;
  onInspect: () => void;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
}

function TemplateCard({
  template,
  canManage,
  onInspect,
  onEdit,
  onToggleStatus,
  onDelete,
}: TemplateCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      <div>
        {/* Preview Thumbnail Header */}
        <div className="relative h-48 w-full bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden border-b border-gray-100">
          {template.previewImageUrl && !imgError ? (
            <Image
              src={template.previewImageUrl}
              alt={template.name}
              fill
              className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
              <Palette className="w-8 h-8 text-gray-300" />
              <span className="text-xs font-semibold text-gray-400">Preview not available</span>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

          {/* Top Badges */}
          <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-auto">
            <TierBadge tier={template.tier} />
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-xs flex items-center gap-1.5 ${
                template.isActive
                  ? "bg-emerald-600/90 text-white backdrop-blur-xs"
                  : "bg-slate-800/80 text-gray-200 backdrop-blur-xs"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  template.isActive ? "bg-emerald-200" : "bg-gray-400"
                }`}
              />
              <span>{template.isActive ? "Active" : "Inactive"}</span>
            </span>
          </div>

          {/* Bottom Overlay Info */}
          <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white text-xs font-semibold">
            <span className="capitalize px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-xs text-[11px]">
              {template.category || "General"}
            </span>
            <div className="flex items-center gap-1 text-[11px] bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-md">
              <Store className="w-3 h-3 text-white/80" />
              <span>{template.storesUsing ?? 0} Stores</span>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors">
                {template.name}
              </h3>
              <p className="text-[11px] font-mono text-gray-400">slug: {template.slug}</p>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
            {template.description || "Clean, high-performance storefront layout tailored for Hustlr merchants."}
          </p>

          {/* Color Variables & Sections Snippet */}
          <div className="mt-4 pt-3.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-gray-400">Palette:</span>
              <div className="flex items-center -space-x-1">
                {(template.colorVariables || DEFAULT_COLOR_VARS.slice(0, 3)).map((c, i) => (
                  <span
                    key={i}
                    className="w-4 h-4 rounded-full border border-white shadow-xs inline-block"
                    style={{ backgroundColor: c.defaultValue || "#800A1D" }}
                    title={`${c.label}: ${c.defaultValue}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-medium text-gray-500">
              <Layers className="w-3.5 h-3.5 text-gray-400" />
              <span>{template.layoutSections?.length || 4} sections</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="px-5 pb-5 pt-0 flex items-center gap-2">
        <button
          onClick={onInspect}
          className="flex-1 py-2 px-3 rounded-full bg-gray-100 hover:bg-gray-200 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Inspect</span>
        </button>

        {canManage && (
          <>
            <button
              onClick={onEdit}
              title="Edit template details"
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-slate-700 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onToggleStatus}
              title={template.isActive ? "Deactivate template" : "Activate template"}
              className={`p-2 rounded-full transition-colors ${
                template.isActive
                  ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                  : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-slate-700"
              }`}
            >
              <Power className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onDelete}
              title="Delete template"
              className="p-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Create & Edit Modal ─────────────────────────────────────────────────────

interface TemplateFormModalProps {
  isOpen: boolean;
  initialData?: AdminTemplateItem | null;
  onClose: () => void;
  onSuccess: (saved: AdminTemplateItem, isEdit: boolean) => void;
}

function TemplateFormModal({
  isOpen,
  initialData,
  onClose,
  onSuccess,
}: TemplateFormModalProps) {
  const isEdit = Boolean(initialData);

  const [activeTab, setActiveTab] = useState<"general" | "customization">("general");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [tier, setTier] = useState<"free" | "pro" | "pro+">(initialData?.tier || "free");
  const [category, setCategory] = useState(initialData?.category || "general");
  const [description, setDescription] = useState(initialData?.description || "");
  const [previewImageUrl, setPreviewImageUrl] = useState(
    initialData?.previewImageUrl || "/template-free.png"
  );
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  // Colors & Sections
  const [colorVariables, setColorVariables] = useState<ColorVariable[]>(
    initialData?.colorVariables?.length ? initialData.colorVariables : DEFAULT_COLOR_VARS
  );
  const [layoutSections, setLayoutSections] = useState<LayoutSection[]>(
    initialData?.layoutSections?.length ? initialData.layoutSections : DEFAULT_LAYOUT_SECTIONS
  );

  // Auto-generate slug from name if creating new
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEdit) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setSlug(generated);
    }
  };

  // Color Variable helpers
  const handleAddColorVar = () => {
    setColorVariables((prev) => [
      ...prev,
      { variableName: `--color-${prev.length + 1}`, defaultValue: "#3B82F6", label: `Custom Color ${prev.length + 1}` },
    ]);
  };

  const handleUpdateColorVar = (index: number, field: keyof ColorVariable, value: string) => {
    setColorVariables((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  const handleRemoveColorVar = (index: number) => {
    setColorVariables((prev) => prev.filter((_, i) => i !== index));
  };

  // Layout Section helpers
  const handleAddSection = () => {
    const id = `section-${layoutSections.length + 1}`;
    setLayoutSections((prev) => [
      ...prev,
      { sectionId: id, sectionName: `New Section ${prev.length + 1}`, isRequired: false },
    ]);
  };

  const handleUpdateSection = (index: number, field: keyof LayoutSection, value: any) => {
    setLayoutSections((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  const handleRemoveSection = (index: number) => {
    setLayoutSections((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Template name is required.");
      return;
    }

    setLoading(true);
    setError(null);

    const payload: AdminTemplatePayload = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      tier,
      category: category.trim() || "general",
      description: description.trim(),
      previewImageUrl: previewImageUrl.trim(),
      isActive,
      colorVariables,
      layoutSections,
    };

    try {
      if (isEdit && initialData) {
        const updated = await adminTemplatesService.update(initialData._id, payload);
        onSuccess(updated, true);
      } else {
        const created = await adminTemplatesService.create(payload);
        onSuccess(created, false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save template.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" />

      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">
              {isEdit ? `Edit Template: ${initialData?.name}` : "Create New Storefront Template"}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Configure storefront branding tokens, plan tier availability, and layout schema.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="px-6 border-b border-gray-100 flex gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab("general")}
            className={`py-3 border-b-2 transition-all ${
              activeTab === "general"
                ? "border-primary text-primary"
                : "border-transparent text-gray-400 hover:text-slate-700"
            }`}
          >
            1. General & Pricing Tier
          </button>
          <button
            onClick={() => setActiveTab("customization")}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "customization"
                ? "border-primary text-primary"
                : "border-transparent text-gray-400 hover:text-slate-700"
            }`}
          >
            <span>2. Color Palette & Layout Schema</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-gray-100 text-gray-600">
              {colorVariables.length + layoutSections.length}
            </span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1">
          {activeTab === "general" ? (
            <>
              {/* Template Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Template Name <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Modern Minimalist"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Identifier Slug
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. modern-minimalist"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-2xl font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              {/* Tier Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Plan Tier Requirement
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "free", label: "Free Tier", sub: "Available to all sellers" },
                    { id: "pro", label: "Pro Plan", sub: "Requires Pro subscription" },
                    { id: "pro+", label: "Pro+ VIP", sub: "Exclusive to Pro+ plan" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTier(item.id as "free" | "pro" | "pro+")}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        tier === item.id
                          ? "border-primary bg-primary-bg ring-1 ring-primary"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{item.label}</span>
                        {tier === item.id && <Check className="w-3.5 h-3.5 text-primary" />}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1 leading-tight">{item.sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 font-medium capitalize"
                  >
                    <option value="general">General Commerce</option>
                    <option value="fashion">Fashion & Apparel</option>
                    <option value="electronics">Electronics & Tech</option>
                    <option value="beauty">Beauty & Cosmetics</option>
                    <option value="lifestyle">Lifestyle & Home</option>
                    <option value="art">Art & Crafts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Visibility Status
                  </label>
                  <div
                    onClick={() => setIsActive(!isActive)}
                    className={`px-3.5 py-2.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-colors ${
                      isActive ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-gray-50 border-gray-200 text-gray-600"
                    }`}
                  >
                    <span className="text-xs font-bold">
                      {isActive ? "Active (Visible to Merchants)" : "Inactive (Hidden)"}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        isActive ? "bg-emerald-600 text-white" : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {isActive ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Template Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the target audience, aesthetic, or industry specialty..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 placeholder-gray-400"
                />
              </div>

              {/* Preview Image Preset or Custom URL */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Storefront Preview Mockup
                </label>

                {/* Preset image quick selectors */}
                <div className="flex flex-wrap gap-2 mb-2.5">
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => setPreviewImageUrl(preset.url)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        previewImageUrl === preset.url
                          ? "bg-primary text-white border-primary"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={previewImageUrl}
                  onChange={(e) => setPreviewImageUrl(e.target.value)}
                  placeholder="Image URL (e.g. /template-free.png or https://...)"
                  className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-2xl font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </>
          ) : (
            <>
              {/* Color Variables Manager */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Color Palette Tokens
                    </h4>
                    <p className="text-[11px] text-gray-400">
                      CSS variables customizable by merchants using this theme.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddColorVar}
                    className="px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-slate-800 text-[11px] font-bold transition-all"
                  >
                    + Add Color
                  </button>
                </div>

                <div className="space-y-2">
                  {colorVariables.map((c, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-gray-50 border border-gray-200/80 rounded-2xl flex items-center gap-3"
                    >
                      {/* Color Picker Box */}
                      <input
                        type="color"
                        value={c.defaultValue || "#800A1D"}
                        onChange={(e) => handleUpdateColorVar(idx, "defaultValue", e.target.value)}
                        className="w-8 h-8 rounded-xl border border-gray-300 cursor-pointer shrink-0"
                      />

                      {/* Label Input */}
                      <input
                        type="text"
                        placeholder="Label (e.g. Accent)"
                        value={c.label}
                        onChange={(e) => handleUpdateColorVar(idx, "label", e.target.value)}
                        className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-xl"
                      />

                      {/* Variable Name */}
                      <input
                        type="text"
                        placeholder="--variable-name"
                        value={c.variableName}
                        onChange={(e) => handleUpdateColorVar(idx, "variableName", e.target.value)}
                        className="w-36 px-2.5 py-1.5 text-xs font-mono bg-white border border-gray-200 rounded-xl text-gray-600"
                      />

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => handleRemoveColorVar(idx)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Layout Sections Manager */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Layout Sections
                    </h4>
                    <p className="text-[11px] text-gray-400">
                      Modular page blocks included in this storefront layout.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSection}
                    className="px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-slate-800 text-[11px] font-bold transition-all"
                  >
                    + Add Section
                  </button>
                </div>

                <div className="space-y-2">
                  {layoutSections.map((sec, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-gray-50 border border-gray-200/80 rounded-2xl flex items-center gap-3"
                    >
                      <Layers className="w-4 h-4 text-gray-400 shrink-0" />

                      <input
                        type="text"
                        placeholder="Section Name"
                        value={sec.sectionName}
                        onChange={(e) => handleUpdateSection(idx, "sectionName", e.target.value)}
                        className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-xl font-medium"
                      />

                      <input
                        type="text"
                        placeholder="section-id"
                        value={sec.sectionId}
                        onChange={(e) => handleUpdateSection(idx, "sectionId", e.target.value)}
                        className="w-32 px-2.5 py-1.5 text-xs font-mono bg-white border border-gray-200 rounded-xl text-gray-600"
                      />

                      <label className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sec.isRequired}
                          onChange={(e) => handleUpdateSection(idx, "isRequired", e.target.checked)}
                          className="rounded text-primary focus:ring-primary"
                        />
                        <span>Required</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => handleRemoveSection(idx)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Footer Action Buttons */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-primary hover:bg-primary-hover transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{isEdit ? "Save Changes" : "Create Template"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Template Inspector / Preview Modal ──────────────────────────────────────

interface TemplateInspectModalProps {
  template: AdminTemplateItem;
  canManage: boolean;
  onClose: () => void;
  onEdit: () => void;
}

function TemplateInspectModal({
  template,
  canManage,
  onClose,
  onEdit,
}: TemplateInspectModalProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary-bg text-primary flex items-center justify-center font-bold">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-slate-900">{template.name}</h3>
                <TierBadge tier={template.tier} />
              </div>
              <p className="text-xs font-mono text-gray-400">/{template.slug}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canManage && (
              <button
                onClick={onEdit}
                className="px-3.5 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scroll Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Simulated Storefront Mockup Banner */}
          <div className="rounded-2xl border border-gray-200 overflow-hidden bg-slate-900 text-white">
            <div className="px-4 py-2 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between text-xs text-gray-300">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-[11px] text-gray-400">
                  https://[merchant-subdomain].hustlr.store
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Live Theme Preview
              </span>
            </div>

            <div className="relative h-64 w-full bg-slate-950 flex items-center justify-center">
              {template.previewImageUrl && !imgError ? (
                <Image
                  src={template.previewImageUrl}
                  alt={template.name}
                  fill
                  className="object-cover object-top"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="text-center p-6 text-gray-400">
                  <Palette className="w-10 h-10 mx-auto text-gray-600 mb-2" />
                  <p className="text-xs">Visual preview unavailable</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Tier Required</span>
              <p className="text-sm font-extrabold text-slate-900 capitalize mt-0.5">
                {template.tier === "pro+" ? "Pro+ VIP" : template.tier}
              </p>
            </div>
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Industry Category</span>
              <p className="text-sm font-extrabold text-slate-900 capitalize mt-0.5">
                {template.category || "General"}
              </p>
            </div>
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Stores Using</span>
              <p className="text-sm font-extrabold text-indigo-700 mt-0.5">
                {template.storesUsing ?? 0} Stores
              </p>
            </div>
          </div>

          {/* Description */}
          {template.description && (
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                Theme Overview
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100">
                {template.description}
              </p>
            </div>
          )}

          {/* Color Palette Tokens */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
              Configured Color Palette
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(template.colorVariables?.length ? template.colorVariables : DEFAULT_COLOR_VARS).map(
                (col, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-50 border border-gray-100 rounded-2xl flex items-center gap-3"
                  >
                    <span
                      className="w-7 h-7 rounded-xl border border-gray-200 shadow-xs shrink-0"
                      style={{ backgroundColor: col.defaultValue || "#800A1D" }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{col.label}</p>
                      <p className="text-[10px] font-mono text-gray-400 truncate">{col.defaultValue}</p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Layout Sections Hierarchy */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
              Layout Schema Blocks
            </h4>
            <div className="space-y-2">
              {(template.layoutSections?.length ? template.layoutSections : DEFAULT_LAYOUT_SECTIONS).map(
                (sec, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5 font-medium text-slate-800">
                      <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <span>{sec.sectionName}</span>
                      <span className="font-mono text-[11px] text-gray-400">({sec.sectionId})</span>
                    </div>

                    {sec.isRequired ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-bg text-primary">
                        Mandatory
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-200 text-gray-600">
                        Optional
                      </span>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
