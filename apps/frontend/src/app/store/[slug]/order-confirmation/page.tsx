"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useVerifyCheckout } from "@/hooks/useStorefront";
import { storeHref } from "@/lib/store-path";
import { getErrorMessage } from "@/lib/utils";

function Inner() {
  const { slug } = useParams<{ slug: string }>();
  const search = useSearchParams();
  const reference = search.get("reference") || search.get("trxref") || "";
  const verify = useVerifyCheckout();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!reference) return;
    verify.mutate(reference, {
      onError: (err) => setError(getErrorMessage(err)),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]);

  if (!reference) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">No payment reference</h1>
      </div>
    );
  }

  if (verify.isPending) return <Spinner label="Confirming payment…" />;

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">We couldn't confirm that payment</h1>
        <p className="text-sm mt-2 opacity-70">{error}</p>
      </div>
    );
  }

  const order = verify.data;

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Order confirmed</h1>
      <p className="text-sm mt-2 opacity-70">
        {order?.orderNumber} is paid and held in escrow until you confirm delivery.
      </p>
      <Link href={storeHref(slug, `/account/orders/${order?.id ?? ""}`)}>
        <Button className="mt-6">View order</Button>
      </Link>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <Inner />
    </Suspense>
  );
}
