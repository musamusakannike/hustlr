"use client";

import { useParams } from "next/navigation";
import { useStorefrontInfo } from "@/hooks/useStorefront";

export default function ShippingPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data } = useStorefrontInfo(slug);
  return (
    <article className="max-w-2xl mx-auto px-4 py-10 prose">
      <h1 className="text-2xl font-bold mb-4">Shipping</h1>
      <div className="whitespace-pre-wrap text-sm leading-relaxed">
        {data?.shippingPolicy || "The seller has not published a shipping policy yet."}
      </div>
    </article>
  );
}
