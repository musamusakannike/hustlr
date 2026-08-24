"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import Button from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Tabs from "@/components/ui/Tabs";
import { DEMO_TEMPLATES } from "@/fixtures/templates";

const CATEGORIES = ["all", "fashion", "electronics", "beauty", "general", "art"];

const TIER_COPY: Record<string, string> = {
  free: "Included on the Free plan",
  pro: "Pro plan & above",
  "pro+": "Pro+ exclusive",
};

export default function TemplatesPage() {
  const [category, setCategory] = useState("all");
  const filtered = DEMO_TEMPLATES.filter(
    (t) => category === "all" || t.category === category
  );

  return (
    <div className="flex-1 flex flex-col font-space-grotesk">
      {/* Header band */}
      <section className="bg-bg-soft py-14 md:py-20 px-6 sm:px-12 lg:px-16 xl:px-20 border-b border-black/5">
        <div className="max-w-7xl mx-auto flex flex-col gap-8 items-center">
          <SectionHeading
            eyebrow="Store Templates"
            title="Beautiful Storefronts, Zero Design Skills Needed"
            description="Pick a template during store setup and make it yours with your own colors, logo and products. Upgrade anytime to unlock premium designs."
          />

          <div className="flex justify-center">
            <Tabs
              items={CATEGORIES.map((c) => ({
                id: c,
                label:
                  c === "all" ? "All" : c.charAt(0).toUpperCase() + c.slice(1),
              }))}
              activeId={category}
              onChange={setCategory}
            />
          </div>
        </div>
      </section>

      {/* Templates content */}
      <section className="flex-1 bg-white pt-12 md:pt-16 pb-16 sm:pb-20 md:pb-24 px-6 sm:px-12 lg:px-16 xl:px-20">
        <div className="max-w-7xl mx-auto flex flex-col gap-10 lg:gap-12">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {filtered.map((template) => (
            <div
              key={template.id}
              className="rounded-3xl bg-white shadow-xs border border-border overflow-hidden group flex flex-col"
            >
              <div className="relative aspect-[16/10] bg-black overflow-hidden">
                <Image
                  src={template.previewImageUrl}
                  alt={`${template.name} template preview`}
                  fill
                  className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute top-3 left-3">
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
                </div>
              </div>
              <div className="p-6 flex flex-col gap-3 flex-1">
                <div>
                  <h3 className="font-bold text-lg tracking-tight">
                    {template.name}
                  </h3>
                  <p className="text-xs text-muted mt-0.5 capitalize">
                    {template.category} • {TIER_COPY[template.tier]}
                  </p>
                </div>
                <p className="text-sm text-muted leading-relaxed flex-1">
                  {template.description}
                </p>
                <Link href="/auth/register" className="block">
                  <Button variant="dark" fullWidth>
                    Start with this template
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-3xl bg-dark text-white p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center gap-6 border border-primary/40">
          <Lock className="w-10 h-10 text-primary-light shrink-0" />
          <div className="flex-1">
            <h3 className="font-bold text-xl">
              Every template includes escrow-protected checkout
            </h3>
            <p className="text-sm text-neutral-300 mt-1 leading-relaxed">
              Whichever design you choose, buyer payments are held safely in
              escrow until delivery is confirmed — building trust that turns
              visitors into repeat customers.
            </p>
          </div>
          <Link href="/pricing">
            <Button variant="primary">Compare Plans</Button>
          </Link>
        </div>
        </div>
      </section>
    </div>
  );
}
