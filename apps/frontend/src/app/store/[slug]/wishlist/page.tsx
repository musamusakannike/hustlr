"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { storeHref } from "@/lib/store-path";
import { Spinner } from "@/components/ui/Spinner";

export default function WishlistRedirectPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  useEffect(() => {
    if (slug) {
      router.replace(storeHref(slug, "/account/wishlist"));
    }
  }, [slug, router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <Spinner label="Loading wishlist..." />
    </div>
  );
}
