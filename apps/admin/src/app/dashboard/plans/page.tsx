"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  CreditCard,
  Check,
  Plus,
  RefreshCw,
  Edit2,
  Sparkles,
  Users,
  Percent,
  Layers,
  Globe,
  FileText,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
  Shield,
  Trash2,
  Info,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import {
  adminPlansService,
  authService,
  type SubscriptionPlanItem,
  type PlanAnalyticsItem,
} from "@/lib/api";
import { hasPermission } from "@/lib/permissions";

export default function PlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlanItem[]>([]);
  const [analytics, setAnalytics] = useState<PlanAnalyticsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [billingCycleView, setBillingCycleView] = useState<"monthly" | "yearly">("monthly");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Edit Modal State
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlanItem | null>(null);
  const [editForm, setEditForm] = useState<{
    monthlyPrice: number;
    yearlyPrice: number;
    commissionPercent: number;
    maxProducts: number | null;
    isUnlimitedProducts: boolean;
    allowCustomDomain: boolean;
    allowProTemplates: boolean;
    allowProPlusTemplates: boolean;
    allowBlog: boolean;
    isActive: boolean;
    features: string[];
    newFeatureText: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  // Permissions
  const user = authService.getUser();
  const canManage = hasPermission(user?.adminRole, "plans.manage");

  const notify = (message: string, type: "success" | "error" = "success") => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const fetchPlansData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [plansData, analyticsData] = await Promise.all([
        adminPlansService.list(),
        adminPlansService.getAnalytics().catch(() => []),
      ]);
      setPlans(plansData || []);
      setAnalytics(analyticsData || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load subscription plans.";
      notify(message, "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPlansData();
  }, [fetchPlansData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPlansData(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (plan: SubscriptionPlanItem) => {
    if (!canManage) {
      notify("You do not have permission to modify subscription plans.", "error");
      return;
    }
    setEditingPlan(plan);
    setEditForm({
      monthlyPrice: plan.monthlyPrice,
      yearlyPrice: plan.yearlyPrice,
      commissionPercent: plan.commissionPercent,
      maxProducts: plan.maxProducts,
      isUnlimitedProducts: plan.maxProducts === null,
      allowCustomDomain: Boolean(plan.allowCustomDomain),
      allowProTemplates: Boolean(plan.allowProTemplates),
      allowProPlusTemplates: Boolean(plan.allowProPlusTemplates),
      allowBlog: Boolean(plan.allowBlog),
      isActive: Boolean(plan.isActive),
      features: [...(plan.features || [])],
      newFeatureText: "",
    });
  };

  const handleCloseEdit = () => {
    setEditingPlan(null);
    setEditForm(null);
  };

  // Quick toggle active state
  const handleTogglePlanActive = async (plan: SubscriptionPlanItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canManage) {
      notify("You do not have permission to modify plans.", "error");
      return;
    }

    const nextState = !plan.isActive;
    try {
      await adminPlansService.toggleActive(plan._id, nextState);
      setPlans((prev) =>
        prev.map((p) => (p._id === plan._id ? { ...p, isActive: nextState } : p))
      );
      notify(`${plan.name.toUpperCase()} plan is now ${nextState ? "active" : "inactive"}.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update plan status.";
      notify(message, "error");
    }
  };

  // Add Feature bullet
  const handleAddFeature = () => {
    if (!editForm || !editForm.newFeatureText.trim()) return;
    const trimmed = editForm.newFeatureText.trim();
    if (editForm.features.includes(trimmed)) return;
    setEditForm({
      ...editForm,
      features: [...editForm.features, trimmed],
      newFeatureText: "",
    });
  };

  // Remove Feature bullet
  const handleRemoveFeature = (index: number) => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      features: editForm.features.filter((_, i) => i !== index),
    });
  };

  // Save Plan Changes
  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan || !editForm) return;
    if (!canManage) {
      notify("Permission denied.", "error");
      return;
    }

    setSaving(true);
    try {
      const payload: Partial<SubscriptionPlanItem> = {
        monthlyPrice: Number(editForm.monthlyPrice) || 0,
        yearlyPrice: Number(editForm.yearlyPrice) || 0,
        commissionPercent: Number(editForm.commissionPercent) || 0,
        maxProducts: editForm.isUnlimitedProducts ? null : Number(editForm.maxProducts) || 0,
        allowCustomDomain: editForm.allowCustomDomain,
        allowProTemplates: editForm.allowProTemplates,
        allowProPlusTemplates: editForm.allowProPlusTemplates,
        allowBlog: editForm.allowBlog,
        isActive: editForm.isActive,
        features: editForm.features.filter(Boolean),
      };

      const updated = await adminPlansService.update(editingPlan._id, payload);
      setPlans((prev) =>
        prev.map((p) => (p._id === editingPlan._id ? { ...p, ...updated } : p))
      );
      notify(`${editingPlan.name.toUpperCase()} plan updated successfully.`);
      handleCloseEdit();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save plan changes.";
      notify(message, "error");
    } finally {
      setSaving(false);
    }
  };

  // Aggregates & KPI calculations
  const totalSubscribers = useMemo(() => {
    return plans.reduce((acc, p) => acc + (p.activeSubscribers || 0), 0);
  }, [plans]);

  const totalMonthlyRevenue = useMemo(() => {
    return plans.reduce((acc, p) => {
      // Estimate based on active subscribers & monthly price
      return acc + (p.activeSubscribers || 0) * (p.monthlyPrice || 0);
    }, 0);
  }, [plans]);

  const formatNaira = (val: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Toast Feedback Notification */}
      {feedback && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 duration-300 ${
            feedback.type === "success"
              ? "bg-emerald-900/90 text-white border-emerald-700/50 shadow-emerald-950/20"
              : "bg-red-900/90 text-white border-red-700/50 shadow-red-950/20"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <p className="text-xs font-semibold">{feedback.message}</p>
          <button
            onClick={() => setFeedback(null)}
            className="p-1 text-white/60 hover:text-white rounded-lg transition-colors ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0A0E11] tracking-tight">
            Subscription Plans & Pricing Tiers
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
            Configure merchant subscription tiers, commission rates, and feature entitlements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Segmented Billing Toggle */}
          <div className="bg-gray-100/90 p-1 rounded-full flex items-center border border-gray-200/70 text-xs font-bold">
            <button
              onClick={() => setBillingCycleView("monthly")}
              className={`px-3.5 py-1.5 rounded-full transition-all ${
                billingCycleView === "monthly"
                  ? "bg-white text-[#0A0E11] shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycleView("yearly")}
              className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                billingCycleView === "yearly"
                  ? "bg-white text-[#0A0E11] shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <span>Yearly</span>
              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-full font-bold">
                Save
              </span>
            </button>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 rounded-full border border-gray-200/80 bg-white hover:bg-gray-50 text-gray-600 transition-all shadow-2xs disabled:opacity-50"
            title="Refresh plans data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-primary" : ""}`} />
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200/70 shadow-2xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-primary-bg text-primary flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Active Merchants
            </span>
            <p className="text-xl font-extrabold text-[#0A0E11] mt-0.5">
              {loading ? "..." : totalSubscribers}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200/70 shadow-2xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Est. Monthly Run-Rate
            </span>
            <p className="text-xl font-extrabold text-[#0A0E11] mt-0.5">
              {loading ? "..." : formatNaira(totalMonthlyRevenue)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200/70 shadow-2xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Commission Range
            </span>
            <p className="text-xl font-extrabold text-[#0A0E11] mt-0.5">
              5% - 10%
            </p>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 border border-gray-200/70 shadow-xs animate-pulse space-y-4"
            >
              <div className="h-6 bg-gray-100 rounded-md w-1/3" />
              <div className="h-10 bg-gray-100 rounded-md w-2/3" />
              <div className="h-4 bg-gray-100 rounded-md w-1/2" />
              <div className="space-y-2 pt-6">
                <div className="h-4 bg-gray-100 rounded-md w-full" />
                <div className="h-4 bg-gray-100 rounded-md w-5/6" />
                <div className="h-4 bg-gray-100 rounded-md w-4/6" />
              </div>
              <div className="h-10 bg-gray-100 rounded-full w-full mt-6" />
            </div>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/70 shadow-xs">
          <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">No subscription plans found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-4">
            Could not retrieve plans. Click below to initialize standard pricing tiers.
          </p>
          <button
            onClick={handleRefresh}
            className="px-5 py-2 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-all"
          >
            Load Default Plans
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isPro = plan.slug === "pro";
            const isProPlus = plan.slug === "pro-plus";
            const isFree = plan.slug === "free";

            const displayPrice =
              isFree
                ? "₦0"
                : billingCycleView === "yearly"
                ? `${formatNaira(plan.yearlyPrice)} / yr`
                : `${formatNaira(plan.monthlyPrice)} / mo`;

            const savingsPercent =
              !isFree && plan.monthlyPrice > 0 && plan.yearlyPrice > 0
                ? Math.max(
                    0,
                    Math.round(
                      ((plan.monthlyPrice * 12 - plan.yearlyPrice) /
                        (plan.monthlyPrice * 12)) *
                        100
                    )
                  )
                : 0;

            return (
              <div
                key={plan._id || plan.slug}
                className={`bg-white rounded-3xl p-6 border shadow-xs flex flex-col justify-between transition-all duration-200 relative ${
                  isPro
                    ? "border-primary ring-2 ring-primary/15 shadow-sm"
                    : isProPlus
                    ? "border-amber-400/80 ring-2 ring-amber-400/10 shadow-sm"
                    : "border-gray-200/80"
                } ${!plan.isActive ? "opacity-70 bg-gray-50/50" : ""}`}
              >
                <div>
                  {/* Top Bar: Title, Badge & Active Toggle */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black text-[#0A0E11] tracking-tight uppercase">
                        {plan.name}
                      </h3>
                      {isPro && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-primary-bg text-primary border border-primary/20">
                          Popular
                        </span>
                      )}
                      {isProPlus && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-300">
                          Top Tier
                        </span>
                      )}
                    </div>

                    {/* Active Status Badge / Quick Toggle */}
                    <button
                      onClick={(e) => handleTogglePlanActive(plan, e)}
                      disabled={!canManage}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                        plan.isActive
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      } ${!canManage ? "cursor-default opacity-80" : "cursor-pointer"}`}
                      title={canManage ? "Toggle active state for new subscriptions" : undefined}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          plan.isActive ? "bg-emerald-500 animate-pulse" : "bg-gray-400"
                        }`}
                      />
                      <span>{plan.isActive ? "Active" : "Inactive"}</span>
                    </button>
                  </div>

                  {/* Pricing Display */}
                  <div className="mt-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-[#0A0E11] tracking-tight">
                        {displayPrice}
                      </span>
                    </div>

                    {billingCycleView === "yearly" && savingsPercent > 0 && (
                      <p className="text-[11px] font-bold text-emerald-600 mt-1">
                        Saves ~{savingsPercent}% compared to monthly billing
                      </p>
                    )}
                  </div>

                  {/* Key Metrics Chips */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700">
                      <Percent className="w-3.5 h-3.5 text-primary" />
                      <span>{plan.commissionPercent}% Commission</span>
                    </span>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700">
                      <Users className="w-3.5 h-3.5 text-gray-500" />
                      <span>{plan.activeSubscribers ?? 0} active merchants</span>
                    </span>
                  </div>

                  {/* Core Platform Entitlements Matrix */}
                  <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100/80 flex flex-col justify-center">
                      <span className="text-[10px] uppercase font-bold text-gray-400">
                        Products Limit
                      </span>
                      <span className="text-xs font-bold text-[#0A0E11] mt-0.5">
                        {plan.maxProducts === null ? "Unlimited" : `Up to ${plan.maxProducts}`}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100/80 flex flex-col justify-center">
                      <span className="text-[10px] uppercase font-bold text-gray-400">
                        Custom Domain
                      </span>
                      <span className="text-xs font-bold text-[#0A0E11] mt-0.5">
                        {plan.allowCustomDomain ? "Supported" : "Subdomain Only"}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100/80 flex flex-col justify-center">
                      <span className="text-[10px] uppercase font-bold text-gray-400">
                        Template Tier
                      </span>
                      <span className="text-xs font-bold text-[#0A0E11] mt-0.5">
                        {plan.allowProPlusTemplates
                          ? "All Templates"
                          : plan.allowProTemplates
                          ? "Free + Pro"
                          : "Free Only"}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100/80 flex flex-col justify-center">
                      <span className="text-[10px] uppercase font-bold text-gray-400">
                        Store Blog
                      </span>
                      <span className="text-xs font-bold text-[#0A0E11] mt-0.5">
                        {plan.allowBlog ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>

                  {/* Features Bullet List */}
                  <div className="mt-5 pt-4 border-t border-gray-100 space-y-2.5">
                    {plan.features && plan.features.length > 0 ? (
                      plan.features.map((feat, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 text-xs text-gray-600 font-medium"
                        >
                          <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span className="leading-snug">{feat}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic">No feature bullets specified.</p>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="mt-8 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleOpenEdit(plan)}
                    disabled={!canManage}
                    className={`w-full py-2.5 px-4 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      isPro
                        ? "bg-primary text-white hover:bg-primary-hover shadow-xs"
                        : "bg-gray-100 hover:bg-gray-200 text-slate-800"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Plan Config</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Plan Modal */}
      {editingPlan && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={handleCloseEdit}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          />

          <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto no-scrollbar">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
                  Plan Configuration
                </span>
                <h3 className="text-lg font-black text-[#0A0E11] tracking-tight">
                  Edit {editingPlan.name.toUpperCase()} Plan
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseEdit}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="mt-6 space-y-6">
              {/* Section 1: Pricing & Commission */}
              <div>
                <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-3">
                  1. Pricing & Commission
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Monthly Price (₦)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editForm.monthlyPrice}
                      onChange={(e) =>
                        setEditForm({ ...editForm, monthlyPrice: Number(e.target.value) })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Yearly Price (₦)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editForm.yearlyPrice}
                      onChange={(e) =>
                        setEditForm({ ...editForm, yearlyPrice: Number(e.target.value) })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Commission (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={editForm.commissionPercent}
                      onChange={(e) =>
                        setEditForm({ ...editForm, commissionPercent: Number(e.target.value) })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Entitlements & Platform Limits */}
              <div>
                <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-3">
                  2. Feature Entitlements & Limits
                </h4>
                <div className="space-y-3">
                  {/* Products Limit */}
                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/70 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold text-gray-900">Product Listings Limit</p>
                      <p className="text-[11px] text-gray-500">
                        {editForm.isUnlimitedProducts
                          ? "Merchants can list unlimited products."
                          : `Capped at max ${editForm.maxProducts || 0} products.`}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {!editForm.isUnlimitedProducts && (
                        <input
                          type="number"
                          min={1}
                          value={editForm.maxProducts ?? 25}
                          onChange={(e) =>
                            setEditForm({ ...editForm, maxProducts: Number(e.target.value) })
                          }
                          className="w-20 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-center bg-white"
                        />
                      )}
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editForm.isUnlimitedProducts}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              isUnlimitedProducts: e.target.checked,
                              maxProducts: e.target.checked ? null : 25,
                            })
                          }
                          className="rounded text-primary focus:ring-primary/20"
                        />
                        <span>Unlimited</span>
                      </label>
                    </div>
                  </div>

                  {/* Custom Domain */}
                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/70 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-900">Custom Domain Mapping</p>
                      <p className="text-[11px] text-gray-500">
                        Allow sellers to map domains like yourstore.com
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.allowCustomDomain}
                        onChange={(e) =>
                          setEditForm({ ...editForm, allowCustomDomain: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5.5 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  {/* Pro Templates */}
                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/70 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-900">Access to Pro Templates</p>
                      <p className="text-[11px] text-gray-500">
                        Unlock modern Pro storefront templates
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.allowProTemplates}
                        onChange={(e) =>
                          setEditForm({ ...editForm, allowProTemplates: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5.5 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  {/* Pro+ Templates */}
                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/70 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-900">Access to Pro+ Exclusive Templates</p>
                      <p className="text-[11px] text-gray-500">
                        Unlock luxury Pro+ designer templates
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.allowProPlusTemplates}
                        onChange={(e) =>
                          setEditForm({ ...editForm, allowProPlusTemplates: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5.5 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  {/* Blog */}
                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/70 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-900">Store Blog & Articles</p>
                      <p className="text-[11px] text-gray-500">
                        Allow merchant blog posting for organic SEO
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.allowBlog}
                        onChange={(e) =>
                          setEditForm({ ...editForm, allowBlog: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5.5 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Section 3: Feature Bullet Points */}
              <div>
                <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-3">
                  3. Marketing Feature Highlights
                </h4>
                <div className="space-y-2">
                  {editForm.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 border border-gray-200/70 text-xs text-gray-800"
                    >
                      <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="flex-1 font-medium">{feat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded-md hover:bg-white transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Add New Feature Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="e.g. Priority 24/7 WhatsApp Support"
                      value={editForm.newFeatureText}
                      onChange={(e) =>
                        setEditForm({ ...editForm, newFeatureText: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddFeature();
                        }
                      }}
                      className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      disabled={!editForm.newFeatureText.trim()}
                      className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold flex items-center gap-1 transition-all disabled:opacity-40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 4: Active Visibility */}
              <div className="pt-2">
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/70 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-900">Plan Visibility Status</p>
                    <p className="text-[11px] text-gray-500">
                      When active, sellers can view and subscribe to this tier.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.isActive}
                      onChange={(e) =>
                        setEditForm({ ...editForm, isActive: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5.5 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-primary hover:bg-primary-hover transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin text-white" />}
                  <span>Save Plan Config</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
