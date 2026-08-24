"use client";

import React, { useState } from "react";
import { Input, Textarea } from "@/components/ui/Input";
import type { Store, StoreSetupInput } from "@/types/store";

const SOCIAL_FIELDS: {
  key: keyof NonNullable<StoreSetupInput["socialLinks"]>;
  label: string;
  placeholder: string;
}[] = [
  { key: "whatsappNumber", label: "WhatsApp Number", placeholder: "+2348012345678" },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/yourstore" },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/yourstore" },
  { key: "twitter", label: "X (Twitter)", placeholder: "https://x.com/yourstore" },
  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@yourstore" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@yourstore" },
];

export default function ContactStep({
  store,
  onSave,
  saving,
}: {
  store: Store;
  onSave: (input: StoreSetupInput) => void;
  saving: boolean;
}) {
  const [contactEmail, setContactEmail] = useState(store.contactEmail);
  const [contactPhone, setContactPhone] = useState(store.contactPhone);
  const [address, setAddress] = useState(store.address);
  const [socials, setSocials] = useState({ ...store.socialLinks });

  return (
    <form
      id="setup-step-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          contactEmail,
          contactPhone,
          address,
          socialLinks: socials,
        });
      }}
      className="flex flex-col gap-5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Input
          label="Public Contact Email"
          type="email"
          name="contactEmail"
          placeholder="hello@yourstore.com"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          hint="Shown on your storefront contact page."
        />
        <Input
          label="Public Contact Phone"
          type="tel"
          name="contactPhone"
          placeholder="+234 801 234 5678"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
        />
      </div>

      <Textarea
        label="Business Address"
        name="address"
        rows={2}
        placeholder="12 Market Street, Lagos, Nigeria"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        hint="Optional — shown on your storefront footer."
      />

      <div>
        <p className="text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
          Social Links
        </p>
        <p className="text-xs text-neutral-400 mb-4">
          All optional. WhatsApp enables the floating chat button on your
          storefront.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {SOCIAL_FIELDS.map((field) => (
            <Input
              key={field.key}
              label={field.label}
              name={field.key}
              placeholder={field.placeholder}
              value={socials[field.key] ?? ""}
              onChange={(e) =>
                setSocials((prev) => ({
                  ...prev,
                  [field.key]: e.target.value,
                }))
              }
            />
          ))}
        </div>
      </div>

      <button type="submit" disabled={saving} className="hidden" aria-hidden tabIndex={-1} />
    </form>
  );
}
