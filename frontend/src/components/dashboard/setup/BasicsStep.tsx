"use client";

import React, { useEffect, useState } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { Input, Textarea } from "@/components/ui/Input";
import type { Store, StoreSetupInput } from "@/types/store";
import { useSlugCheck } from "@/hooks/useStore";
import { cn } from "@/lib/utils";

export default function BasicsStep({
  store,
  pendingStoreName,
  onSave,
  saving,
}: {
  store: Store;
  pendingStoreName: string | null;
  onSave: (input: StoreSetupInput) => void;
  saving: boolean;
}) {
  const [name, setName] = useState(store.name || pendingStoreName || "");
  const [slug, setSlug] = useState(store.slug || "");
  const [description, setDescription] = useState(store.description);

  // Adopt the store name captured during registration once.
  useEffect(() => {
    if (!store.name && pendingStoreName && !name) {
      setName(pendingStoreName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [slugTouched, setSlugTouched] = useState(Boolean(store.slug));
  const { data: slugCheck, isFetching: checkingSlug } = useSlugCheck(
    slugTouched && slug.length >= 3 ? slug : null
  );

  const slugAvailable = slugCheck?.available;
  const canProceed =
    name.trim().length >= 2 &&
    slug.length >= 3 &&
    (slugAvailable === true || slug === store.slug);

  return (
    <form
      id="setup-step-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canProceed) return;
        onSave({ name: name.trim(), slug, description });
      }}
      className="flex flex-col gap-5"
    >
      <Input
        label="Store Name"
        name="storeName"
        required
        placeholder="e.g. Musa's Fashion Hub"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (!slugTouched) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
        }}
        hint="Shown across your storefront, receipts and emails."
      />

      <div>
        <Input
          label="Store URL (Subdomain)"
          name="slug"
          required
          placeholder="musas-fashion-hub"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(
              e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
            );
          }}
          hint={
            <>
              Buyers shop at{" "}
              <span className="font-mono text-primary font-medium">
                {(slug || "your-store")}.hustlr.online
              </span>
            </>
          }
        />
        {slugTouched && slug.length >= 3 && (
          <div className="mt-2">
            {checkingSlug ? (
              <p className="flex items-center gap-2 text-xs text-muted">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Checking
                availability…
              </p>
            ) : slugAvailable === false ? (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="flex items-center gap-1.5 text-danger font-semibold">
                  <X className="w-3.5 h-3.5" /> {slug}.hustlr.online is taken
                </span>
                {slugCheck?.suggestion && (
                  <button
                    type="button"
                    onClick={() => setSlug(slugCheck.suggestion as string)}
                    className="font-semibold text-primary hover:underline cursor-pointer"
                  >
                    Use {slugCheck.suggestion} instead
                  </button>
                )}
              </div>
            ) : slugAvailable === true ? (
              <p className="flex items-center gap-1.5 text-xs text-success font-semibold">
                <Check className="w-3.5 h-3.5" /> {slug}.hustlr.online is
                available
              </p>
            ) : null}
          </div>
        )}
      </div>

      <Textarea
        label="About Your Store"
        name="description"
        rows={4}
        placeholder="Tell buyers what you sell and what makes your store special…"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        hint="Appears on your storefront homepage and in search results."
      />

      <button
        type="submit"
        disabled={!canProceed || saving}
        className={cn("hidden")}
        aria-hidden
        tabIndex={-1}
      />
    </form>
  );
}
