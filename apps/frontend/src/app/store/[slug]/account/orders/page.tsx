"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { useBuyerAuth } from "@/context/BuyerAuthContext";
import { useBuyerOrders } from "@/hooks/useStorefront";
import { formatNaira, formatDate } from "@/lib/utils";
import { storeHref } from "@/lib/store-path";

export default function BuyerOrdersPage() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated, isLoading: authLoading } = useBuyerAuth();
  const router = useRouter();
  const { data, isLoading } = useBuyerOrders();

  if (authLoading) return <Spinner />;
  if (!isAuthenticated) {
    router.replace(storeHref(slug, "/auth/login"));
    return <Spinner />;
  }

  const items = data?.items ?? [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      {isLoading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState title="No orders yet" />
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((o) => (
            <li key={o.id}>
              <Link
                href={storeHref(slug, `/account/orders/${o.id}`)}
                className="flex justify-between items-center border rounded-2xl p-4"
              >
                <div>
                  <p className="font-semibold">{o.orderNumber}</p>
                  <p className="text-xs opacity-70">{formatDate(o.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatNaira(o.totalAmount)}</p>
                  <Badge className="mt-1">{o.deliveryStatus}</Badge>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
