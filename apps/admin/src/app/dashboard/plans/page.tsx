"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  Check,
  Plus,
  Edit3,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  Layers,
  Percent,
  Package,
  Globe,
  Palette,
  FileText,
  Users,
  TrendingUp,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  adminPlansService,
  type AdminPlanItem,
  type AdminPlanPayload,
  type AdminPlanAnalyticsItem,
  authService,
} from "@/lib/api";
import { hasPermission } from "@/lib/permissions";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function PlansPage() {
  const [plans, setPlans] = useState<AdminPlanItem[]>([]);
  const [analytics, setAnalytics] = useState<AdminPlanAnalyticsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Edit/Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<AdminPlanItem | null>(null);

  // Toggle Status Confirm Dialog
  const [toggleTarget, setToggleTarget] = useState<AdminPlanItem | null>(null);

  // Permissions
  const user = authService.getUser();
  const canManage = hasPermission(user?.adminRole, "plans.manage");

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    slug: string;
    monthlyPrice: number;
    yearlyPrice: number;
    commissionPercent: number;
    isUnlimitedProducts: boolean;
    maxProducts: number;
    allowCustomDomain: boolean;
    allowProTemplates: boolean;
    allowProPlusTemplates: boolean;
    allowBlog: boolean;
    isActive: boolean;
    features: string[];
  }>({
    name: "",
    slug: "",
    monthlyPrice: 0,
    yearlyPrice: 0,
    commissionPercent: 10,
    isUnlimitedProducts: true,
    maxProducts: 25,
    allowCustomDomain: false,
    allowProTemplates: false,
    allowProPlusTemplates: false,
    allowBlog: false,
    isActive: true,
    features: [],
  });

  const [newFeatureText, setNewFeatureText] = useState("");

  const notify = (message: string, type: "success" | "error" = "success") => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [plansData, analyticsData] = await Promise.all([
        adminPlansService.list(),
        adminPlansService.getAnalytics().catch(() => []),
      ]);
      setPlans(plansData || []);
      setAnalytics(analyticsData || []);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to load subscription plans.";
      notify(msg, "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  // Plan analytics map
  const analyticsMap = useMemo(() => {
    const map: Record<string, { count: number; revenue: number }> = {};
    for (const item of analytics) {
      if (item._id) {
        map[item._id.toLowerCase()] = {
          count: item.count || 0,
          revenue: item.revenue || 0,
        };
      }
    }
    return map;
  }, [analytics]);

  // High-level KPI metrics
  const totalSubscribers = useMemo(() => {
    return analytics.reduce((acc, curr) => acc + (curr.count || 0), 0);
  }, [analytics]);

  const totalMonthlyRunRate = useMemo(() => {
    return plans.reduce((acc, p) => {
      const stats = analyticsMap[p.name.toLowerCase()] || analyticsMap[p.slug.toLowerCase()];
      const count = stats?.count || 0;
      return acc + count * (p.monthlyPrice || 0);
    }, 0);
  }, [plans, analyticsMap]);

  // Open Edit Modal
  const openEditModal = (plan: AdminPlanItem) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      slug: plan.slug,
      monthlyPrice: plan.monthlyPrice ?? 0,
      yearlyPrice: plan.yearlyPrice ?? 0,
      commissionPercent: plan.commissionPercent ?? 10,
      isUnlimitedProducts: plan.maxProducts === null || plan.maxProducts === undefined,
      maxProducts: plan.maxProducts || 25,
      allowCustomDomain: Boolean(plan.allowCustomDomain),
      allowProTemplates: Boolean(plan.allowProTemplates),
      allowProPlusTemplates: Boolean(plan.allowProPlusTemplates),
      allowBlog: Boolean(plan.allowBlog),
      isActive: plan.isActive !== false,
      features: Array.isArray(plan.features) ? [...plan.features] : [],
    });
    setNewFeatureText("");
    setIsModalOpen(true);
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingPlan(null);
    setFormData({
      name: "",
      slug: "",
      monthlyPrice: 0,
      yearlyPrice: 0,
      commissionPercent: 10,
      isUnlimitedProducts: true,
      maxProducts: 25,
      allowCustomDomain: false,
      allowProTemplates: false,
      allowProPlusTemplates: false,
      allowBlog: false,
      isActive: true,
      features: [
        "Storefront Subdomain",
        "Paystack Escrow Protection",
        "Product Management",
      ],
    });
    setNewFeatureText("");
    setIsModalOpen(true);
  };

  // Add Feature Tag
  const handleAddFeature = () => {
    const trimmed = newFeatureText.trim();
    if (!trimmed) return;
    if (formData.features.includes(trimmed)) {
      setNewFeatureText("");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, trimmed],
    }));
    setNewFeatureText("");
  };

  // Remove Feature Tag
  const handleRemoveFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  // Save Plan
  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      notify("Plan name is required", "error");
      return;
    }

    const payload: AdminPlanPayload = {
      name: formData.name.trim().toLowerCase(),
      slug: (formData.slug.trim() || formData.name.trim().toLowerCase().replace(/\s+/g, "-")),
      monthlyPrice: Number(formData.monthlyPrice) || 0,
      yearlyPrice: Number(formData.yearlyPrice) || 0,
      commissionPercent: Number(formData.commissionPercent) || 0,
      maxProducts: formData.isUnlimitedProducts ? null : Number(formData.maxProducts),
      allowCustomDomain: formData.allowCustomDomain,
      allowProTemplates: formData.allowProTemplates,
      allowProPlusTemplates: formData.allowProPlusTemplates,
      allowBlog: formData.allowBlog,
      isActive: formData.isActive,
      features: formData.features,
    };

    setSaving(true);
    try {
      if (editingPlan) {
        const updated = await adminPlansService.update(editingPlan._id, payload);
        setPlans((prev) =>
          prev.map((p) => (p._id === editingPlan._id ? updated : p))
        );
        notify(`Plan "${updated.name}" updated successfully.`);
      } else {
        const created = await adminPlansService.create(payload);
        setPlans((prev) => [...prev, created]);
        notify(`Plan "${created.name}" created successfully.`);
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save plan.";
      notify(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  // Quick Toggle Active Status
  const handleToggleStatus = async (plan: AdminPlanItem) => {
    const nextState = !plan.isActive;
    try {
      const updated = await adminPlansService.toggleActive(plan._id, nextState);
      setPlans((prev) =>
        prev.map((p) => (p._id === plan._id ? updated : p))
      );
      notify(`Plan "${plan.name}" is now ${nextState ? "active" : "paused"}.`);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to update plan status.";
      notify(msg, "error");
    } finally {
      setToggleTarget(null);
    }
  };

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-7 font-sans pb-12 max-w-7xl mx-auto">
      {/* Toast Alert Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between border shadow-sm transition-all animate-in fade-in slide-in-from-top-2 ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="p-1 hover:bg-black/5 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0E11] tracking-tight flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-primary" />
            Subscription Plans
          </h1>
          <p className="text-sm text-gray-500 font-normal mt-0.5">
            Configure merchant subscription tiers, platform commissions, and feature allowances.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-white border border-gray-200/80 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-2xs disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-gray-500 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
            <span>Refresh</span>
          </button>

          {canManage && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-hover transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Plan</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200/70 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">Active Subscribers</p>
            <h3 className="text-2xl font-bold text-[#0A0E11] mt-1">
              {loading ? "..." : totalSubscribers}
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Merchants currently enrolled</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary-bg flex items-center justify-center text-primary">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200/70 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">Monthly Run-Rate</p>
            <h3 className="text-2xl font-bold text-[#0A0E11] mt-1">
              {loading ? "..." : formatNaira(totalMonthlyRunRate)}
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Estimated recurring revenue</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200/70 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">Platform Commission</p>
            <h3 className="text-2xl font-bold text-[#0A0E11] mt-1">
              {loading || plans.length === 0
                ? "..."
                : `${Math.min(...plans.map((p) => p.commissionPercent))}% – ${Math.max(...plans.map((p) => p.commissionPercent))}%`}
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Tiered transaction fee range</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Percent className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white rounded-3xl p-6 border border-gray-200/70 shadow-2xs animate-pulse space-y-6"
            >
              <div className="flex justify-between items-center">
                <div className="h-6 w-24 bg-gray-100 rounded-lg" />
                <div className="h-5 w-16 bg-gray-100 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="h-8 w-32 bg-gray-100 rounded-lg" />
                <div className="h-4 w-20 bg-gray-100 rounded-lg" />
              </div>
              <div className="h-20 bg-gray-50 rounded-xl" />
              <div className="space-y-2.5 pt-4 border-t border-gray-100">
                <div className="h-4 w-full bg-gray-100 rounded-lg" />
                <div className="h-4 w-4/5 bg-gray-100 rounded-lg" />
                <div className="h-4 w-3/4 bg-gray-100 rounded-lg" />
              </div>
              <div className="h-10 w-full bg-gray-100 rounded-xl pt-2" />
            </div>
          ))}
        </div>
      )}

      {/* Plans Grid */}
      {!loading && plans.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
          <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900">No subscription plans found</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
            Get started by setting up merchant subscription tiers to define pricing, commissions, and feature limits.
          </p>
          {canManage && (
            <button
              onClick={openCreateModal}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-hover transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Plan</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => {
            const isPopular =
              plan.slug === "pro" ||
              plan.name.toLowerCase() === "pro";
            const stats =
              analyticsMap[plan.name.toLowerCase()] ||
              analyticsMap[plan.slug.toLowerCase()];
            const subscriberCount = stats?.count || 0;

            return (
              <div
                key={plan._id || plan.slug}
                className={`bg-white rounded-3xl p-6.5 border shadow-2xs flex flex-col justify-between transition-all relative ${
                  !plan.isActive
                    ? "opacity-60 bg-gray-50/70 border-gray-200"
                    : isPopular
                    ? "border-primary ring-2 ring-primary/10 shadow-sm"
                    : "border-gray-200/80 hover:border-gray-300"
                }`}
              >
                <div>
                  {/* Plan Top Label & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900 capitalize">
                        {plan.name}
                      </h3>
                      {isPopular && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary-bg text-primary flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          Popular
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          plan.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            plan.isActive ? "bg-emerald-500" : "bg-gray-400"
                          }`}
                        />
                        {plan.isActive ? "Active" : "Paused"}
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mt-4">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold text-[#0A0E11] tracking-tight">
                        {plan.monthlyPrice === 0
                          ? "₦0"
                          : formatNaira(plan.monthlyPrice)}
                      </span>
                      <span className="text-xs font-semibold text-gray-400">
                        {plan.monthlyPrice === 0 ? "forever" : "/ month"}
                      </span>
                    </div>

                    {plan.yearlyPrice > 0 ? (
                      <p className="text-xs text-gray-500 font-medium mt-1">
                        or {formatNaira(plan.yearlyPrice)} billed annually
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 font-medium mt-1">
                        Free tier access
                      </p>
                    )}
                  </div>

                  {/* Key Capabilities Pills */}
                  <div className="mt-5 grid grid-cols-2 gap-2 bg-gray-50/80 p-3 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                      <Percent className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{plan.commissionPercent}% platform fee</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                      <Package className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>
                        {plan.maxProducts === null
                          ? "Unlimited items"
                          : `Max ${plan.maxProducts} items`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                      <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>
                        {plan.allowCustomDomain
                          ? "Custom domain"
                          : "Subdomain only"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                      <Palette className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>
                        {plan.allowProPlusTemplates
                          ? "All templates"
                          : plan.allowProTemplates
                          ? "Pro templates"
                          : "Free templates"}
                      </span>
                    </div>
                  </div>

                  {/* Live Subscribers Chip */}
                  <div className="mt-4 flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <span className="text-gray-500 font-medium flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      Active Merchants
                    </span>
                    <span className="font-bold text-slate-800">
                      {subscriberCount} {subscriberCount === 1 ? "store" : "stores"}
                    </span>
                  </div>

                  {/* Feature Checklist */}
                  <div className="mt-5 pt-4 border-t border-gray-100 space-y-2.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      Included Capabilities
                    </p>
                    {plan.features && plan.features.length > 0 ? (
                      plan.features.map((feat, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 text-xs text-gray-600 font-medium leading-tight"
                        >
                          <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic">No features listed.</p>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-6 pt-4 border-t border-gray-100/80 flex items-center gap-2">
                  {canManage && (
                    <>
                      <button
                        onClick={() => openEditModal(plan)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-primary hover:text-white text-slate-800 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Config</span>
                      </button>

                      <button
                        onClick={() => setToggleTarget(plan)}
                        title={plan.isActive ? "Pause Plan" : "Activate Plan"}
                        className={`p-2.5 rounded-xl border transition-all ${
                          plan.isActive
                            ? "border-gray-200 text-gray-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50"
                            : "border-emerald-200 text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                        }`}
                      >
                        {plan.isActive ? (
                          <ToggleRight className="w-4 h-4" />
                        ) : (
                          <ToggleLeft className="w-4 h-4" />
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit / Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-2xl border border-gray-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#0A0E11]">
                  {editingPlan
                    ? `Edit Subscription Tier: ${editingPlan.name.toUpperCase()}`
                    : "Create Subscription Tier"}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Set pricing, platform commission rates, listing quotas, and perks.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSavePlan} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-800">
                {/* 1. Basic Plan Info */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Tier Identity
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Plan Display Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="e.g. Pro, Growth, Enterprise"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/10 text-xs text-gray-900 placeholder:text-gray-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        URL / System Identifier (Slug)
                      </label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) =>
                          setFormData({ ...formData, slug: e.target.value })
                        }
                        placeholder="e.g. pro, pro-plus"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/10 text-xs text-gray-900 placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Pricing & Commission */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Pricing & Platform Fee
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Monthly Price (₦)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={formData.monthlyPrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            monthlyPrice: Number(e.target.value),
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/10 text-xs text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Yearly Price (₦)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={formData.yearlyPrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            yearlyPrice: Number(e.target.value),
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/10 text-xs text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Platform Commission (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        step="0.5"
                        value={formData.commissionPercent}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            commissionPercent: Number(e.target.value),
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/10 text-xs text-gray-900"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Product Listing Limit */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Product Listing Quota
                  </h4>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                    <div>
                      <p className="text-xs font-semibold text-gray-900">
                        Listing Limit Policy
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {formData.isUnlimitedProducts
                          ? "Merchants can list an unlimited number of products"
                          : `Limited to a maximum of ${formData.maxProducts} active products`}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isUnlimitedProducts}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isUnlimitedProducts: e.target.checked,
                            })
                          }
                          className="w-4 h-4 rounded text-primary border-gray-300 focus:ring-primary"
                        />
                        <span className="text-xs font-semibold text-gray-700">
                          Unlimited
                        </span>
                      </label>

                      {!formData.isUnlimitedProducts && (
                        <div className="w-28">
                          <input
                            type="number"
                            min="1"
                            value={formData.maxProducts}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                maxProducts: Math.max(1, Number(e.target.value)),
                              })
                            }
                            placeholder="Limit"
                            className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-gray-200 text-xs text-gray-900"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. Feature Entitlements */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Feature Allowances & Permissions
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors bg-white">
                      <div>
                        <p className="text-xs font-semibold text-gray-900">
                          Custom Domain Mapping
                        </p>
                        <p className="text-[11px] text-gray-500">
                          Allow yourname.com mapping
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.allowCustomDomain}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            allowCustomDomain: e.target.checked,
                          })
                        }
                        className="w-4 h-4 rounded text-primary border-gray-300 focus:ring-primary"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors bg-white">
                      <div>
                        <p className="text-xs font-semibold text-gray-900">
                          Storefront Blog
                        </p>
                        <p className="text-[11px] text-gray-500">
                          Publish articles & content
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.allowBlog}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            allowBlog: e.target.checked,
                          })
                        }
                        className="w-4 h-4 rounded text-primary border-gray-300 focus:ring-primary"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors bg-white">
                      <div>
                        <p className="text-xs font-semibold text-gray-900">
                          Pro Store Templates
                        </p>
                        <p className="text-[11px] text-gray-500">
                          Unlock pro layout themes
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.allowProTemplates}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            allowProTemplates: e.target.checked,
                          })
                        }
                        className="w-4 h-4 rounded text-primary border-gray-300 focus:ring-primary"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors bg-white">
                      <div>
                        <p className="text-xs font-semibold text-gray-900">
                          Pro+ Luxury Templates
                        </p>
                        <p className="text-[11px] text-gray-500">
                          Unlock all premium themes
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.allowProPlusTemplates}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            allowProPlusTemplates: e.target.checked,
                          })
                        }
                        className="w-4 h-4 rounded text-primary border-gray-300 focus:ring-primary"
                      />
                    </label>
                  </div>
                </div>

                {/* 5. Marketing Features Checklist */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Marketing Highlights (Bullet Points)
                  </h4>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newFeatureText}
                        onChange={(e) => setNewFeatureText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddFeature();
                          }
                        }}
                        placeholder="Add a bullet point feature and press Enter..."
                        className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-hidden focus:border-primary text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddFeature}
                        className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-slate-800 text-xs font-semibold transition-colors"
                      >
                        Add
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {formData.features.map((feat, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-100 text-gray-800 text-xs font-medium"
                        >
                          <span>{feat}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(idx)}
                            className="text-gray-400 hover:text-rose-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 6. Active Status */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="text-xs font-semibold text-gray-900">
                      Tier Availability
                    </p>
                    <p className="text-[11px] text-gray-500">
                      When active, merchants can view and subscribe to this tier.
                    </p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isActive: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded text-primary border-gray-300 focus:ring-primary"
                    />
                    <span className="text-xs font-semibold text-gray-800">
                      {formData.isActive ? "Active" : "Paused"}
                    </span>
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-hover transition-all shadow-xs disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Tier</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Toggle Dialog */}
      {toggleTarget && (
        <ConfirmDialog
          isOpen={true}
          title={toggleTarget.isActive ? "Pause Subscription Plan" : "Activate Subscription Plan"}
          description={`Are you sure you want to ${
            toggleTarget.isActive ? "pause" : "activate"
          } the "${toggleTarget.name}" plan? ${
            toggleTarget.isActive
              ? "New merchants will not be able to select this tier until reactivated."
              : "Merchants will immediately be able to upgrade or subscribe to this tier."
          }`}
          confirmLabel={toggleTarget.isActive ? "Pause Plan" : "Activate Plan"}
          cancelLabel="Cancel"
          isDestructive={toggleTarget.isActive}
          onConfirm={() => handleToggleStatus(toggleTarget)}
          onClose={() => setToggleTarget(null)}
        />
      )}
    </div>
  );
}
