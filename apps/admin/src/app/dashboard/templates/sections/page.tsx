"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Code2,
  Edit2,
  Eye,
  Layers,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Tag,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import {
  adminTemplateSectionsService,
  type HtmlFieldSchema,
  type TemplateSectionItem,
  type TemplateSectionPayload,
} from "@/lib/api";
import { authService } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";
import ConfirmDialog from "@/components/ConfirmDialog";

const REACT_TYPES = [
  { id: "hero", name: "Hero Banner" },
  { id: "hero-slider", name: "Hero Slider" },
  { id: "banner-grid", name: "Banner Grid" },
  { id: "featured-products", name: "Featured Products Rail" },
  { id: "new-arrivals", name: "New Arrivals Rail" },
  { id: "best-sellers", name: "Best Sellers Rail" },
  { id: "categories", name: "Category Pills Rail" },
  { id: "stats", name: "Trust & Stats Bar" },
  { id: "features", name: "Feature Proposition Cards" },
  { id: "how-it-works", name: "How It Works" },
  { id: "split-story", name: "Editorial Split Story" },
  { id: "icon-boxes", name: "Icon Service Boxes" },
  { id: "brands", name: "Brand Logos Strip" },
  { id: "lookbook-grid", name: "Lookbook Grid Mosaic" },
  { id: "testimonials", name: "Customer Testimonials" },
  { id: "cta-banner", name: "CTA Action Banner" },
  { id: "newsletter", name: "Newsletter Subscription" },
];

const CATEGORIES = ["general", "fashion", "electronics", "beauty", "art", "marketing"];

export default function SectionLibraryPage() {
  const [sections, setSections] = useState<TemplateSectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<TemplateSectionItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TemplateSectionItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form State
  const [formName, setFormName] = useState("");
  const [formKey, setFormKey] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("general");
  const [formKind, setFormKind] = useState<"react" | "html">("html");
  const [formType, setFormType] = useState("html-block");
  const [formVariant, setFormVariant] = useState("default");
  const [formHtml, setFormHtml] = useState("");
  const [formCss, setFormCss] = useState("");
  const [formFieldSchema, setFormFieldSchema] = useState<HtmlFieldSchema[]>([]);
  const [formBindings, setFormBindings] = useState<string[]>(["products.featured", "store"]);
  const [formDefaultData, setFormDefaultData] = useState<string>("{}");

  // Live Preview inside modal
  const [previewResult, setPreviewResult] = useState<{ html: string; css: string } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const user = authService.getUser();
  const canManage = hasPermission(user?.adminRole, "templates.manage");

  const notify = (message: string, type: "success" | "error" = "success") => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const fetchSections = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminTemplateSectionsService.list();
      setSections(data || []);
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : "Failed to load sections", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const openCreateModal = () => {
    setEditingSection(null);
    setFormName("");
    setFormKey("");
    setFormDescription("");
    setFormCategory("general");
    setFormKind("html");
    setFormType("html-block");
    setFormVariant("default");
    setFormHtml(`<section class="py-12 px-6 text-center bg-neutral-900 text-white rounded-3xl my-6">\n  <h2 class="text-2xl font-bold mb-2">{{heading}}</h2>\n  <p class="text-sm opacity-80 mb-6 max-w-lg mx-auto">{{subheading}}</p>\n  <a href="{{ctaLink}}" class="inline-block px-6 py-3 rounded-full font-bold text-xs" style="background-color: var(--store-primary); color: white;">{{ctaText}}</a>\n</section>`);
    setFormCss("");
    setFormFieldSchema([
      { key: "heading", label: "Headline", type: "text", defaultValue: "Curated Showcase" },
      { key: "subheading", label: "Subheading Copy", type: "textarea", defaultValue: "Discover verified merchants and escrow protection." },
      { key: "ctaText", label: "CTA Button Text", type: "text", defaultValue: "Explore Catalog" },
      { key: "ctaLink", label: "CTA Button Link", type: "url", defaultValue: "/products" },
    ]);
    setFormBindings(["products.featured", "store"]);
    setFormDefaultData(JSON.stringify({
      heading: "Curated Showcase",
      subheading: "Discover verified merchants and escrow protection.",
      ctaText: "Explore Catalog",
      ctaLink: "/products",
    }, null, 2));
    setPreviewResult(null);
    setIsModalOpen(true);
  };

  const openEditModal = (sec: TemplateSectionItem) => {
    setEditingSection(sec);
    setFormName(sec.name);
    setFormKey(sec.key);
    setFormDescription(sec.description || "");
    setFormCategory(sec.category || "general");
    setFormKind(sec.kind);
    setFormType(sec.type || "html-block");
    setFormVariant(sec.variant || "default");
    setFormHtml(sec.html || "");
    setFormCss(sec.css || "");
    setFormFieldSchema(sec.fieldSchema || []);
    setFormBindings(sec.bindings || []);
    setFormDefaultData(JSON.stringify(sec.defaultData || {}, null, 2));
    setPreviewResult(null);
    setIsModalOpen(true);
  };

  const handleAutoDetectFields = () => {
    const regex = /\{\{([a-zA-Z0-9_]+)\}\}/g;
    const detected = new Set<string>();
    let m: RegExpExecArray | null;
    while ((m = regex.exec(formHtml)) !== null) {
      const key = m[1];
      if (!key.startsWith("store.") && !key.startsWith("#") && !key.startsWith("/")) {
        detected.add(key);
      }
    }
    const currentKeys = new Set(formFieldSchema.map((f) => f.key));
    const nextSchema = [...formFieldSchema];

    detected.forEach((key) => {
      if (!currentKeys.has(key)) {
        let type: HtmlFieldSchema["type"] = "text";
        if (key.toLowerCase().includes("image") || key.toLowerCase().includes("img") || key.toLowerCase().includes("banner")) type = "image";
        else if (key.toLowerCase().includes("desc") || key.toLowerCase().includes("subheading")) type = "textarea";
        else if (key.toLowerCase().includes("link") || key.toLowerCase().includes("url")) type = "url";
        else if (key.toLowerCase().includes("color")) type = "color";

        const label = key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())
          .trim();

        nextSchema.push({ key, label, type });
      }
    });

    setFormFieldSchema(nextSchema);
    notify(`Auto-detected ${detected.size} dynamic fields!`, "success");
  };

  const handleTestPreview = async () => {
    setPreviewLoading(true);
    try {
      let parsedData = {};
      try {
        parsedData = JSON.parse(formDefaultData);
      } catch {
        parsedData = {};
      }
      const res = await adminTemplateSectionsService.preview({
        html: formHtml,
        css: formCss,
        data: parsedData,
        bindings: formBindings,
      });
      setPreviewResult({ html: res.html, css: res.css });
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : "Preview compilation failed", "error");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      notify("Please provide a section name.", "error");
      return;
    }

    let defaultDataObj = {};
    try {
      defaultDataObj = JSON.parse(formDefaultData);
    } catch {
      notify("Default Data must be valid JSON.", "error");
      return;
    }

    setActionLoading(true);
    try {
      const payload: TemplateSectionPayload = {
        name: formName.trim(),
        key: formKey.trim() || undefined,
        description: formDescription.trim(),
        category: formCategory,
        kind: formKind,
        type: formKind === "react" ? formType : "html-block",
        variant: formVariant,
        html: formKind === "html" ? formHtml : undefined,
        css: formKind === "html" ? formCss : undefined,
        fieldSchema: formKind === "html" ? formFieldSchema : undefined,
        bindings: formBindings,
        defaultData: defaultDataObj,
        isActive: true,
      };

      if (editingSection) {
        await adminTemplateSectionsService.update(editingSection._id || editingSection.id!, payload);
        notify("Section updated successfully!", "success");
      } else {
        await adminTemplateSectionsService.create(payload);
        notify("Section created successfully!", "success");
      }
      setIsModalOpen(false);
      fetchSections();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : "Failed to save section", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await adminTemplateSectionsService.delete(deleteTarget._id || deleteTarget.id!);
      notify("Section deleted.", "success");
      setDeleteTarget(null);
      fetchSections();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : "Failed to delete section", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = sections.filter((s) => {
    const matchesSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.key.toLowerCase().includes(search.toLowerCase()) ||
      (s.description || "").toLowerCase().includes(search.toLowerCase());
    const matchesKind = kindFilter === "all" || s.kind === kindFilter;
    const matchesCategory = categoryFilter === "all" || s.category === categoryFilter;
    return matchesSearch && matchesKind && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-16">
      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <span>{feedback.message}</span>
          <button type="button" onClick={() => setFeedback(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/templates"
            className="p-2 rounded-xl border border-border hover:bg-neutral-100 text-neutral-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Reusable Section Library
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Manage React layout wrappers and imported HTML blocks available to merchant customizers.
            </p>
          </div>
        </div>

        {/* Subnav links */}
        <div className="flex items-center gap-2 text-xs font-bold">
          <Link
            href="/dashboard/templates"
            className="px-3.5 py-2 rounded-xl border border-border text-neutral-600 hover:bg-neutral-50 transition-colors"
          >
            Templates Catalogue
          </Link>
          <span className="px-3.5 py-2 rounded-xl bg-neutral-900 text-white shadow-xs">
            Section Library
          </span>
          <Link
            href="/dashboard/templates/guide"
            className="px-3.5 py-2 rounded-xl border border-border text-neutral-600 hover:bg-neutral-50 transition-colors"
          >
            Import Guide
          </Link>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-border shadow-xs">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search sections by name, key..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border focus:border-primary focus:outline-none"
            />
          </div>

          <select
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-border bg-white text-neutral-700 font-semibold"
          >
            <option value="all">All Kinds</option>
            <option value="html">HTML Block</option>
            <option value="react">React Component</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-border bg-white text-neutral-700 font-semibold"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-xs hover:opacity-95 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Create / Import Section
          </button>
        )}
      </div>

      {/* Sections Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-neutral-500">Loading section library...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center border border-dashed rounded-3xl bg-neutral-50/50">
          <p className="font-bold text-sm text-neutral-700">No sections found</p>
          <p className="text-xs text-neutral-400 mt-1">Try adjusting your search or filters, or create a new section.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((sec) => (
            <div
              key={sec._id || sec.id || sec.key}
              className="p-5 rounded-3xl border border-border bg-white shadow-xs flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                      sec.kind === "html"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {sec.kind.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">key: {sec.key}</span>
                </div>
                <h3 className="font-bold text-base text-neutral-900">{sec.name}</h3>
                <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                  {sec.description || "Reusable layout section."}
                </p>

                {sec.kind === "html" && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(sec.fieldSchema || []).map((f) => (
                      <span
                        key={f.key}
                        className="text-[10px] px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 font-mono"
                      >
                        &#123;&#123;{f.key}&#125;&#125;
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {canManage && (
                <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                  <span className="text-[11px] font-semibold text-neutral-400 capitalize">
                    {sec.category || "General"}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(sec)}
                      className="p-2 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                      title="Edit section"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(sec)}
                      className="p-2 rounded-lg text-neutral-500 hover:text-danger hover:bg-danger-light transition-colors"
                      title="Delete section"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Section Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-3xl rounded-3xl bg-white text-neutral-900 p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="font-bold text-base">
                  {editingSection ? `Edit "${editingSection.name}"` : "Create New Section"}
                </h3>
                <p className="text-xs text-neutral-500">
                  Define reusable section logic, token bindings, and styling.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 text-xs">
              {/* Kind Switcher */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormKind("html")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    formKind === "html"
                      ? "border-primary bg-primary-light/10"
                      : "border-border bg-white"
                  }`}
                >
                  <p className="font-bold text-xs text-neutral-900">HTML Section with Tokens</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Import HTML + CSS with bindable &#123;&#123;fields&#125;&#125; and loops.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormKind("react")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    formKind === "react"
                      ? "border-primary bg-primary-light/10"
                      : "border-border bg-white"
                  }`}
                >
                  <p className="font-bold text-xs text-neutral-900">React Component Wrapper</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Use built-in section renderer types and presets.
                  </p>
                </button>
              </div>

              {/* Basic Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Section Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Minimalist Promo Banner"
                    className="w-full px-3 py-2 rounded-xl border border-border text-xs focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Section Key / Slug</label>
                  <input
                    type="text"
                    value={formKey}
                    onChange={(e) => setFormKey(e.target.value)}
                    placeholder="auto-generated from name if blank"
                    className="w-full px-3 py-2 rounded-xl border border-border text-xs font-mono focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border text-xs bg-white focus:border-primary focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Description</label>
                  <input
                    type="text"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Short description for customizer modal"
                    className="w-full px-3 py-2 rounded-xl border border-border text-xs focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* React Kind Specifics */}
              {formKind === "react" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-border pt-3">
                  <div>
                    <label className="font-semibold text-neutral-700 block mb-1">React Section Type</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border text-xs bg-white focus:border-primary focus:outline-none"
                    >
                      {REACT_TYPES.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-neutral-700 block mb-1">Variant Name</label>
                    <input
                      type="text"
                      value={formVariant}
                      onChange={(e) => setFormVariant(e.target.value)}
                      placeholder="e.g. minimal, split, overlay"
                      className="w-full px-3 py-2 rounded-xl border border-border text-xs focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* HTML Kind Specifics */}
              {formKind === "html" && (
                <div className="flex flex-col gap-3 border-t border-border pt-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-neutral-700">HTML Code & Tokens</label>
                      <button
                        type="button"
                        onClick={handleAutoDetectFields}
                        className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        Auto-Detect Fields from Code
                      </button>
                    </div>
                    <textarea
                      rows={6}
                      value={formHtml}
                      onChange={(e) => setFormHtml(e.target.value)}
                      placeholder="<section class='...'> <h1>{{heading}}</h1> </section>"
                      className="w-full p-3 rounded-xl border border-border font-mono text-xs focus:border-primary focus:outline-none leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-neutral-700 block mb-1">
                      Optional Scoped CSS (Automatically scoped to section wrapper)
                    </label>
                    <textarea
                      rows={3}
                      value={formCss}
                      onChange={(e) => setFormCss(e.target.value)}
                      placeholder=".hero { padding: 40px; } .hero h1 { color: var(--store-primary); }"
                      className="w-full p-3 rounded-xl border border-border font-mono text-xs focus:border-primary focus:outline-none leading-relaxed"
                    />
                  </div>

                  {/* Field Schema Manager */}
                  <div className="p-4 rounded-2xl bg-neutral-50 border border-border flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-neutral-900">Configurable Seller Fields</p>
                        <p className="text-[11px] text-neutral-500">
                          These fields appear in the seller customizer editor for this section.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setFormFieldSchema([
                            ...formFieldSchema,
                            { key: `field_${Date.now()}`, label: "New Field", type: "text" },
                          ])
                        }
                        className="px-2.5 py-1 rounded-lg border border-border bg-white text-[11px] font-bold hover:bg-neutral-100"
                      >
                        + Add Field
                      </button>
                    </div>

                    <div className="flex flex-col gap-2">
                      {formFieldSchema.map((field, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-border">
                          <input
                            type="text"
                            value={field.key}
                            onChange={(e) => {
                              const next = [...formFieldSchema];
                              next[idx].key = e.target.value;
                              setFormFieldSchema(next);
                            }}
                            placeholder="tokenKey"
                            className="w-28 px-2 py-1 rounded-lg border border-border font-mono text-[11px]"
                          />
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => {
                              const next = [...formFieldSchema];
                              next[idx].label = e.target.value;
                              setFormFieldSchema(next);
                            }}
                            placeholder="Label"
                            className="flex-1 px-2 py-1 rounded-lg border border-border text-[11px]"
                          />
                          <select
                            value={field.type}
                            onChange={(e) => {
                              const next = [...formFieldSchema];
                              next[idx].type = e.target.value as any;
                              setFormFieldSchema(next);
                            }}
                            className="w-24 px-2 py-1 rounded-lg border border-border text-[11px] bg-white"
                          >
                            <option value="text">text</option>
                            <option value="textarea">textarea</option>
                            <option value="image">image</option>
                            <option value="color">color</option>
                            <option value="url">url</option>
                            <option value="number">number</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => setFormFieldSchema(formFieldSchema.filter((_, i) => i !== idx))}
                            className="p-1 rounded text-neutral-400 hover:text-danger"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Live Test Preview Button */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={handleTestPreview}
                      disabled={previewLoading}
                      className="px-3.5 py-1.5 rounded-xl border border-neutral-700 bg-neutral-800 text-white font-bold text-[11px] flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {previewLoading ? "Testing..." : "Test Render Preview"}
                    </button>
                  </div>

                  {previewResult && (
                    <div className="p-4 rounded-2xl border border-border bg-neutral-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-2">
                        Rendered Output Preview:
                      </p>
                      <div
                        className="prose max-w-none text-xs"
                        dangerouslySetInnerHTML={{ __html: previewResult.html }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Default Data JSON */}
              <div className="border-t border-border pt-3">
                <label className="font-semibold text-neutral-700 block mb-1">
                  Default Section Data (JSON)
                </label>
                <textarea
                  rows={4}
                  value={formDefaultData}
                  onChange={(e) => setFormDefaultData(e.target.value)}
                  className="w-full p-3 rounded-xl border border-border font-mono text-xs focus:border-primary focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border mt-auto">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:opacity-95 disabled:opacity-50"
                >
                  {actionLoading ? "Saving..." : editingSection ? "Update Section" : "Create Section"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Section"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? Templates relying on this section definition will continue rendering their existing snapshot.`}
        confirmLabel="Delete Section"
        isDestructive={true}
        isLoading={actionLoading}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
