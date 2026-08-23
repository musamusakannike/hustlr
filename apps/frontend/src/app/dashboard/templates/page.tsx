"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Lock, Sparkles } from "lucide-react";
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
            {template.category} • {template.layoutSections.length} sections
          </p>
        </div>
        <p className="text-sm text-muted leading-relaxed flex-1">
          {template.description}
        </p>

        {locked ? (
          <Link href="/dashboard/billing" className="block">
            <Button variant="dark" fullWidth>
              <Sparkles className="w-4 h-4" />
              Upgrade to Unlock
            </Button>
          </Link>
        ) : isCurrent ? (
          <Button variant="outline" fullWidth disabled>
            <Check className="w-4 h-4" />
            Current Template
          </Button>
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

  const handleSelect = (template: WebsiteTemplate) => {
    const templateId = (template.id || template._id || "").toString();
    if (!templateId) return;
    setTemplate.mutate(templateId, {
      onSuccess: () => {
        toast(`"${template.name}" is now your storefront template!`, "success");
      },
      onError: (err) => toast(getErrorMessage(err), "error"),
    });
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
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Storefront Templates</h2>
          <p className="text-sm text-muted mt-1">
            Your template shapes how buyers experience {store?.name ?? "your store"}.
            Switch anytime — your products carry over.
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
                isCurrent={Boolean(templateId && currentTemplateId === templateId)}
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
