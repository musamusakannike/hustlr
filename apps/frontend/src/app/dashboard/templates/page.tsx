"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Edit3, ExternalLink, Layers, Lock, Palette, Sliders } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Tabs from "@/components/ui/Tabs";
import Button from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { useStore, useSetTemplate, useTemplates } from "@/hooks/useStore";
import { usePlanEntitlements } from "@/hooks/useSubscription";
import type { TemplateTier, WebsiteTemplate } from "@/types/template";
import { cn, getErrorMessage } from "@/lib/utils";

const CATEGORIES = ["all", "fashion", "electronics", "beauty", "general", "art"];

function tierAccessible(
  tier: TemplateTier,
  ent: {
    allowProTemplates: boolean;
    allowProPlusTemplates: boolean;
  }
): boolean {
  if (tier === "free") return true;
  if (tier === "pro") return ent.allowProTemplates;
  return ent.allowProPlusTemplates;
}

function TemplateCard({
  template,
  isCurrent,
  locked,
  onSelect,
  selecting,
}: {
  template: WebsiteTemplate;
  isCurrent: boolean;
  locked: boolean;
  onSelect: () => void;
  selecting: boolean;
}) {
  return (
    <Card
      className={cn(
        "p-0 overflow-hidden flex flex-col relative group",
        isCurrent && "border-2 border-primary",
        locked && "opacity-90"
      )}
    >
      <div className="relative aspect-[16/10] bg-black overflow-hidden">
        <Image
          src={template.previewImageUrl}
          alt={`${template.name} template preview`}
          fill
          className={cn(
            "object-cover object-top transition-transform duration-300",
            !locked && "group-hover:scale-105",
            locked && "grayscale-[40%]"
          )}
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <Badge
            variant={
              template.tier === "free"
                ? "neutral"
                : template.tier === "pro"
                  ? "info"
                  : "primary"
            }
            className="shadow-sm"
          >
            {template.tier === "pro+" ? "PRO+" : template.tier.toUpperCase()}
          </Badge>
          {isCurrent && (
            <Badge variant="success" className="shadow-sm">
              <Check className="w-3 h-3" /> Active
            </Badge>
          )}
        </div>
        {locked && (
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2 text-white">
            <Lock className="w-7 h-7" />
            <p className="text-xs font-bold uppercase tracking-widest">
              {template.tier} plan required
            </p>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-bold text-lg tracking-tight">{template.name}</h3>
          <p className="text-xs text-muted mt-0.5 capitalize">
            {template.category} • {template.defaultSections?.length ?? template.layoutSections?.length ?? 5} sections
          </p>
        </div>
        <p className="text-sm text-muted leading-relaxed flex-1">
          {template.description}
        </p>

        {locked ? (
          <Link href="/dashboard/billing" className="block">
            <Button variant="dark" fullWidth>
              Upgrade to Unlock
            </Button>
          </Link>
        ) : isCurrent ? (
          <div className="flex flex-col gap-2">
            <Link href="/dashboard/templates/customize" className="block">
              <Button variant="primary" fullWidth>
                <Sliders className="w-4 h-4" />
                Customize Sections & Colors
              </Button>
            </Link>
          </div>
        ) : (
          <Button
            onClick={onSelect}
            loading={selecting}
            variant={template.tier === "free" ? "primary" : "dark"}
            fullWidth
          >
            Use This Template
          </Button>
        )}
      </div>
    </Card>
  );
}

export default function TemplatesPage() {
  const { toast } = useToast();
  const [category, setCategory] = useState("all");
  const { data: store } = useStore();
  const { data: templates, isLoading } = useTemplates();
  const setTemplate = useSetTemplate();
  const { entitlements } = usePlanEntitlements();

  const filtered = (templates ?? []).filter(
    (t) => category === "all" || t.category === category
  );

  const applyTemplate = (template: WebsiteTemplate, confirmReplace: boolean) => {
    const templateId = (template.id || template._id || "").toString();
    if (!templateId) return;
    setTemplate.mutate(
      { templateId, confirmReplace },
      {
        onSuccess: () => {
          toast(`"${template.name}" is now your storefront template.`, "success");
        },
        onError: (err) => {
          if (err instanceof Error && "status" in err && (err as { status: number }).status === 409) {
            const ok = window.confirm(
              `Apply "${template.name}"? This replaces your current homepage sections, colors, and layout settings.`,
            );
            if (ok) applyTemplate(template, true);
            return;
          }
          toast(getErrorMessage(err), "error");
        },
      },
    );
  };

  const handleSelect = (template: WebsiteTemplate) => {
    const hasCustom = Array.isArray(store?.customSections) && store!.customSections!.length > 0;
    const currentId = (
      typeof store?.templateId === "object" && store?.templateId !== null
        ? (store.templateId as { _id?: string; id?: string })._id || (store.templateId as { id?: string }).id
        : store?.templateId
    )?.toString();
    const templateId = (template.id || template._id || "").toString();
    if (hasCustom && currentId && currentId !== templateId) {
      const ok = window.confirm(
        `Apply "${template.name}"? This replaces your current homepage sections, colors, and layout settings.`,
      );
      if (!ok) return;
      applyTemplate(template, true);
      return;
    }
    applyTemplate(template, false);
  };

  if (isLoading) {
    return <Spinner size="lg" label="Loading templates…" />;
  }

  const currentTemplateId = (
    typeof store?.templateId === "object" && store?.templateId !== null
      ? (store.templateId as any)._id || (store.templateId as any).id
      : store?.templateId
  )?.toString();

  return (
    <div className="flex flex-col gap-6">
      {/* Top Customizer Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-dark text-white border border-primary/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
        <div className="flex flex-col gap-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/30 text-primary-light text-xs font-bold border border-primary/50 self-start">
            <Palette className="w-3.5 h-3.5" />
            Visual Customizer & Drag-and-Drop
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Customize {store?.name || "Your Store"}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Reorder layout blocks with drag and drop, customize headings and images, toggle sections on or off, and fine-tune your color scheme with instant live preview.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {store?.slug && (
            <a
              href={`/store/${store.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-neutral-700 bg-neutral-800 text-xs font-bold hover:bg-neutral-700 transition-colors"
            >
              View Live Store
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <Link href="/dashboard/templates/customize">
            <Button variant="primary" className="py-2.5 shadow-md">
              <Sliders className="w-4 h-4" />
              Open Customizer
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Browse Base Templates</h2>
          <p className="text-sm text-muted mt-1">
            Choose a starting template style for your catalog. You can customize every section afterwards.
          </p>
        </div>
        <Tabs
          items={CATEGORIES.map((c) => ({
            id: c,
            label: c === "all" ? "All" : c.charAt(0).toUpperCase() + c.slice(1),
          }))}
          activeId={category}
          onChange={setCategory}
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            title="No templates in this category"
            description="Try another category filter."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((template) => {
            const templateId = (template.id || template._id || "").toString();
            return (
              <TemplateCard
                key={templateId || template.slug}
                template={template}
                isCurrent={Boolean(
                  (templateId && currentTemplateId === templateId) ||
                    (!currentTemplateId && template.slug === "modern-minimalist")
                )}
                locked={!tierAccessible(template.tier, entitlements)}
                selecting={setTemplate.isPending}
                onSelect={() => handleSelect(template)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
