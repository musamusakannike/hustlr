"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Code2,
  ExternalLink,
  Eye,
  EyeOff,
  GripVertical,
  Laptop,
  Layers,
  Layout,
  Palette,
  Plus,
  RefreshCw,
  Save,
  Sliders,
  Smartphone,
  Tablet,
  Trash2,
  X,
} from "lucide-react";
import type { Store } from "@/types/store";
import type { StorefrontSection, StorefrontSectionType } from "@/types/storefront";
import type { TemplateSectionDefinition } from "@/types/template";
import { useSetupStore, useTemplateSections, useTemplates } from "@/hooks/useStore";
import { useToast } from "@/components/ui/Toast";
import { getErrorMessage } from "@/lib/utils";
import {
  COLOR_PALETTE_PRESETS,
  DEFAULT_STOREFRONT_SECTIONS,
} from "@/fixtures/storefront-defaults";
import {
  CARD_VARIANT_OPTIONS,
  FOOTER_VARIANT_OPTIONS,
  HEADER_VARIANT_OPTIONS,
  PRODUCT_LAYOUT_OPTIONS,
  resolveTheme,
  SHOP_LAYOUT_OPTIONS,
  type FooterVariant,
  type HeaderVariant,
  type ProductCardVariant,
  type ProductLayout,
  type ShopLayout,
  type StoreThemeSettings,
} from "@/lib/storefront-theme";
import { SectionEditor } from "./SectionEditors";
import LiveStorefrontPreview from "./LiveStorefrontPreview";

const ALL_SECTION_TEMPLATES: {
  type: StorefrontSectionType;
  name: string;
  description: string;
}[] = [
  { type: "hero", name: "Hero Banner", description: "Large display banner with headline, CTA, and background image" },
  { type: "hero-slider", name: "Hero Slider", description: "Multi-slide hero banner with responsive slides and CTA buttons" },
  { type: "banner-grid", name: "Banner Grid", description: "2, 3, or 4 category / campaign promo banners" },
  { type: "featured-products", name: "Featured Products Rail", description: "Product grid highlighting top handpicked items" },
  { type: "new-arrivals", name: "New Arrivals Rail", description: "Fresh inventory and latest drops grid" },
  { type: "best-sellers", name: "Best Sellers Rail", description: "Top-selling customer favorites grid" },
  { type: "categories", name: "Category Pills Rail", description: "Horizontal category filter buttons" },
  { type: "stats", name: "Trust & Stats Bar", description: "4-metric ribbon showcasing customer ratings and trust metrics" },
  { type: "features", name: "Value Proposition Cards", description: "3 prominent feature cards with call-to-actions" },
  { type: "how-it-works", name: "How It Works (3 Steps)", description: "Step-by-step numbered guide explaining ordering and escrow" },
  { type: "split-story", name: "Editorial Story Showcase", description: "2-column layout with narrative text, bullet guarantees, and portrait image" },
  { type: "icon-boxes", name: "Icon Service Boxes", description: "Shipping, escrow, authentic quality, and customer support ribbon" },
  { type: "brands", name: "Brand Logos Strip", description: "Partner & featured merchant brand badges" },
  { type: "lookbook-grid", name: "Lookbook Mosaic", description: "Editorial visual showcase grid with hotspot links" },
  { type: "testimonials", name: "Customer Reviews", description: "Verified customer quotes and 5-star ratings" },
  { type: "cta-banner", name: "Call to Action Banner", description: "High-contrast full-width action banner" },
  { type: "newsletter", name: "Newsletter Subscription", description: "Email capture box for promo discounts" },
  { type: "html-block", name: "Custom HTML Section", description: "Imported or customized dynamic HTML section" },
];

const CARD_RADIUS_OPTIONS = [
  { label: "Sharp", value: "0px" },
  { label: "Subtle", value: "8px" },
  { label: "Rounded", value: "16px" },
  { label: "Pill", value: "24px" },
];

const BUTTON_RADIUS_OPTIONS = [
  { label: "Sharp", value: "0px" },
  { label: "Rounded", value: "8px" },
  { label: "Pill", value: "9999px" },
];

export default function StoreCustomizer({ store }: { store: Store }) {
  const { toast } = useToast();
  const setup = useSetupStore();
  const { data: librarySections } = useTemplateSections();
  const { data: templates } = useTemplates();

  // Active Tab
  const [activeTab, setActiveTab] = useState<"sections" | "edit-section" | "theme">("sections");
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  // Viewport mode & Preview page
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [previewPage, setPreviewPage] = useState<"home" | "shop" | "product">("home");

  // State
  const [colorScheme, setColorScheme] = useState({
    primary: store.colorScheme?.primary || "#800A1D",
    secondary: store.colorScheme?.secondary || "#0A0E11",
    accent: store.colorScheme?.accent || "#FAD4D8",
    background: store.colorScheme?.background || "#FFFFFF",
    text: store.colorScheme?.text || "#0A0E11",
  });

  const [themeSettings, setThemeSettings] = useState<StoreThemeSettings>(() =>
    resolveTheme(store.themeSettings),
  );

  const [sections, setSections] = useState<StorefrontSection[]>(() => {
    const existing = store.customSections as StorefrontSection[] | undefined;
    if (existing && Array.isArray(existing) && existing.length > 0) {
      return existing;
    }
    return DEFAULT_STOREFRONT_SECTIONS;
  });

  // Add Section Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalTab, setAddModalTab] = useState<"builtin" | "library">("builtin");

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const selectedSection = sections.find((s) => s.id === selectedSectionId);

  // Actions
  const handleToggleVisibility = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isEnabled: !s.isEnabled } : s)),
    );
  };

  const handleRemoveSection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSections((prev) => prev.filter((s) => s.id !== id));
    if (selectedSectionId === id) {
      setSelectedSectionId(null);
      setActiveTab("sections");
    }
  };

  const handleMoveUp = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index === 0) return;
    setSections((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next.map((s, idx) => ({ ...s, order: idx }));
    });
  };

  const handleMoveDown = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index === sections.length - 1) return;
    setSections((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next.map((s, idx) => ({ ...s, order: idx }));
    });
  };

  // Drag and Drop Handlers
  const onDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setSections((prev) => {
      const next = [...prev];
      const item = next[draggedIndex];
      next.splice(draggedIndex, 1);
      next.splice(index, 0, item);
      setDraggedIndex(index);
      return next.map((s, idx) => ({ ...s, order: idx }));
    });
  };

  const onDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleAddBuiltinSection = (template: (typeof ALL_SECTION_TEMPLATES)[0]) => {
    const defaultSec = DEFAULT_STOREFRONT_SECTIONS.find((s) => s.type === template.type);
    let initialData: Record<string, unknown> = { heading: template.name };
    if (template.type === "hero-slider") {
      initialData = {
        slides: [
          {
            badge: "NEW ARRIVALS",
            heading: "Modern Living Collection",
            subheading: "Discover handcrafted pieces curated for elegance.",
            ctaText: "Shop Now",
            ctaLink: "/products",
            image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&auto=format&fit=crop&q=80",
          },
        ],
      };
    } else if (template.type === "banner-grid") {
      initialData = {
        columns: 3,
        items: [
          { title: "Living Room", subtitle: "Comfort & Style", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80", link: "/products" },
          { title: "Lighting", subtitle: "Warm Ambience", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80", link: "/products" },
          { title: "Decor Accents", subtitle: "Handcrafted Details", image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80", link: "/products" },
        ],
      };
    } else if (template.type === "icon-boxes") {
      initialData = {
        items: [
          { icon: "Truck", title: "Tracked Shipping", description: "Fast delivery nationwide" },
          { icon: "ShieldCheck", title: "100% Escrow Protection", description: "Secure escrow funds guarantee" },
          { icon: "RefreshCw", title: "7-Day Return Policy", description: "Easy returns on all items" },
          { icon: "Headphones", title: "Merchant Support", description: "24/7 dedicated service" },
        ],
      };
    } else if (template.type === "brands") {
      initialData = {
        heading: "Featured Brand Partners",
        items: [
          { name: "Nordic Atelier" },
          { name: "Urban Crafts" },
          { name: "Kinetics" },
          { name: "Aura Essentials" },
        ],
      };
    } else if (template.type === "lookbook-grid") {
      initialData = {
        badge: "SEASON LOOKBOOK",
        heading: "Curated Showcase",
        items: [
          { title: "Minimal Dining", image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&auto=format&fit=crop&q=80", link: "/products" },
          { title: "Lounge Seating", image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80", link: "/products" },
          { title: "Sculptural Ceramics", image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&auto=format&fit=crop&q=80", link: "/products" },
        ],
      };
    } else if (template.type === "html-block") {
      initialData = {
        html: `<section class="py-12 px-6 text-center bg-neutral-900 text-white rounded-3xl my-6">\n  <h2 class="text-2xl font-bold mb-2">{{heading}}</h2>\n  <p class="text-sm opacity-80 mb-6 max-w-lg mx-auto">{{subheading}}</p>\n  <a href="{{ctaLink}}" class="inline-block px-6 py-3 rounded-full font-bold text-xs" style="background-color: var(--store-primary); color: white;">{{ctaText}}</a>\n</section>`,
        css: ``,
        heading: "Seasonal Flash Offer",
        subheading: "Enjoy 20% off all catalog items with Paystack escrow protection.",
        ctaText: "Shop the Sale",
        ctaLink: "/products",
        fieldSchema: [
          { key: "heading", label: "Headline", type: "text" },
          { key: "subheading", label: "Subheading", type: "textarea" },
          { key: "ctaText", label: "CTA Button Text", type: "text" },
          { key: "ctaLink", label: "CTA Button Link", type: "url" },
        ],
      };
    } else if (defaultSec) {
      initialData = { ...defaultSec.data };
    }

    const newSection: StorefrontSection = {
      id: `sec_${template.type}_${Date.now()}`,
      type: template.type,
      name: template.name,
      isEnabled: true,
      order: sections.length,
      data: initialData,
    };
    setSections((prev) => [...prev, newSection]);
    setShowAddModal(false);
    setSelectedSectionId(newSection.id);
    setActiveTab("edit-section");
  };

  const handleAddLibrarySection = (libSec: TemplateSectionDefinition) => {
    let initialData = { ...(libSec.defaultData || {}) };
    if (libSec.kind === "html") {
      initialData = {
        ...initialData,
        html: libSec.html,
        css: libSec.css,
        fieldSchema: libSec.fieldSchema || [],
        libraryKey: libSec.key,
      };
    }
    const newSection: StorefrontSection = {
      id: `sec_${libSec.type || "html-block"}_${Date.now()}`,
      type: (libSec.kind === "html" ? "html-block" : (libSec.type as StorefrontSectionType)) || "html-block",
      name: libSec.name,
      variant: libSec.variant || undefined,
      isEnabled: true,
      order: sections.length,
      data: initialData,
    };
    setSections((prev) => [...prev, newSection]);
    setShowAddModal(false);
    setSelectedSectionId(newSection.id);
    setActiveTab("edit-section");
  };

  const handleResetDefaults = () => {
    const currentTemplateId = (
      typeof store.templateId === "object" && store.templateId !== null
        ? (store.templateId as any)._id || (store.templateId as any).id
        : store.templateId
    )?.toString();

    const activeTpl = (templates || []).find(
      (t) => (t.id || t._id || "").toString() === currentTemplateId,
    );

    if (
      confirm(
        `Reset all sections, theme layouts, and colors to ${
          activeTpl ? `"${activeTpl.name}"` : "default"
        } template settings?`,
      )
    ) {
      if (activeTpl && activeTpl.defaultSections && activeTpl.defaultSections.length > 0) {
        setSections(activeTpl.defaultSections as StorefrontSection[]);
        if (activeTpl.defaultColorScheme) {
          setColorScheme(activeTpl.defaultColorScheme as any);
        }
        if (activeTpl.themeSettings) {
          setThemeSettings(resolveTheme(activeTpl.themeSettings));
        }
      } else {
        setSections(DEFAULT_STOREFRONT_SECTIONS);
        setThemeSettings(resolveTheme());
      }
      toast("Sections and layouts reset to template defaults.", "info");
    }
  };

  const handleUpdateSectionData = (updatedData: any) => {
    if (!selectedSectionId) return;
    setSections((prev) =>
      prev.map((s) => (s.id === selectedSectionId ? { ...s, data: updatedData } : s)),
    );
  };

  const handleApplyPalette = (palette: (typeof COLOR_PALETTE_PRESETS)[0]) => {
    setColorScheme(palette.scheme);
    toast(`Applied "${palette.name}" palette!`, "success");
  };

  const handleSave = () => {
    setup.mutate(
      {
        colorScheme,
        customSections: sections as any,
        themeSettings: themeSettings as any,
      },
      {
        onSuccess: () => {
          toast("Storefront template customized and published!", "success");
        },
        onError: (err) => toast(getErrorMessage(err), "error"),
      },
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden -m-6 bg-neutral-900 text-neutral-100">
      {/* Top Controls Toolbar */}
      <div className="h-14 bg-neutral-950 border-b border-neutral-800 px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/templates"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-white truncate max-w-[140px] sm:max-w-none">
              {store.name}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-primary/20 text-primary-light border border-primary/40">
              Live Customizer
            </span>
          </div>
        </div>

        {/* Center: Page Switcher & Viewport Switcher */}
        <div className="flex items-center gap-3">
          {/* Page Preview Switcher */}
          <div className="hidden md:flex items-center gap-1 bg-neutral-900 border border-neutral-800 p-1 rounded-xl text-xs font-semibold">
            {(
              [
                { id: "home", label: "Home" },
                { id: "shop", label: "Shop Catalog" },
                { id: "product", label: "Product Detail" },
              ] as const
            ).map((page) => (
              <button
                key={page.id}
                type="button"
                className={`px-3 py-1 rounded-lg transition-colors ${
                  previewPage === page.id
                    ? "bg-neutral-800 text-white font-bold shadow-xs"
                    : "text-neutral-400 hover:text-white"
                }`}
                onClick={() => setPreviewPage(page.id)}
              >
                {page.label}
              </button>
            ))}
          </div>

          {/* Viewport Switcher */}
          <div className="hidden sm:flex items-center gap-1 bg-neutral-900 border border-neutral-800 p-1 rounded-xl">
            <button
              type="button"
              className={`p-1.5 rounded-lg transition-colors ${
                viewport === "desktop"
                  ? "bg-neutral-800 text-white shadow-xs"
                  : "text-neutral-400 hover:text-white"
              }`}
              onClick={() => setViewport("desktop")}
              title="Desktop View"
            >
              <Laptop className="w-4 h-4" />
            </button>
            <button
              type="button"
              className={`p-1.5 rounded-lg transition-colors ${
                viewport === "tablet"
                  ? "bg-neutral-800 text-white shadow-xs"
                  : "text-neutral-400 hover:text-white"
              }`}
              onClick={() => setViewport("tablet")}
              title="Tablet View (768px)"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              type="button"
              className={`p-1.5 rounded-lg transition-colors ${
                viewport === "mobile"
                  ? "bg-neutral-800 text-white shadow-xs"
                  : "text-neutral-400 hover:text-white"
              }`}
              onClick={() => setViewport("mobile")}
              title="Mobile View (390px)"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <a
            href={`/store/${store.slug}`}
            target="_blank"
            rel="noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            View Live
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Reset
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={setup.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: "var(--color-primary, #800A1D)" }}
          >
            <Save className="w-3.5 h-3.5" />
            {setup.isPending ? "Saving..." : "Save & Publish"}
          </button>
        </div>
      </div>

      {/* Main Workspace (Sidebar + Live Preview) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Settings Sidebar */}
        <div className="w-80 sm:w-96 bg-white text-neutral-900 border-r border-border flex flex-col shrink-0 z-20 shadow-xl overflow-hidden">
          {/* Sidebar Tabs Header */}
          <div className="flex border-b border-border bg-neutral-50 shrink-0">
            <button
              type="button"
              className={`flex-1 py-3 px-2 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                activeTab === "sections"
                  ? "border-primary text-primary bg-white"
                  : "border-transparent text-neutral-500 hover:text-neutral-900"
              }`}
              onClick={() => setActiveTab("sections")}
            >
              <Layers className="w-3.5 h-3.5" />
              Sections ({sections.filter((s) => s.isEnabled).length})
            </button>
            <button
              type="button"
              className={`flex-1 py-3 px-2 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                activeTab === "theme"
                  ? "border-primary text-primary bg-white"
                  : "border-transparent text-neutral-500 hover:text-neutral-900"
              }`}
              onClick={() => setActiveTab("theme")}
            >
              <Palette className="w-3.5 h-3.5" />
              Theme & Layouts
            </button>
          </div>

          {/* Sidebar Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            {/* TAB 1: SECTIONS & ORDER (Drag & Drop) */}
            {activeTab === "sections" && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900">Layout Sections</h3>
                    <p className="text-xs text-neutral-500">
                      Drag to reorder, toggle visibility, or click to edit.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="p-1.5 rounded-lg bg-primary text-white hover:opacity-90 transition-opacity shadow-xs"
                    title="Add new section"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Sortable List of Sections */}
                <div className="flex flex-col gap-2">
                  {sections.map((section, idx) => (
                    <div
                      key={section.id}
                      draggable
                      onDragStart={() => onDragStart(idx)}
                      onDragOver={(e) => onDragOver(e, idx)}
                      onDragEnd={onDragEnd}
                      onClick={() => {
                        setSelectedSectionId(section.id);
                        setActiveTab("edit-section");
                      }}
                      className={`group p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                        selectedSectionId === section.id
                          ? "border-primary bg-primary-light/10 shadow-xs"
                          : section.isEnabled
                          ? "border-border bg-white hover:border-neutral-400 hover:shadow-xs"
                          : "border-dashed border-neutral-300 bg-neutral-50 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Drag Handle */}
                        <div
                          className="cursor-grab active:cursor-grabbing text-neutral-400 group-hover:text-neutral-700 p-0.5 shrink-0"
                          title="Drag to reorder"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <GripVertical className="w-4 h-4" />
                        </div>

                        <div className="min-w-0">
                          <p className="font-bold text-xs text-neutral-900 truncate">
                            {section.name || section.type}
                          </p>
                          <p className="text-[10px] text-neutral-400 capitalize truncate">
                            {section.type.replace("-", " ")}
                          </p>
                        </div>
                      </div>

                      {/* Controls (Move Up, Move Down, Visibility, Delete) */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleMoveUp(idx, e)}
                          disabled={idx === 0}
                          className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-20"
                          title="Move up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleMoveDown(idx, e)}
                          disabled={idx === sections.length - 1}
                          className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-20"
                          title="Move down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleToggleVisibility(section.id, e)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            section.isEnabled
                              ? "text-emerald-700 hover:bg-emerald-50"
                              : "text-neutral-400 hover:bg-neutral-200"
                          }`}
                          title={section.isEnabled ? "Hide section" : "Show section"}
                        >
                          {section.isEnabled ? (
                            <Eye className="w-3.5 h-3.5" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleRemoveSection(section.id, e)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-danger hover:bg-danger-light transition-colors"
                          title="Remove section"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="w-full py-3 rounded-2xl border-2 border-dashed border-border text-xs font-bold text-neutral-600 hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2 bg-neutral-50/50"
                >
                  <Plus className="w-4 h-4" />
                  Add New Section
                </button>
              </div>
            )}

            {/* TAB 2: ACTIVE SECTION CONTENT EDITOR */}
            {activeTab === "edit-section" && selectedSection && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <button
                    type="button"
                    onClick={() => setActiveTab("sections")}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-neutral-900"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to sections
                  </button>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary-light/40 px-2 py-0.5 rounded-md">
                    {selectedSection.type}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-neutral-900">
                    Edit {selectedSection.name}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Customize titles, descriptions, buttons, images, and items.
                  </p>
                </div>

                <SectionEditor
                  section={selectedSection}
                  onChange={handleUpdateSectionData}
                />
              </div>
            )}

            {/* TAB 3: THEME & LAYOUT SETTINGS */}
            {activeTab === "theme" && (
              <div className="flex flex-col gap-6 text-xs">
                {/* Header Layout */}
                <div>
                  <h3 className="font-bold text-sm text-neutral-900 mb-1">Header Style</h3>
                  <p className="text-xs text-neutral-500 mb-3">
                    Choose how the logo, search, and navigation render across the storefront.
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {HEADER_VARIANT_OPTIONS.map((opt) => {
                      const isActive = themeSettings.headerVariant === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setThemeSettings((prev) => ({ ...prev, headerVariant: opt.id as HeaderVariant }))}
                          className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                            isActive
                              ? "border-primary bg-primary-light/10 shadow-xs"
                              : "border-border bg-white hover:border-neutral-400"
                          }`}
                        >
                          <div>
                            <p className="font-bold text-xs text-neutral-900 flex items-center gap-1.5">
                              {opt.name}
                              {isActive && <Check className="w-3.5 h-3.5 text-primary" />}
                            </p>
                            <p className="text-[11px] text-neutral-500 mt-0.5">{opt.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Layout */}
                <div className="border-t border-border pt-4">
                  <h3 className="font-bold text-sm text-neutral-900 mb-1">Footer Style</h3>
                  <p className="text-xs text-neutral-500 mb-3">
                    Select a compact or multi-column footer for policy links and store info.
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {FOOTER_VARIANT_OPTIONS.map((opt) => {
                      const isActive = themeSettings.footerVariant === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setThemeSettings((prev) => ({ ...prev, footerVariant: opt.id as FooterVariant }))}
                          className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                            isActive
                              ? "border-primary bg-primary-light/10 shadow-xs"
                              : "border-border bg-white hover:border-neutral-400"
                          }`}
                        >
                          <div>
                            <p className="font-bold text-xs text-neutral-900 flex items-center gap-1.5">
                              {opt.name}
                              {isActive && <Check className="w-3.5 h-3.5 text-primary" />}
                            </p>
                            <p className="text-[11px] text-neutral-500 mt-0.5">{opt.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Shop Catalog Layout */}
                <div className="border-t border-border pt-4">
                  <h3 className="font-bold text-sm text-neutral-900 mb-1">Shop Catalog Grid</h3>
                  <p className="text-xs text-neutral-500 mb-3">
                    Choose column density and category filtering layout on the `/products` page.
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {SHOP_LAYOUT_OPTIONS.map((opt) => {
                      const isActive = themeSettings.shopLayout === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setThemeSettings((prev) => ({ ...prev, shopLayout: opt.id as ShopLayout }));
                            setPreviewPage("shop");
                          }}
                          className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                            isActive
                              ? "border-primary bg-primary-light/10 shadow-xs"
                              : "border-border bg-white hover:border-neutral-400"
                          }`}
                        >
                          <div>
                            <p className="font-bold text-xs text-neutral-900 flex items-center gap-1.5">
                              {opt.name}
                              {isActive && <Check className="w-3.5 h-3.5 text-primary" />}
                            </p>
                            <p className="text-[11px] text-neutral-500 mt-0.5">{opt.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Product Detail Layout */}
                <div className="border-t border-border pt-4">
                  <h3 className="font-bold text-sm text-neutral-900 mb-1">Product Detail Layout</h3>
                  <p className="text-xs text-neutral-500 mb-3">
                    Gallery, centered, or sticky buy box layout for individual product pages.
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {PRODUCT_LAYOUT_OPTIONS.map((opt) => {
                      const isActive = themeSettings.productLayout === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setThemeSettings((prev) => ({ ...prev, productLayout: opt.id as ProductLayout }));
                            setPreviewPage("product");
                          }}
                          className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                            isActive
                              ? "border-primary bg-primary-light/10 shadow-xs"
                              : "border-border bg-white hover:border-neutral-400"
                          }`}
                        >
                          <div>
                            <p className="font-bold text-xs text-neutral-900 flex items-center gap-1.5">
                              {opt.name}
                              {isActive && <Check className="w-3.5 h-3.5 text-primary" />}
                            </p>
                            <p className="text-[11px] text-neutral-500 mt-0.5">{opt.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Product Card Style */}
                <div className="border-t border-border pt-4">
                  <h3 className="font-bold text-sm text-neutral-900 mb-1">Product Card Tile Style</h3>
                  <p className="text-xs text-neutral-500 mb-3">
                    Style of product tiles rendered in catalog and featured rails.
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {CARD_VARIANT_OPTIONS.map((opt) => {
                      const isActive = themeSettings.productCardVariant === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setThemeSettings((prev) => ({ ...prev, productCardVariant: opt.id as ProductCardVariant }))}
                          className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                            isActive
                              ? "border-primary bg-primary-light/10 shadow-xs"
                              : "border-border bg-white hover:border-neutral-400"
                          }`}
                        >
                          <div>
                            <p className="font-bold text-xs text-neutral-900 flex items-center gap-1.5">
                              {opt.name}
                              {isActive && <Check className="w-3.5 h-3.5 text-primary" />}
                            </p>
                            <p className="text-[11px] text-neutral-500 mt-0.5">{opt.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Corner Roundness */}
                <div className="border-t border-border pt-4">
                  <h3 className="font-bold text-sm text-neutral-900 mb-3">Corner Roundness</h3>
                  <div className="flex flex-col gap-3">
                    <div>
                      <p className="font-semibold text-neutral-700 mb-1.5">Card Radius</p>
                      <div className="grid grid-cols-4 gap-2">
                        {CARD_RADIUS_OPTIONS.map((r) => {
                          const isActive = (themeSettings.cardRadius || "16px") === r.value;
                          return (
                            <button
                              key={r.value}
                              type="button"
                              onClick={() => setThemeSettings((prev) => ({ ...prev, cardRadius: r.value }))}
                              className={`py-2 text-center rounded-xl border text-xs font-semibold ${
                                isActive ? "border-primary bg-primary-light/20 text-primary" : "border-border bg-white"
                              }`}
                            >
                              {r.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <p className="font-semibold text-neutral-700 mb-1.5">Button Radius</p>
                      <div className="grid grid-cols-3 gap-2">
                        {BUTTON_RADIUS_OPTIONS.map((r) => {
                          const isActive = (themeSettings.buttonRadius || "9999px") === r.value;
                          return (
                            <button
                              key={r.value}
                              type="button"
                              onClick={() => setThemeSettings((prev) => ({ ...prev, buttonRadius: r.value }))}
                              className={`py-2 text-center rounded-xl border text-xs font-semibold ${
                                isActive ? "border-primary bg-primary-light/20 text-primary" : "border-border bg-white"
                              }`}
                            >
                              {r.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Color Palettes */}
                <div className="border-t border-border pt-4">
                  <h3 className="font-bold text-sm text-neutral-900 mb-1">Color Presets</h3>
                  <p className="text-xs text-neutral-500 mb-3">
                    Select a designer-crafted color palette for your storefront.
                  </p>

                  <div className="flex flex-col gap-2.5">
                    {COLOR_PALETTE_PRESETS.map((preset) => {
                      const isActive =
                        colorScheme.primary === preset.scheme.primary &&
                        colorScheme.background === preset.scheme.background;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleApplyPalette(preset)}
                          className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
                            isActive
                              ? "border-primary bg-primary-light/10 shadow-xs"
                              : "border-border bg-white hover:border-neutral-400"
                          }`}
                        >
                          <div>
                            <p className="font-bold text-xs text-neutral-900 flex items-center gap-1.5">
                              {preset.name}
                              {isActive && <Check className="w-3.5 h-3.5 text-primary" />}
                            </p>
                            <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1">
                              {preset.description}
                            </p>
                          </div>

                          {/* Swatches preview */}
                          <div className="flex items-center gap-1 shrink-0 p-1 bg-neutral-100 rounded-lg">
                            <span
                              className="w-4 h-4 rounded-full border border-black/10"
                              style={{ backgroundColor: preset.scheme.primary }}
                            />
                            <span
                              className="w-4 h-4 rounded-full border border-black/10"
                              style={{ backgroundColor: preset.scheme.accent }}
                            />
                            <span
                              className="w-4 h-4 rounded-full border border-black/10"
                              style={{ backgroundColor: preset.scheme.background }}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Colors */}
                <div className="border-t border-border pt-4">
                  <h3 className="font-bold text-sm text-neutral-900 mb-3">Custom Theme Colors</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { key: "primary", label: "Primary Accent", hint: "Buttons, badges, highlights" },
                      { key: "secondary", label: "Secondary Dark", hint: "Header, footer, dark sections" },
                      { key: "accent", label: "Soft Accent", hint: "Tag badges and card highlights" },
                      { key: "background", label: "Page Background", hint: "Store background canvas" },
                      { key: "text", label: "Text Color", hint: "Headings & typography" },
                    ].map((field) => (
                      <div
                        key={field.key}
                        className="p-3 rounded-xl border border-border flex items-center justify-between gap-3"
                      >
                        <div>
                          <p className="font-semibold text-neutral-800">{field.label}</p>
                          <p className="text-[11px] text-neutral-400">{field.hint}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={(colorScheme as any)[field.key] || ""}
                            onChange={(e) =>
                              setColorScheme((prev) => ({
                                ...prev,
                                [field.key]: e.target.value,
                              }))
                            }
                            className="w-20 px-2 py-1 rounded-lg border border-border text-[11px] font-mono text-center uppercase"
                          />
                          <input
                            type="color"
                            value={(colorScheme as any)[field.key] || "#000000"}
                            onChange={(e) =>
                              setColorScheme((prev) => ({
                                ...prev,
                                [field.key]: e.target.value.toUpperCase(),
                              }))
                            }
                            className="w-8 h-8 rounded-lg cursor-pointer border border-border p-0.5"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Live Interactive Preview Pane */}
        <div className="flex-1 h-full overflow-hidden relative">
          <LiveStorefrontPreview
            store={store}
            colorScheme={colorScheme}
            sections={sections}
            themeSettings={themeSettings}
            viewport={viewport}
            previewPage={previewPage}
          />
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
                <h3 className="font-bold text-base">Add a Section</h3>
                <p className="text-xs text-neutral-500">
                  Pick a new layout block to add to your storefront.
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

            {/* Modal Tabs: Builtin vs Library */}
            <div className="flex border-b border-border gap-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => setAddModalTab("builtin")}
                className={`pb-2.5 border-b-2 transition-colors ${
                  addModalTab === "builtin" ? "border-primary text-primary" : "border-transparent text-neutral-500"
                }`}
              >
                Built-in Blocks ({ALL_SECTION_TEMPLATES.length})
              </button>
              <button
                type="button"
                onClick={() => setAddModalTab("library")}
                className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
                  addModalTab === "library" ? "border-primary text-primary" : "border-transparent text-neutral-500"
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                Admin Library ({librarySections?.length || 0})
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              {addModalTab === "builtin" && (
                <div className="grid grid-cols-1 gap-2.5">
                  {ALL_SECTION_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.type}
                      type="button"
                      onClick={() => handleAddBuiltinSection(tmpl)}
                      className="p-3.5 rounded-2xl border border-border text-left hover:border-primary hover:bg-primary-light/10 transition-all flex items-center justify-between group"
                    >
                      <div>
                        <p className="font-bold text-xs text-neutral-900 group-hover:text-primary">
                          {tmpl.name}
                        </p>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          {tmpl.description}
                        </p>
                      </div>
                      <Plus className="w-4 h-4 text-neutral-400 group-hover:text-primary shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {addModalTab === "library" && (
                <div className="flex flex-col gap-2.5">
                  {!librarySections || librarySections.length === 0 ? (
                    <div className="p-8 text-center border border-dashed rounded-2xl">
                      <p className="text-xs text-neutral-500">
                        No custom sections published in the admin library yet.
                      </p>
                    </div>
                  ) : (
                    librarySections.map((libSec) => (
                      <button
                        key={libSec.key || libSec.id || libSec._id}
                        type="button"
                        onClick={() => handleAddLibrarySection(libSec)}
                        className="p-3.5 rounded-2xl border border-border text-left hover:border-primary hover:bg-primary-light/10 transition-all flex items-center justify-between group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-xs text-neutral-900 group-hover:text-primary">
                              {libSec.name}
                            </p>
                            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-neutral-100 text-neutral-600">
                              {libSec.kind}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-500 mt-0.5">
                            {libSec.description || "Reusable custom section from admin library."}
                          </p>
                        </div>
                        <Plus className="w-4 h-4 text-neutral-400 group-hover:text-primary shrink-0" />
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
