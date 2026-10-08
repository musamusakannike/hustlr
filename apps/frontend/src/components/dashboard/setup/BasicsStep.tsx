"use client";

import React, { useState, useEffect } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { Input, Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import type { Store, StoreSetupInput } from "@/types/store";
import { useSlugCheck } from "@/hooks/useStore";
import { cn } from "@/lib/utils";
import { APP_DOMAIN } from "@/constants/app.constants";

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
  const { toast } = useToast();
  const [name, setName] = useState(store.name || pendingStoreName || "");
  const [slug, setSlug] = useState(store.slug || "");
  const [description, setDescription] = useState(store.description || "");
  const [slugTouched, setSlugTouched] = useState(Boolean(store.slug));

  useEffect(() => {
    if (store.name && !name) setName(store.name);
    if (store.slug && !slug) setSlug(store.slug);
    if (store.description && !description) setDescription(store.description);
  }, [store]);

  const isCurrentStoreSlug = Boolean(store.slug && slug === store.slug);
  const { data: slugCheck, isFetching: checkingSlug } = useSlugCheck(
    !isCurrentStoreSlug && slug.length >= 3 ? slug : null
  );

  const slugAvailable = isCurrentStoreSlug ? true : slugCheck?.available;
  const canProceed =
    name.trim().length >= 2 &&
    slug.trim().length >= 3 &&
    slugAvailable !== false &&
    !checkingSlug;

  return (
    <form
      id="setup-step-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim() || name.trim().length < 2) {
          toast("Store name must be at least 2 characters.", "error");
          return;
        }
        if (!slug.trim() || slug.trim().length < 3) {
          toast("Store URL must be at least 3 characters.", "error");
          return;
        }
        if (slugAvailable === false) {
          toast(`${slug} is already taken. Please pick another URL.`, "error");
          return;
        }
        onSave({ name: name.trim(), slug: slug.trim().toLowerCase(), description: description.trim() });
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
                {(slug || "your-store")}.{APP_DOMAIN}
              </span>
            </>
          }
        />
        {slug.length >= 3 && (
          <div className="mt-2">
            {checkingSlug ? (
              <p className="flex items-center gap-2 text-xs text-muted">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Checking
                availability…
              </p>
            ) : slugAvailable === false ? (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="flex items-center gap-1.5 text-danger font-semibold">
                  <X className="w-3.5 h-3.5" /> {slug}.{APP_DOMAIN} is taken
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
                <Check className="w-3.5 h-3.5" /> {slug}.{APP_DOMAIN} is
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
        disabled={saving}
        className={cn("hidden")}
        aria-hidden
        tabIndex={-1}
      />
    </form>
  );
}
