"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  GripVertical,
  Laptop,
  Layers,
  Palette,
  Plus,
  Save,
  Sliders,
  Smartphone,
  Tablet,
  Trash2,
  X,
} from "lucide-react";
import {
  adminTemplateSectionsService,
  adminTemplatesService,
  type AdminTemplateItem,
  type TemplateColorScheme,
  type TemplateSectionItem,
} from "@/lib/api";
import { authService } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";

const TIERS = ["free", "pro", "pro+"] as const;
const CATEGORIES = ["general", "fashion", "electronics", "beauty", "art", "marketing"];

const HEADER_VARIANTS = [
  { id: "classic", name: "Classic", desc: "Logo left, links center, cart right" },
  { id: "topbar", name: "Top Bar", desc: "Utility contact strip above main header" },
  { id: "centered", name: "Centered", desc: "Centered logo with full navigation row" },
  { id: "market", name: "Market", desc: "Search-first header with category rail" },
  { id: "left-nav", name: "Left Navigation", desc: "Vertical left navigation bar" },
];

const FOOTER_VARIANTS = [
  { id: "simple", name: "Simple", desc: "Clean compact single row footer" },
  { id: "columns", name: "Columns", desc: "Multi-column catalog links footer" },
  { id: "dark", name: "Dark", desc: "High-contrast dark secondary footer" },
];

const SHOP_LAYOUTS = [
  { id: "grid-2", name: "2 Columns", desc: "Large visual product tiles" },
  { id: "grid-3", name: "3 Columns", desc: "Standard balanced catalog grid" },
  { id: "grid-4", name: "4 Columns", desc: "High-density marketplace grid" },
  { id: "list", name: "List", desc: "Horizontal rows with product summaries" },
  { id: "boxed-sidebar", name: "Boxed + Sidebar", desc: "Left category filter sidebar" },
];

const PRODUCT_LAYOUTS = [
  { id: "gallery", name: "Gallery", desc: "Image thumbnails column beside details" },
  { id: "centered", name: "Centered", desc: "Clean stacked centered buy box" },
  { id: "sticky", name: "Sticky Buy Box", desc: "Purchase panel sticks on scroll" },
  { id: "extended", name: "Extended", desc: "Wide gallery with full width specs" },
];

const CARD_VARIANTS = [
  { id: "minimal", name: "Minimal", desc: "Clean price and title" },
  { id: "overlay", name: "Overlay", desc: "Hover action overlay" },
  { id: "boxed", name: "Boxed", desc: "Padded card with border" },
];

const BUILTIN_SECTION_OPTIONS = [
  { type: "hero", name: "Hero Banner", desc: "Headline, CTA, and background image" },
  { type: "hero-slider", name: "Hero Slider", desc: "Multi-slide hero carousel" },
  { type: "banner-grid", name: "Banner Grid", desc: "2, 3, or 4 category promo tiles" },
  { type: "featured-products", name: "Featured Products Rail", desc: "Product grid highlighting items" },
  { type: "new-arrivals", name: "New Arrivals Rail", desc: "Latest inventory drops" },
  { type: "best-sellers", name: "Best Sellers Rail", desc: "Top selling items" },
  { type: "categories", name: "Category Pills Rail", desc: "Horizontal category filters" },
  { type: "stats", name: "Trust & Stats Bar", desc: "Trust metrics ribbon" },
  { type: "features", name: "Feature Cards", desc: "Value proposition tiles" },
  { type: "how-it-works", name: "How It Works", desc: "Numbered step guide" },
  { type: "split-story", name: "Editorial Story Showcase", desc: "2-column narrative with image" },
  { type: "icon-boxes", name: "Icon Service Boxes", desc: "Shipping & escrow guarantees" },
  { type: "brands", name: "Brand Logos Strip", desc: "Partner badges strip" },
  { type: "lookbook-grid", name: "Lookbook Grid Mosaic", desc: "Editorial visual showcase" },
  { type: "testimonials", name: "Customer Testimonials", desc: "Quotes and 5-star reviews" },
  { type: "cta-banner", name: "CTA Action Banner", desc: "High-contrast action banner" },
  { type: "newsletter", name: "Newsletter Subscription", desc: "Email capture box" },
];

export default function TemplateStudioPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const templateId = params.id;

  const [template, setTemplate] = useState<AdminTemplateItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Active Tab & Viewport
  const [activeTab, setActiveTab] = useState<"meta" | "layouts" | "sections">("sections");
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [previewView, setPreviewView] = useState<"home" | "shop" | "product">("home");

  // Editable Template Fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [tier, setTier] = useState<"free" | "pro" | "pro+">("free");
  const [category, setCategory] = useState("general");
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Colors
  const [colors, setColors] = useState<TemplateColorScheme>({
    primary: "#800A1D",
    secondary: "#0A0E11",
    accent: "#FAD4D8",
    background: "#FFFFFF",
    text: "#0A0E11",
  });

  // Theme Settings
  const [themeSettings, setThemeSettings] = useState({
    headerVariant: "classic",
    footerVariant: "simple",
    shopLayout: "grid-3",
    productLayout: "gallery",
    productCardVariant: "minimal",
    cardRadius: "16px",
    buttonRadius: "9999px",
  });

  // Sections
  const [sections, setSections] = useState<Array<Record<string, any>>>([]);
  const [selectedSecIndex, setSelectedSecIndex] = useState<number | null>(null);

  // Add Section Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [librarySections, setLibrarySections] = useState<TemplateSectionItem[]>([]);

  // Drag & drop
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const user = authService.getUser();
  const canManage = hasPermission(user?.adminRole, "templates.manage");

  const notify = (message: string, type: "success" | "error" = "success") => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const loadTemplate = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminTemplatesService.get(templateId);
      setTemplate(data);
      setName(data.name);
      setSlug(data.slug);
      setDescription(data.description || "");
      setTier(data.tier);
      setCategory(data.category || "general");
      setPreviewImageUrl(data.previewImageUrl || "");
      setIsActive(data.isActive);
      if (data.defaultColorScheme) {
        setColors(data.defaultColorScheme);
      }
      if (data.themeSettings) {
        setThemeSettings((prev) => ({ ...prev, ...(data.themeSettings as any) }));
      }
      if (Array.isArray(data.defaultSections)) {
        setSections(data.defaultSections);
      }
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : "Failed to load template", "error");
    } finally {
      setLoading(false);
    }
  }, [templateId]);

  useEffect(() => {
    loadTemplate();
    adminTemplateSectionsService.list().then((list) => setLibrarySections(list || [])).catch(() => {});
  }, [loadTemplate]);

  // Section Handlers
  const handleToggleSec = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSections((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, isEnabled: s.isEnabled === false ? true : false } : s)),
    );
  };

  const handleRemoveSec = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSections((prev) => prev.filter((_, i) => i !== idx));
    if (selectedSecIndex === idx) setSelectedSecIndex(null);
  };

  const handleMoveUp = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (idx === 0) return;
    setSections((prev) => {
      const next = [...prev];
      const temp = next[idx - 1];
      next[idx - 1] = next[idx];
      next[idx] = temp;
      return next.map((s, i) => ({ ...s, order: i }));
    });
  };

  const handleMoveDown = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (idx === sections.length - 1) return;
    setSections((prev) => {
      const next = [...prev];
      const temp = next[idx + 1];
      next[idx + 1] = next[idx];
      next[idx] = temp;
      return next.map((s, i) => ({ ...s, order: i }));
    });
  };

  const handleAddBuiltin = (opt: (typeof BUILTIN_SECTION_OPTIONS)[0]) => {
    const newSec = {
      id: `sec_${opt.type}_${Date.now()}`,
      type: opt.type,
      name: opt.name,
      isEnabled: true,
      order: sections.length,
      data: { heading: opt.name },
    };
    setSections((prev) => [...prev, newSec]);
    setShowAddModal(false);
  };

  const handleAddLibrary = (libSec: TemplateSectionItem) => {
    const newSec = {
      id: `sec_${libSec.type || "html-block"}_${Date.now()}`,
      type: libSec.kind === "html" ? "html-block" : libSec.type,
      name: libSec.name,
      variant: libSec.variant || undefined,
      isEnabled: true,
      order: sections.length,
      data: {
        ...(libSec.defaultData || {}),
        html: libSec.html,
        css: libSec.css,
        fieldSchema: libSec.fieldSchema,
        libraryKey: libSec.key,
      },
    };
    setSections((prev) => [...prev, newSec]);
    setShowAddModal(false);
  };

  const handleSaveTemplate = async () => {
    if (!name.trim()) {
      notify("Template name cannot be empty.", "error");
      return;
    }
    setSaving(true);
    try {
      await adminTemplatesService.update(templateId, {
        name: name.trim(),
        slug: slug.trim() || undefined,
        description: description.trim(),
        tier,
        category,
        previewImageUrl: previewImageUrl.trim(),
        isActive,
        defaultColorScheme: colors,
        themeSettings,
        defaultSections: sections,
      });
      notify("Template saved successfully!", "success");
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : "Failed to save template", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-xs text-neutral-500">
        Loading template studio...
      </div>
    );
  }

  const previewStyle = {
    ["--store-primary" as string]: colors.primary,
    ["--store-secondary" as string]: colors.secondary,
    ["--store-accent" as string]: colors.accent,
    ["--store-bg" as string]: colors.background,
    ["--store-text" as string]: colors.text,
    ["--store-card-radius" as string]: themeSettings.cardRadius,
    ["--store-button-radius" as string]: themeSettings.buttonRadius,
    backgroundColor: colors.background,
    color: colors.text,
  } as React.CSSProperties;

  const viewportWidth =
    viewport === "mobile"
      ? "max-w-[380px] border-[6px] border-neutral-800 rounded-[36px] shadow-2xl my-4"
      : viewport === "tablet"
      ? "max-w-[760px] border-[4px] border-neutral-700 rounded-[24px] shadow-2xl my-4"
      : "w-full rounded-2xl shadow-sm border border-neutral-300";

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden -m-6 bg-neutral-900 text-neutral-100">
      {/* Top Studio Toolbar */}
      <div className="h-14 bg-neutral-950 border-b border-neutral-800 px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/templates"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-white truncate max-w-[160px] sm:max-w-none">
              {name || "Template Studio"}
            </span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary-light border border-primary/40">
              {tier.toUpperCase()}
            </span>
          </div>
        </div>

        {/* View Switchers */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1 bg-neutral-900 border border-neutral-800 p-1 rounded-xl text-xs font-semibold">
            {(
              [
                { id: "home", label: "Home" },
                { id: "shop", label: "Shop Grid" },
                { id: "product", label: "Product Detail" },
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                type="button"
                className={`px-3 py-1 rounded-lg transition-colors ${
                  previewView === p.id
                    ? "bg-neutral-800 text-white font-bold shadow-xs"
                    : "text-neutral-400 hover:text-white"
                }`}
                onClick={() => setPreviewView(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-1 bg-neutral-900 border border-neutral-800 p-1 rounded-xl">
            <button
              type="button"
              className={`p-1.5 rounded-lg transition-colors ${
                viewport === "desktop" ? "bg-neutral-800 text-white" : "text-neutral-400 hover:text-white"
              }`}
              onClick={() => setViewport("desktop")}
            >
              <Laptop className="w-4 h-4" />
            </button>
            <button
              type="button"
              className={`p-1.5 rounded-lg transition-colors ${
                viewport === "tablet" ? "bg-neutral-800 text-white" : "text-neutral-400 hover:text-white"
              }`}
              onClick={() => setViewport("tablet")}
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              type="button"
              className={`p-1.5 rounded-lg transition-colors ${
                viewport === "mobile" ? "bg-neutral-800 text-white" : "text-neutral-400 hover:text-white"
              }`}
              onClick={() => setViewport("mobile")}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-2">
          {feedback && (
            <span
              className={`text-xs font-semibold hidden lg:inline ${
                feedback.type === "success" ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {feedback.message}
            </span>
          )}
          {canManage && (
            <button
              type="button"
              onClick={handleSaveTemplate}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
              style={{ backgroundColor: "var(--color-primary, #800A1D)" }}
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? "Saving..." : "Save Template"}
            </button>
          )}
        </div>
      </div>

      {/* Main Studio Split Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Settings Sidebar */}
        <div className="w-80 sm:w-96 bg-white text-neutral-900 border-r border-border flex flex-col shrink-0 z-20 shadow-xl overflow-hidden">
          {/* Subtabs */}
          <div className="flex border-b border-border bg-neutral-50 shrink-0 text-xs font-bold">
            <button
              type="button"
              className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                activeTab === "sections" ? "border-primary text-primary bg-white" : "border-transparent text-neutral-500"
              }`}
              onClick={() => setActiveTab("sections")}
            >
              <Layers className="w-3.5 h-3.5" />
              Sections ({sections.length})
            </button>
            <button
              type="button"
              className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                activeTab === "layouts" ? "border-primary text-primary bg-white" : "border-transparent text-neutral-500"
              }`}
              onClick={() => setActiveTab("layouts")}
            >
              <Sliders className="w-3.5 h-3.5" />
              Layouts
            </button>
            <button
              type="button"
              className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                activeTab === "meta" ? "border-primary text-primary bg-white" : "border-transparent text-neutral-500"
              }`}
              onClick={() => setActiveTab("meta")}
            >
              <Palette className="w-3.5 h-3.5" />
              Palette & Meta
            </button>
          </div>

          {/* Sidebar Tab Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 text-xs">
            {/* TAB 1: SECTIONS */}
            {activeTab === "sections" && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900">Default Sections</h3>
                    <p className="text-xs text-neutral-500">
                      Sections cloned when merchants apply this template.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="p-1.5 rounded-lg bg-primary text-white hover:opacity-90 transition-opacity shadow-xs"
                    title="Add section"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {sections.map((sec, idx) => (
                    <div
                      key={sec.id || idx}
                      draggable
                      onDragStart={() => setDraggedIndex(idx)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (draggedIndex === null || draggedIndex === idx) return;
                        setSections((prev) => {
                          const next = [...prev];
                          const item = next[draggedIndex];
                          next.splice(draggedIndex, 1);
                          next.splice(idx, 0, item);
                          setDraggedIndex(idx);
                          return next.map((s, i) => ({ ...s, order: i }));
                        });
                      }}
                      onDragEnd={() => setDraggedIndex(null)}
                      onClick={() => setSelectedSecIndex(selectedSecIndex === idx ? null : idx)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                        selectedSecIndex === idx
                          ? "border-primary bg-primary-light/10 shadow-xs"
                          : sec.isEnabled !== false
                          ? "border-border bg-white hover:border-neutral-400"
                          : "border-dashed border-neutral-300 bg-neutral-50 opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <GripVertical className="w-4 h-4 text-neutral-400 cursor-grab" />
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-neutral-900 truncate">
                              {sec.name || sec.type}
                            </p>
                            <p className="text-[10px] text-neutral-400 capitalize truncate">
                              {sec.type} {sec.variant ? `• ${sec.variant}` : ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => handleMoveUp(idx, e)}
                            disabled={idx === 0}
                            className="p-1 text-neutral-400 hover:text-neutral-700 disabled:opacity-20"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleMoveDown(idx, e)}
                            disabled={idx === sections.length - 1}
                            className="p-1 text-neutral-400 hover:text-neutral-700 disabled:opacity-20"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleToggleSec(idx, e)}
                            className="p-1 text-neutral-400 hover:text-neutral-700"
                          >
                            {sec.isEnabled !== false ? (
                              <Eye className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleRemoveSec(idx, e)}
                            className="p-1 text-neutral-400 hover:text-danger"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Expandable Data Editor */}
                      {selectedSecIndex === idx && (
                        <div className="pt-2 border-t border-border mt-1">
                          <label className="font-semibold text-neutral-700 block mb-1">
                            Default Data (JSON)
                          </label>
                          <textarea
                            rows={4}
                            value={JSON.stringify(sec.data || {}, null, 2)}
                            onChange={(e) => {
                              try {
                                const parsed = JSON.parse(e.target.value);
                                setSections((prev) =>
                                  prev.map((s, i) => (i === idx ? { ...s, data: parsed } : s)),
                                );
                              } catch {
                                // wait for valid JSON
                              }
                            }}
                            className="w-full p-2 font-mono text-[11px] rounded-lg border border-border bg-neutral-50"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="w-full py-3 rounded-2xl border-2 border-dashed border-border text-xs font-bold text-neutral-600 hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2 bg-neutral-50/50"
                >
                  <Plus className="w-4 h-4" />
                  Add Section to Template
                </button>
              </div>
            )}

            {/* TAB 2: LAYOUTS */}
            {activeTab === "layouts" && (
              <div className="flex flex-col gap-5">
                <div>
                  <h3 className="font-bold text-sm text-neutral-900 mb-1">Header Variant</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {HEADER_VARIANTS.map((h) => (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => setThemeSettings((prev) => ({ ...prev, headerVariant: h.id }))}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between ${
                          themeSettings.headerVariant === h.id
                            ? "border-primary bg-primary-light/10"
                            : "border-border bg-white"
                        }`}
                      >
                        <div>
                          <p className="font-bold text-xs text-neutral-900">{h.name}</p>
                          <p className="text-[11px] text-neutral-500">{h.desc}</p>
                        </div>
                        {themeSettings.headerVariant === h.id && <Check className="w-4 h-4 text-primary" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <h3 className="font-bold text-sm text-neutral-900 mb-1">Footer Variant</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {FOOTER_VARIANTS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setThemeSettings((prev) => ({ ...prev, footerVariant: f.id }))}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between ${
                          themeSettings.footerVariant === f.id
                            ? "border-primary bg-primary-light/10"
                            : "border-border bg-white"
                        }`}
                      >
                        <div>
                          <p className="font-bold text-xs text-neutral-900">{f.name}</p>
                          <p className="text-[11px] text-neutral-500">{f.desc}</p>
                        </div>
                        {themeSettings.footerVariant === f.id && <Check className="w-4 h-4 text-primary" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <h3 className="font-bold text-sm text-neutral-900 mb-1">Shop Catalog Grid</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {SHOP_LAYOUTS.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setThemeSettings((prev) => ({ ...prev, shopLayout: s.id }));
                          setPreviewView("shop");
                        }}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between ${
                          themeSettings.shopLayout === s.id
                            ? "border-primary bg-primary-light/10"
                            : "border-border bg-white"
                        }`}
                      >
                        <div>
                          <p className="font-bold text-xs text-neutral-900">{s.name}</p>
                          <p className="text-[11px] text-neutral-500">{s.desc}</p>
                        </div>
                        {themeSettings.shopLayout === s.id && <Check className="w-4 h-4 text-primary" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <h3 className="font-bold text-sm text-neutral-900 mb-1">Product Detail Layout</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {PRODUCT_LAYOUTS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setThemeSettings((prev) => ({ ...prev, productLayout: p.id }));
                          setPreviewView("product");
                        }}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between ${
                          themeSettings.productLayout === p.id
                            ? "border-primary bg-primary-light/10"
                            : "border-border bg-white"
                        }`}
                      >
                        <div>
                          <p className="font-bold text-xs text-neutral-900">{p.name}</p>
                          <p className="text-[11px] text-neutral-500">{p.desc}</p>
                        </div>
                        {themeSettings.productLayout === p.id && <Check className="w-4 h-4 text-primary" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <h3 className="font-bold text-sm text-neutral-900 mb-1">Product Card Tile</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {CARD_VARIANTS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setThemeSettings((prev) => ({ ...prev, productCardVariant: c.id }))}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between ${
                          themeSettings.productCardVariant === c.id
                            ? "border-primary bg-primary-light/10"
                            : "border-border bg-white"
                        }`}
                      >
                        <div>
                          <p className="font-bold text-xs text-neutral-900">{c.name}</p>
                          <p className="text-[11px] text-neutral-500">{c.desc}</p>
                        </div>
                        {themeSettings.productCardVariant === c.id && <Check className="w-4 h-4 text-primary" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PALETTE & META */}
            {activeTab === "meta" && (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Template Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border text-xs focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Template Slug *</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border text-xs font-mono focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-neutral-700 block mb-1">Subscription Tier</label>
                    <select
                      value={tier}
                      onChange={(e) => setTier(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-border text-xs bg-white focus:border-primary focus:outline-none"
                    >
                      {TIERS.map((t) => (
                        <option key={t} value={t}>
                          {t.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-neutral-700 block mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border text-xs bg-white focus:border-primary focus:outline-none"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c.charAt(0).toUpperCase() + c.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Preview Image URL</label>
                  <input
                    type="text"
                    value={previewImageUrl}
                    onChange={(e) => setPreviewImageUrl(e.target.value)}
                    placeholder="/template-free.png or URL"
                    className="w-full px-3 py-2 rounded-xl border border-border text-xs focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border text-xs focus:border-primary focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="border-t border-border pt-3 flex flex-col gap-2.5">
                  <h4 className="font-bold text-neutral-900">Default Palette</h4>
                  {[
                    { key: "primary", label: "Primary Accent" },
                    { key: "secondary", label: "Secondary Dark" },
                    { key: "accent", label: "Soft Accent" },
                    { key: "background", label: "Canvas Background" },
                    { key: "text", label: "Typography Text" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-2 rounded-xl border border-border">
                      <span className="font-semibold text-neutral-700">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={(colors as any)[item.key]}
                          onChange={(e) => setColors((prev) => ({ ...prev, [item.key]: e.target.value }))}
                          className="w-20 px-2 py-1 rounded border border-border font-mono text-[11px] text-center"
                        />
                        <input
                          type="color"
                          value={(colors as any)[item.key]}
                          onChange={(e) => setColors((prev) => ({ ...prev, [item.key]: e.target.value }))}
                          className="w-7 h-7 rounded border border-border p-0.5 cursor-pointer"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Live Canvas Pane */}
        <div className="flex-1 h-full overflow-y-auto p-4 sm:p-8 flex justify-center items-start bg-neutral-950">
          <div
            className={`${viewportWidth} overflow-hidden flex flex-col font-sans transition-all duration-300 relative shadow-2xl`}
            style={previewStyle}
          >
            {/* Mock Header */}
            <header className="p-4 border-b flex items-center justify-between"
              style={{ borderColor: "color-mix(in srgb, var(--store-text) 10%, transparent)" }}
            >
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight">{name || "Store Name"}</span>
                <span className="text-[10px] opacity-60 uppercase font-bold">({themeSettings.headerVariant})</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold opacity-80">
                <span>Collections</span>
                <span>About</span>
                <span>Contact</span>
              </div>
            </header>

            {/* Mock Body */}
            <main className="p-6 flex flex-col gap-6">
              {previewView === "home" && (
                <div className="flex flex-col gap-6">
                  {sections.length === 0 ? (
                    <div className="p-12 text-center border-2 border-dashed rounded-3xl opacity-50">
                      <p className="font-bold text-sm">No homepage sections configured</p>
                      <p className="text-xs mt-1">Add sections in the left sidebar to compose this template.</p>
                    </div>
                  ) : (
                    sections.map((sec, idx) => (
                      <div
                        key={sec.id || idx}
                        className="p-6 rounded-2xl border flex flex-col gap-2"
                        style={{
                          backgroundColor: "color-mix(in srgb, var(--store-bg) 95%, var(--store-text) 5%)",
                          borderColor: "color-mix(in srgb, var(--store-text) 12%, transparent)",
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: "var(--store-accent)", color: "var(--store-primary)" }}
                          >
                            {sec.type} {sec.variant ? `(${sec.variant})` : ""}
                          </span>
                          <span className="text-[10px] opacity-50 font-mono">#{idx + 1}</span>
                        </div>
                        <h3 className="font-bold text-base mt-1">{sec.data?.heading || sec.name || sec.type}</h3>
                        {sec.data?.subheading && (
                          <p className="text-xs opacity-75 leading-relaxed">{sec.data.subheading}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {previewView === "shop" && (
                <div className="flex flex-col gap-4">
                  <div className="pb-3 border-b flex items-center justify-between"
                    style={{ borderColor: "color-mix(in srgb, var(--store-text) 10%, transparent)" }}
                  >
                    <h2 className="text-lg font-bold">Catalog Listing ({themeSettings.shopLayout})</h2>
                    <span className="text-xs opacity-60">Card: {themeSettings.productCardVariant}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl border flex flex-col gap-2"
                        style={{
                          backgroundColor: "var(--store-bg)",
                          borderColor: "color-mix(in srgb, var(--store-text) 10%, transparent)",
                          borderRadius: "var(--store-card-radius)",
                        }}
                      >
                        <div className="aspect-[4/5] bg-neutral-200 rounded-lg flex items-center justify-center text-xs opacity-50 font-bold">
                          Sample Product {i}
                        </div>
                        <p className="text-xs font-bold truncate">Premium Collection Item {i}</p>
                        <span className="text-xs font-extrabold" style={{ color: "var(--store-primary)" }}>
                          ₦24,500
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {previewView === "product" && (
                <div className="flex flex-col gap-4">
                  <div className="pb-3 border-b flex items-center justify-between"
                    style={{ borderColor: "color-mix(in srgb, var(--store-text) 10%, transparent)" }}
                  >
                    <h2 className="text-lg font-bold">Product Detail ({themeSettings.productLayout})</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="aspect-square bg-neutral-200 rounded-2xl flex items-center justify-center text-sm font-bold opacity-60">
                      Product Gallery
                    </div>
                    <div className="flex flex-col gap-3">
                      <span className="text-xs uppercase font-bold opacity-60">Curated Collection</span>
                      <h1 className="text-xl font-bold">Signature Artisan Piece</h1>
                      <span className="text-xl font-extrabold" style={{ color: "var(--store-primary)" }}>
                        ₦38,000
                      </span>
                      <p className="text-xs opacity-75 leading-relaxed">
                        Handcrafted with verified materials and covered by 100% Escrow Protection.
                      </p>
                      <button
                        type="button"
                        className="py-3 px-4 text-xs font-bold text-white shadow-md mt-2"
                        style={{
                          backgroundColor: "var(--store-primary)",
                          borderRadius: "var(--store-button-radius)",
                        }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </main>

            {/* Mock Footer */}
            <footer className="p-6 border-t mt-8 flex flex-col gap-2 text-xs opacity-70"
              style={{
                backgroundColor: themeSettings.footerVariant === "dark" ? "var(--store-secondary)" : "transparent",
                color: themeSettings.footerVariant === "dark" ? "#FFFFFF" : "var(--store-text)",
                borderColor: "color-mix(in srgb, var(--store-text) 10%, transparent)",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">{name || "Store"}</span>
                <span>Footer: {themeSettings.footerVariant}</span>
              </div>
              <p className="text-[11px] opacity-60">Protected by Paystack escrow and fast tracked logistics.</p>
            </footer>
          </div>
        </div>
      </div>

      {/* Add Section Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="w-full max-w-xl rounded-3xl bg-white text-neutral-900 p-6 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="font-bold text-base">Add Section to Template</h3>
                <p className="text-xs text-neutral-500">
                  Pick a built-in section block or admin library section.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-lg hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 text-xs">
              <div>
                <p className="font-bold text-xs text-neutral-700 uppercase tracking-wider mb-2">
                  Built-in Layout Blocks
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {BUILTIN_SECTION_OPTIONS.map((opt) => (
                    <button
                      key={opt.type}
                      type="button"
                      onClick={() => handleAddBuiltin(opt)}
                      className="p-3 rounded-2xl border border-border text-left hover:border-primary hover:bg-primary-light/10 transition-all flex items-center justify-between group"
                    >
                      <div>
                        <p className="font-bold text-xs text-neutral-900 group-hover:text-primary">
                          {opt.name}
                        </p>
                        <p className="text-[11px] text-neutral-500">{opt.desc}</p>
                      </div>
                      <Plus className="w-4 h-4 text-neutral-400 group-hover:text-primary shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {librarySections.length > 0 && (
                <div className="border-t border-border pt-3">
                  <p className="font-bold text-xs text-neutral-700 uppercase tracking-wider mb-2">
                    Section Library ({librarySections.length})
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {librarySections.map((libSec) => (
                      <button
                        key={libSec._id || libSec.id}
                        type="button"
                        onClick={() => handleAddLibrary(libSec)}
                        className="p-3 rounded-2xl border border-border text-left hover:border-primary hover:bg-primary-light/10 transition-all flex items-center justify-between group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-xs text-neutral-900 group-hover:text-primary">
                              {libSec.name}
                            </p>
                            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-neutral-100">
                              {libSec.kind}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-500">{libSec.description}</p>
                        </div>
                        <Plus className="w-4 h-4 text-neutral-400 group-hover:text-primary shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
