"use client";

import React, { useRef } from "react";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { useUploadAsset } from "@/hooks/useStore";
import type { StorefrontSection } from "@/types/storefront";

interface SectionEditorProps {
  section: StorefrontSection;
  onChange: (updatedData: any) => void;
}

export function HeroSectionEditor({ section, onChange }: SectionEditorProps) {
  const data = section.data || {};
  const upload = useUploadAsset();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    try {
      const res = await upload.mutateAsync({ kind: "store-banner", file });
      onChange({ ...data, backgroundImage: res.url });
    } catch {
      // toast handled by parent
    }
  };

  return (
    <div className="flex flex-col gap-4 text-xs">
      <div>
        <label className="font-semibold text-neutral-700 block mb-1">Eyebrow Badge</label>
        <input
          type="text"
          value={data.badge || ""}
          onChange={(e) => onChange({ ...data, badge: e.target.value })}
          placeholder="e.g. THE CURATED MARKETPLACE FOR VERIFIED ESSENTIALS"
          className="w-full px-3 py-2 rounded-xl border border-border text-xs focus:border-primary focus:outline-none"
        />
      </div>

      <div>
        <label className="font-semibold text-neutral-700 block mb-1">Headline</label>
        <input
          type="text"
          value={data.heading || ""}
          onChange={(e) => onChange({ ...data, heading: e.target.value })}
          placeholder="e.g. Your Marketplace, Connected."
          className="w-full px-3 py-2 rounded-xl border border-border text-xs font-bold focus:border-primary focus:outline-none"
        />
      </div>

      <div>
        <label className="font-semibold text-neutral-700 block mb-1">Subheading Copy</label>
        <textarea
          rows={3}
          value={data.subheading || ""}
          onChange={(e) => onChange({ ...data, subheading: e.target.value })}
          placeholder="e.g. Discover verified merchants, authentic collections, and fast escrow-protected checkout..."
          className="w-full px-3 py-2 rounded-xl border border-border text-xs focus:border-primary focus:outline-none leading-relaxed"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="font-semibold text-neutral-700 block mb-1">Primary CTA Button</label>
          <input
            type="text"
            value={data.primaryCtaText || ""}
            onChange={(e) => onChange({ ...data, primaryCtaText: e.target.value })}
            placeholder="e.g. Explore Collections"
            className="w-full px-3 py-2 rounded-xl border border-border text-xs focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="font-semibold text-neutral-700 block mb-1">Primary CTA Link</label>
          <input
            type="text"
            value={data.primaryCtaLink || ""}
            onChange={(e) => onChange({ ...data, primaryCtaLink: e.target.value })}
            placeholder="/products"
            className="w-full px-3 py-2 rounded-xl border border-border text-xs focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="font-semibold text-neutral-700 block mb-1">Secondary Button</label>
          <input
            type="text"
            value={data.secondaryCtaText || ""}
            onChange={(e) => onChange({ ...data, secondaryCtaText: e.target.value })}
            placeholder="e.g. How It Works"
            className="w-full px-3 py-2 rounded-xl border border-border text-xs focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="font-semibold text-neutral-700 block mb-1">Secondary Link</label>
          <input
            type="text"
            value={data.secondaryCtaLink || ""}
            onChange={(e) => onChange({ ...data, secondaryCtaLink: e.target.value })}
            placeholder="#how-it-works"
            className="w-full px-3 py-2 rounded-xl border border-border text-xs focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Hero Background Image */}
      <div>
        <label className="font-semibold text-neutral-700 block mb-1">Hero Background Image</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={data.backgroundImage || ""}
            onChange={(e) => onChange({ ...data, backgroundImage: e.target.value })}
            placeholder="Image URL or upload below"
            className="flex-1 px-3 py-2 rounded-xl border border-border text-xs focus:border-primary focus:outline-none"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={upload.isPending}
            className="px-3 py-2 rounded-xl bg-neutral-100 border border-border text-xs font-semibold hover:bg-neutral-200 transition-colors flex items-center gap-1 shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            {upload.isPending ? "Uploading..." : "Upload"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f);
            }}
          />
        </div>
      </div>

      {/* Alignment */}
      <div>
        <label className="font-semibold text-neutral-700 block mb-1">Content Alignment</label>
        <div className="flex gap-2">
          <button
            type="button"
            className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold ${
              data.align !== "center"
                ? "bg-primary text-white border-primary"
                : "bg-white border-border"
            }`}
            onClick={() => onChange({ ...data, align: "left" })}
          >
            Left Aligned
          </button>
          <button
            type="button"
            className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold ${
              data.align === "center"
                ? "bg-primary text-white border-primary"
                : "bg-white border-border"
            }`}
            onClick={() => onChange({ ...data, align: "center" })}
          >
            Center Aligned
          </button>
        </div>
      </div>
    </div>
  );
}

export function StatsSectionEditor({ section, onChange }: SectionEditorProps) {
  const data = section.data || {};
  const items = data.items || [];

  const updateItem = (index: number, field: string, val: string) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: val };
    onChange({ ...data, items: next });
  };

  return (
    <div className="flex flex-col gap-4 text-xs">
      <p className="text-neutral-500">Edit the 4 metrics shown on the Trust ribbon below the Hero banner.</p>
      {items.map((item: any, idx: number) => (
        <div key={idx} className="p-3 rounded-xl border border-border bg-neutral-50 flex flex-col gap-2">
          <p className="font-bold text-neutral-700">Metric #{idx + 1}</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-neutral-500 block mb-0.5">Value (e.g. 4.9+)</label>
              <input
                type="text"
                value={item.value || ""}
                onChange={(e) => updateItem(idx, "value", e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-neutral-500 block mb-0.5">Label</label>
              <input
                type="text"
                value={item.label || ""}
                onChange={(e) => updateItem(idx, "label", e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white text-xs"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function FeaturesSectionEditor({ section, onChange }: SectionEditorProps) {
  const data = section.data || {};
  const cards = data.cards || [];

  const updateCard = (index: number, field: string, val: string) => {
    const next = [...cards];
    next[index] = { ...next[index], [field]: val };
    onChange({ ...data, cards: next });
  };

  return (
    <div className="flex flex-col gap-4 text-xs">
      <div>
        <label className="font-semibold text-neutral-700 block mb-1">Section Badge</label>
        <input
          type="text"
          value={data.badge || ""}
          onChange={(e) => onChange({ ...data, badge: e.target.value })}
          className="w-full px-3 py-2 rounded-xl border border-border text-xs"
        />
      </div>
      <div>
        <label className="font-semibold text-neutral-700 block mb-1">Section Title</label>
        <input
          type="text"
          value={data.heading || ""}
          onChange={(e) => onChange({ ...data, heading: e.target.value })}
          className="w-full px-3 py-2 rounded-xl border border-border text-xs font-bold"
        />
      </div>
      <div>
        <label className="font-semibold text-neutral-700 block mb-1">Section Subtitle</label>
        <textarea
          rows={2}
          value={data.subheading || ""}
          onChange={(e) => onChange({ ...data, subheading: e.target.value })}
          className="w-full px-3 py-2 rounded-xl border border-border text-xs"
        />
      </div>

      <div className="flex flex-col gap-3 mt-2">
        <p className="font-bold text-neutral-700">3 Feature Value Cards</p>
        {cards.map((card: any, idx: number) => (
          <div key={idx} className="p-3.5 rounded-2xl border border-border bg-neutral-50 flex flex-col gap-2.5">
            <p className="font-bold text-xs text-primary">Card #{idx + 1}</p>
            <div>
              <label className="text-neutral-500 block mb-0.5">Card Title</label>
              <input
                type="text"
                value={card.title || ""}
                onChange={(e) => updateCard(idx, "title", e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-neutral-500 block mb-0.5">Description</label>
              <textarea
                rows={2}
                value={card.description || ""}
                onChange={(e) => updateCard(idx, "description", e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-neutral-500 block mb-0.5">Button Text</label>
                <input
                  type="text"
                  value={card.buttonText || ""}
                  onChange={(e) => updateCard(idx, "buttonText", e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white text-xs"
                />
              </div>
              <div>
                <label className="text-neutral-500 block mb-0.5">Button Link</label>
                <input
                  type="text"
                  value={card.buttonLink || ""}
                  onChange={(e) => updateCard(idx, "buttonLink", e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white text-xs"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HowItWorksEditor({ section, onChange }: SectionEditorProps) {
  const data = section.data || {};
  const steps = data.steps || [];

  const updateStepTitle = (idx: number, title: string) => {
    const next = [...steps];
    next[idx] = { ...next[idx], title };
    onChange({ ...data, steps: next });
  };

  const updateStepBullet = (stepIdx: number, bulletIdx: number, text: string) => {
    const next = [...steps];
    const bullets = [...next[stepIdx].bullets];
    bullets[bulletIdx] = text;
    next[stepIdx] = { ...next[stepIdx], bullets };
    onChange({ ...data, steps: next });
  };

  return (
    <div className="flex flex-col gap-4 text-xs">
      <div>
        <label className="font-semibold text-neutral-700 block mb-1">Section Title</label>
        <input
          type="text"
          value={data.heading || ""}
          onChange={(e) => onChange({ ...data, heading: e.target.value })}
          className="w-full px-3 py-2 rounded-xl border border-border text-xs font-bold"
        />
      </div>
      <div>
        <label className="font-semibold text-neutral-700 block mb-1">CTA Button Text</label>
        <input
          type="text"
          value={data.ctaText || ""}
          onChange={(e) => onChange({ ...data, ctaText: e.target.value })}
          className="w-full px-3 py-2 rounded-xl border border-border text-xs"
        />
      </div>

      <div className="flex flex-col gap-3">
        <p className="font-bold text-neutral-700">3 Numbered Step Cards</p>
        {steps.map((step: any, idx: number) => (
          <div key={idx} className="p-3.5 rounded-2xl border border-border bg-neutral-50 flex flex-col gap-2.5">
            <p className="font-bold text-xs text-primary">Step {step.stepNumber || idx + 1}</p>
            <div>
              <label className="text-neutral-500 block mb-0.5">Step Heading</label>
              <input
                type="text"
                value={step.title || ""}
                onChange={(e) => updateStepTitle(idx, e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-neutral-500 block mb-1">Checklist Bullets</label>
              <div className="flex flex-col gap-1.5">
                {(step.bullets || []).map((bullet: string, bIdx: number) => (
                  <input
                    key={bIdx}
                    type="text"
                    value={bullet}
                    onChange={(e) => updateStepBullet(idx, bIdx, e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white text-xs"
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SplitStoryEditor({ section, onChange }: SectionEditorProps) {
  const data = section.data || {};
  const bullets = data.bullets || [];
  const upload = useUploadAsset();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    try {
      const res = await upload.mutateAsync({ kind: "store-banner", file });
      onChange({ ...data, image: res.url });
    } catch {
      // parent toast
    }
  };

  const updateBullet = (idx: number, val: string) => {
    const next = [...bullets];
    next[idx] = val;
    onChange({ ...data, bullets: next });
  };

  const addBullet = () => {
    onChange({ ...data, bullets: [...bullets, "New benefit guarantee point"] });
  };

  const removeBullet = (idx: number) => {
    onChange({ ...data, bullets: bullets.filter((_: any, i: number) => i !== idx) });
  };

  return (
    <div className="flex flex-col gap-4 text-xs">
      <div>
        <label className="font-semibold text-neutral-700 block mb-1">Headline</label>
        <input
          type="text"
          value={data.heading || ""}
          onChange={(e) => onChange({ ...data, heading: e.target.value })}
          className="w-full px-3 py-2 rounded-xl border border-border text-xs font-bold"
        />
      </div>

      <div>
        <label className="font-semibold text-neutral-700 block mb-1">Narrative Story Copy</label>
        <textarea
          rows={3}
          value={data.narrative || ""}
          onChange={(e) => onChange({ ...data, narrative: e.target.value })}
          className="w-full px-3 py-2 rounded-xl border border-border text-xs leading-relaxed"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="font-semibold text-neutral-700">Checkmark Highlights</label>
          <button
            type="button"
            onClick={addBullet}
            className="text-primary font-bold hover:underline flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add bullet
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {bullets.map((b: string, idx: number) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={b}
                onChange={(e) => updateBullet(idx, e.target.value)}
                className="flex-1 px-2.5 py-1.5 rounded-lg border border-border bg-white text-xs"
              />
              <button
                type="button"
                onClick={() => removeBullet(idx)}
                className="text-neutral-400 hover:text-danger p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="font-semibold text-neutral-700 block mb-1">Showcase Portrait Image</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={data.image || ""}
            onChange={(e) => onChange({ ...data, image: e.target.value })}
            placeholder="Image URL or upload"
            className="flex-1 px-3 py-2 rounded-xl border border-border text-xs"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={upload.isPending}
            className="px-3 py-2 rounded-xl bg-neutral-100 border border-border text-xs font-semibold hover:bg-neutral-200 transition-colors flex items-center gap-1 shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f);
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function ProductRailEditor({ section, onChange }: SectionEditorProps) {
  const data = section.data || {};
  return (
    <div className="flex flex-col gap-4 text-xs">
      <div>
        <label className="font-semibold text-neutral-700 block mb-1">Section Title</label>
        <input
          type="text"
          value={data.heading || ""}
          onChange={(e) => onChange({ ...data, heading: e.target.value })}
          className="w-full px-3 py-2 rounded-xl border border-border text-xs font-bold"
        />
      </div>
      <div>
        <label className="font-semibold text-neutral-700 block mb-1">Subheading</label>
        <input
          type="text"
          value={data.subheading || ""}
          onChange={(e) => onChange({ ...data, subheading: e.target.value })}
          className="w-full px-3 py-2 rounded-xl border border-border text-xs"
        />
      </div>
      <div>
        <label className="font-semibold text-neutral-700 block mb-1">Max Products to Show</label>
        <input
          type="number"
          min={2}
          max={24}
          value={data.limit || 8}
          onChange={(e) => onChange({ ...data, limit: Number(e.target.value) })}
          className="w-full px-3 py-2 rounded-xl border border-border text-xs"
        />
      </div>
    </div>
  );
}

export function CtaBannerEditor({ section, onChange }: SectionEditorProps) {
  const data = section.data || {};
  return (
    <div className="flex flex-col gap-4 text-xs">
      <div>
        <label className="font-semibold text-neutral-700 block mb-1">Banner Headline</label>
        <input
          type="text"
          value={data.heading || ""}
          onChange={(e) => onChange({ ...data, heading: e.target.value })}
          className="w-full px-3 py-2 rounded-xl border border-border text-xs font-bold"
        />
      </div>
      <div>
        <label className="font-semibold text-neutral-700 block mb-1">Subtext</label>
        <textarea
          rows={3}
          value={data.subheading || ""}
          onChange={(e) => onChange({ ...data, subheading: e.target.value })}
          className="w-full px-3 py-2 rounded-xl border border-border text-xs"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="font-semibold text-neutral-700 block mb-1">Primary Button Text</label>
          <input
            type="text"
            value={data.buttonText || ""}
            onChange={(e) => onChange({ ...data, buttonText: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-border text-xs"
          />
        </div>
        <div>
          <label className="font-semibold text-neutral-700 block mb-1">Primary Button Link</label>
          <input
            type="text"
            value={data.buttonLink || ""}
            onChange={(e) => onChange({ ...data, buttonLink: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-border text-xs"
          />
        </div>
      </div>
    </div>
  );
}

export function NewsletterEditor({ section, onChange }: SectionEditorProps) {
  const data = section.data || {};
  return (
    <div className="flex flex-col gap-4 text-xs">
      <div>
        <label className="font-semibold text-neutral-700 block mb-1">Headline</label>
        <input
          type="text"
          value={data.heading || ""}
          onChange={(e) => onChange({ ...data, heading: e.target.value })}
          className="w-full px-3 py-2 rounded-xl border border-border text-xs font-bold"
        />
      </div>
      <div>
        <label className="font-semibold text-neutral-700 block mb-1">Subtext</label>
        <textarea
          rows={2}
          value={data.subheading || ""}
          onChange={(e) => onChange({ ...data, subheading: e.target.value })}
          className="w-full px-3 py-2 rounded-xl border border-border text-xs"
        />
      </div>
    </div>
  );
}

export function TestimonialsEditor({ section, onChange }: SectionEditorProps) {
  const data = section.data || {};
  const items = data.items || [];

  const updateItem = (idx: number, field: string, val: string) => {
    const next = [...items];
    next[idx] = { ...next[idx], [field]: val };
    onChange({ ...data, items: next });
  };

  return (
    <div className="flex flex-col gap-4 text-xs">
      <div>
        <label className="font-semibold text-neutral-700 block mb-1">Section Title</label>
        <input
          type="text"
          value={data.heading || ""}
          onChange={(e) => onChange({ ...data, heading: e.target.value })}
          className="w-full px-3 py-2 rounded-xl border border-border text-xs font-bold"
        />
      </div>

      <div className="flex flex-col gap-3">
        <p className="font-bold text-neutral-700">Customer Testimonial Cards</p>
        {items.map((item: any, idx: number) => (
          <div key={idx} className="p-3.5 rounded-2xl border border-border bg-neutral-50 flex flex-col gap-2.5">
            <p className="font-bold text-xs text-primary">Review #{idx + 1}</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-neutral-500 block mb-0.5">Customer Name</label>
                <input
                  type="text"
                  value={item.name || ""}
                  onChange={(e) => updateItem(idx, "name", e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-neutral-500 block mb-0.5">Role / Status</label>
                <input
                  type="text"
                  value={item.role || ""}
                  onChange={(e) => updateItem(idx, "role", e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white text-xs"
                />
              </div>
            </div>
            <div>
              <label className="text-neutral-500 block mb-0.5">Quote / Review</label>
              <textarea
                rows={2}
                value={item.comment || ""}
                onChange={(e) => updateItem(idx, "comment", e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white text-xs"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SectionEditor({
  section,
  onChange,
}: {
  section: StorefrontSection;
  onChange: (updatedData: any) => void;
}) {
  switch (section.type) {
    case "hero":
      return <HeroSectionEditor section={section} onChange={onChange} />;
    case "stats":
      return <StatsSectionEditor section={section} onChange={onChange} />;
    case "features":
      return <FeaturesSectionEditor section={section} onChange={onChange} />;
    case "how-it-works":
      return <HowItWorksEditor section={section} onChange={onChange} />;
    case "split-story":
      return <SplitStoryEditor section={section} onChange={onChange} />;
    case "featured-products":
    case "new-arrivals":
    case "best-sellers":
      return <ProductRailEditor section={section} onChange={onChange} />;
    case "testimonials":
      return <TestimonialsEditor section={section} onChange={onChange} />;
    case "cta-banner":
      return <CtaBannerEditor section={section} onChange={onChange} />;
    case "newsletter":
      return <NewsletterEditor section={section} onChange={onChange} />;
    default:
      return <p className="text-xs text-neutral-400">No customizable fields for this section.</p>;
  }
}
