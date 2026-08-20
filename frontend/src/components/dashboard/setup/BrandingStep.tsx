"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import type { Store, StoreSetupInput } from "@/types/store";
import { useUploadAsset } from "@/hooks/useStore";
import { cn } from "@/lib/utils";

const COLOR_FIELDS: {
  key: keyof NonNullable<StoreSetupInput["colorScheme"]>;
  label: string;
  hint: string;
}[] = [
  { key: "primary", label: "Primary", hint: "Buttons, links, highlights" },
  { key: "secondary", label: "Secondary", hint: "Footers, dark sections" },
  { key: "accent", label: "Accent", hint: "Badges, soft highlights" },
  { key: "background", label: "Background", hint: "Page background" },
  { key: "text", label: "Text", hint: "Headings and body text" },
];

function ColorField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-border p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <p className="text-sm font-semibold">{label}</p>
          <p className="text-xs text-muted">{hint}</p>
        </div>
        <label className="relative w-10 h-10 rounded-xl overflow-hidden border border-border cursor-pointer shrink-0">
          <span
            className="absolute inset-0"
            style={{ backgroundColor: value }}
          />
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            className="absolute inset-0 opacity-0 cursor-pointer"
            aria-label={`${label} color`}
          />
        </label>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          const v = e.target.value.toUpperCase();
          if (/^#[0-9A-F]{0,6}$/.test(v)) onChange(v);
        }}
        maxLength={7}
        className="w-full px-3 py-2 rounded-lg border border-border font-mono text-sm focus:outline-none focus:border-primary"
      />
    </div>
  );
}

function AssetUploader({
  label,
  hint,
  previewUrl,
  aspect,
  onUpload,
  uploading,
  onClear,
}: {
  label: string;
  hint: string;
  previewUrl: string;
  aspect: string;
  onUpload: (file: File) => void;
  uploading: boolean;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <p className="text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
        {label}
      </p>
      <div
        className={cn(
          "relative rounded-2xl border-2 border-dashed border-border bg-bg-soft overflow-hidden group",
          aspect
        )}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file) onUpload(file);
        }}
      >
        {previewUrl ? (
          <>
            <Image
              src={previewUrl}
              alt={label}
              fill
              className="object-cover"
              sizes="400px"
            />
            <button
              type="button"
              onClick={onClear}
              aria-label={`Remove ${label}`}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted hover:text-primary transition-colors cursor-pointer"
          >
            <Upload className="w-6 h-6" />
            <span className="text-xs font-semibold">
              {uploading ? "Uploading…" : "Click or drop an image"}
            </span>
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
            e.target.value = "";
          }}
        />
      </div>
      <p className="text-xs text-neutral-400 mt-1">{hint}</p>
      {previewUrl && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="mt-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer disabled:opacity-60"
        >
          {uploading ? "Uploading…" : "Replace image"}
        </button>
      )}
    </div>
  );
}

export default function BrandingStep({
  store,
  onSave,
  saving,
}: {
  store: Store;
  onSave: (input: StoreSetupInput) => void;
  saving: boolean;
}) {
  const upload = useUploadAsset();
  const [logo, setLogo] = useState(store.logo);
  const [banner, setBanner] = useState(store.banner);
  const [scheme, setScheme] = useState({ ...store.colorScheme });

  const handleUpload = async (
    kind: "store-logo" | "store-banner",
    file: File,
    apply: (url: string) => void
  ) => {
    try {
      const { url } = await upload.mutateAsync({ kind, file });
      apply(url);
    } catch {
      /* toasts handled by caller page via mutation state */
    }
  };

  // Submit handler is triggered by the parent form's Continue button via
  // a hidden form submission contract: parent renders buttons that call
  // this component's onSubmit through the id="setup-step-form" pattern.
  return (
    <form
      id="setup-step-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          logo,
          banner,
          colorScheme: scheme,
        });
      }}
      className="flex flex-col gap-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <AssetUploader
          label="Store Logo"
          hint="Square image, at least 256×256px (PNG or WebP)"
          previewUrl={logo}
          aspect="aspect-square max-sm:aspect-[4/3]"
          uploading={upload.isPending}
          onUpload={(file) =>
            handleUpload("store-logo", file, (url) => setLogo(url))
          }
          onClear={() => setLogo("")}
        />
        <AssetUploader
          label="Store Banner"
          hint="Wide image, at least 1200×400px"
          previewUrl={banner}
          aspect="aspect-[3/1]"
          uploading={upload.isPending}
          onUpload={(file) =>
            handleUpload("store-banner", file, (url) => setBanner(url))
          }
          onClear={() => setBanner("")}
        />
      </div>

      <div>
        <p className="text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
          Theme Colors
        </p>
        <p className="text-xs text-neutral-400 mb-4">
          These colors feed your storefront template&apos;s CSS variables.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {COLOR_FIELDS.map((field) => (
            <ColorField
              key={field.key}
              label={field.label}
              hint={field.hint}
              value={scheme[field.key] ?? "#000000"}
              onChange={(v) =>
                setScheme((prev) => ({ ...prev, [field.key]: v }))
              }
            />
          ))}
        </div>
      </div>

      <button type="submit" disabled={saving} className="hidden" aria-hidden tabIndex={-1} />
    </form>
  );
}
