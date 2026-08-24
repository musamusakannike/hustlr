"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Package } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Tabs from "@/components/ui/Tabs";
import EmptyState from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import { useOrders } from "@/hooks/useCommerce";
import { formatNaira, formatDate } from "@/lib/utils";
import type { DeliveryStatus } from "@/types/order";

const TABS = [
  { id: "all", label: "All" },
  { id: "processing", label: "New" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
  { id: "disputed", label: "Dispute" },
] as const;

function displayStatus(status: DeliveryStatus): string {
  switch (status) {
    case "processing":
      return "New";
    case "shipped":
    case "in_transit":
      return "Shipped";
    case "delivered":
    case "confirmed":
      return "Delivered";
    case "disputed":
      return "Dispute";
    default:
      return status;
  }
}

function badgeVariant(status: DeliveryStatus): "warning" | "info" | "success" | "danger" | "neutral" {
  switch (displayStatus(status)) {
    case "New":
      return "warning";
    case "Shipped":
      return "info";
    case "Delivered":
      return "success";
    case "Dispute":
      return "danger";
    default:
      return "neutral";
  }
}

function matchesTab(status: DeliveryStatus, tab: string): boolean {
  if (tab === "all") return true;
  if (tab === "processing") return status === "processing";
  if (tab === "shipped") return status === "shipped" || status === "in_transit";
  if (tab === "delivered") return status === "delivered" || status === "confirmed";
  if (tab === "disputed") return status === "disputed" || status === "refunded";
  return true;
}

function OrdersList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "all";
  const page = Number(searchParams.get("page") ?? "1");

  const apiStatus =
    tab === "processing" || tab === "disputed" ? tab : undefined;
  const { data, isLoading } = useOrders({
    deliveryStatus: (apiStatus as DeliveryStatus | undefined) ?? undefined,
    page,
    limit: 20,
  });

  const items = (data?.items ?? []).filter((order) => matchesTab(order.deliveryStatus, tab));

  const setTab = (id: string) => {
    const params = new URLSearchParams();
    if (id !== "all") params.set("tab", id);
    router.replace(`/dashboard/orders?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
        <p className="text-sm text-muted mt-0.5">
          Fulfil orders, add tracking, and watch escrow until the buyer confirms.
        </p>
      </div>

      <Tabs
        items={TABS.map((t) => ({ id: t.id, label: t.label }))}
        activeId={tab}
        onChange={setTab}
      />

      {isLoading ? (
        <Spinner label="Loading orders…" />
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Package className="w-6 h-6" />}
            title="No orders here"
            description="When a buyer pays, the order lands in New until you ship it."
          />
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((order) => {
            const cover = order.items[0]?.image;
            return (
              <li key={order.id}>
                <Link
                  href={`/dashboard/orders/${order.id}`}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-white p-4 hover:border-primary/40 transition-colors"
                >
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-bg-soft border border-border shrink-0">
                    {cover ? (
                      <Image src={cover} alt="" fill className="object-cover" sizes="56px" />
                    ) : (
                      <Package className="w-5 h-5 m-auto mt-4 text-muted" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{order.orderNumber}</p>
                    <p className="text-xs text-muted">
                      {order.items.length} item{order.items.length === 1 ? "" : "s"} •{" "}
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold">{formatNaira(order.totalAmount)}</p>
                    <Badge variant={badgeVariant(order.deliveryStatus)} className="mt-1">
                      {displayStatus(order.deliveryStatus)}
                    </Badge>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {(data?.totalPages ?? 1) > 1 && (
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() =>
              router.replace(`/dashboard/orders?tab=${tab}&page=${page - 1}`)
            }
          >
            Previous
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= (data?.totalPages ?? 1)}
            onClick={() =>
              router.replace(`/dashboard/orders?tab=${tab}&page=${page + 1}`)
            }
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<Spinner label="Loading orders…" />}>
      <OrdersList />
    </Suspense>
  );
}
