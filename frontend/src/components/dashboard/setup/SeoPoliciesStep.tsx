"use client";

import React, { useState } from "react";
import { Input, Textarea } from "@/components/ui/Input";
import type { Store, StoreSetupInput } from "@/types/store";

export default function SeoPoliciesStep({
  store,
  onSave,
  saving,
}: {
  store: Store;
  onSave: (input: StoreSetupInput) => void;
  saving: boolean;
}) {
  const [metaTitle, setMetaTitle] = useState(store.metaTitle);
  const [metaDescription, setMetaDescription] = useState(
    store.metaDescription
  );
  const [shippingPolicy, setShippingPolicy] = useState(store.shippingPolicy);
  const [returnPolicy, setReturnPolicy] = useState(store.returnPolicy);
  const [termsOfService, setTermsOfService] = useState(store.termsOfService);
  const [privacyPolicy, setPrivacyPolicy] = useState(store.privacyPolicy);

  return (
    <form
      id="setup-step-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          metaTitle,
          metaDescription,
          shippingPolicy,
          returnPolicy,
          termsOfService,
          privacyPolicy,
        });
      }}
      className="flex flex-col gap-5"
    >
      <div className="grid grid-cols-1 gap-5">
        <Input
          label="SEO Title"
          name="metaTitle"
          maxLength={60}
          placeholder="Your Store — What You Sell"
          value={metaTitle}
          onChange={(e) => setMetaTitle(e.target.value)}
          hint={`${metaTitle.length}/60 characters. Shown in search results.`}
        />
        <Textarea
          label="SEO Description"
          name="metaDescription"
          rows={2}
          maxLength={160}
          placeholder="A short compelling summary of your store for search engines…"
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
          hint={`${metaDescription.length}/160 characters.`}
        />
      </div>

      <div className="flex flex-col gap-5">
        <Textarea
          label="Shipping Policy"
          name="shippingPolicy"
          rows={3}
          placeholder="Processing times, delivery windows, shipping fees…"
          value={shippingPolicy}
          onChange={(e) => setShippingPolicy(e.target.value)}
        />
        <Textarea
          label="Return & Refund Policy"
          name="returnPolicy"
          rows={3}
          placeholder="Return window, condition requirements, refund timelines…"
          value={returnPolicy}
          onChange={(e) => setReturnPolicy(e.target.value)}
        />
        <Textarea
          label="Terms of Service"
          name="termsOfService"
          rows={3}
          placeholder="Rules for using your store, payment and delivery terms…"
          value={termsOfService}
          onChange={(e) => setTermsOfService(e.target.value)}
        />
        <Textarea
          label="Privacy Policy"
          name="privacyPolicy"
          rows={3}
          placeholder="What buyer data you collect and how you handle it…"
          value={privacyPolicy}
          onChange={(e) => setPrivacyPolicy(e.target.value)}
        />
      </div>

      <button type="submit" disabled={saving} className="hidden" aria-hidden tabIndex={-1} />
    </form>
  );
}
