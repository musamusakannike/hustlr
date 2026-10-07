"use client";

import React from "react";
import Link from "next/link";
import type { LookbookGridSectionData, StorefrontInfo } from "@/types/storefront";
import { storeHref } from "@/lib/store-path";
import EditableText from "@/components/dashboard/customizer/EditableText";
import EditableImage from "@/components/dashboard/customizer/EditableImage";
import { useCustomizerEdit } from "@/components/dashboard/customizer/customizer-edit-context";

export default function LookbookGridSection({
  data,
  info,
}: {
  data: LookbookGridSectionData;
  info: StorefrontInfo;
}) {
  const editing = Boolean(useCustomizerEdit()?.enabled);
  const items = data.items || [];
  if (!items.length) return null;

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-14 max-w-7xl mx-auto">
      {(data.badge || data.heading) && (
        <div className="mb-8 text-center">
          {data.badge && (
            <EditableText
              as="p"
              path="badge"
              value={data.badge}
              className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: "var(--store-primary)" }}
            />
          )}
          {data.heading && (
            <EditableText as="h2" path="heading" value={data.heading} className="text-2xl sm:text-3xl font-extrabold" />
          )}
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((item, i) => (
          <Link
            key={item.id || i}
            href={storeHref(info.slug, item.link || "/products")}
            onClick={(e) => {
              if (editing) e.preventDefault();
            }}
            className={`relative overflow-hidden min-h-[220px] ${i === 0 ? "md:col-span-2 md:row-span-2 md:min-h-[460px]" : ""}`}
            style={{ borderRadius: "var(--store-card-radius, 16px)" }}
          >
            {item.image ? (
              <EditableImage
                path={`items.${i}.image`}
                src={item.image}
                alt={item.title || ""}
                className="absolute inset-0"
                imgClassName="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0" style={{ backgroundColor: "var(--store-accent)" }} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
            {item.title && (
              <EditableText
                as="span"
                path={`items.${i}.title`}
                value={item.title}
                className="absolute bottom-4 left-4 text-white font-bold text-sm z-10"
              />
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
