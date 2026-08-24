"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useBuyerAuth } from "@/context/BuyerAuthContext";
import { useBuyerOrder, useConfirmReceipt } from "@/hooks/useStorefront";
import { formatNaira, formatDateTime, getErrorMessage } from "@/lib/utils";
import { storeHref } from "@/lib/store-path";

export default function BuyerOrderDetailPage() {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const { isAuthenticated, isLoading: authLoading } = useBuyerAuth();
  const router = useRouter();
  const { data: order, isLoading } = useBuyerOrder(id);
  const confirm = useConfirmReceipt();
  const { toast } = useToast();

  if (authLoading) return <Spinner />;
  if (!isAuthenticated) {
    router.replace(storeHref(slug, "/auth/login"));
    return <Spinner />;
  }
  if (isLoading || !order) return <Spinner />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
      <p className="text-sm opacity-70">{formatDateTime(order.createdAt)}</p>
      <p className="mt-4 font-bold">{formatNaira(order.totalAmount)}</p>
      <p className="text-sm mt-1 capitalize">
        {order.deliveryStatus} · escrow {order.escrowStatus}
      </p>
      {order.trackingNumber && (
        <p className="text-sm mt-3 font-mono">Tracking {order.trackingNumber}</p>
      )}
      <ul className="mt-6 divide-y">
        {order.items.map((item, i) => (
          <li key={i} className="py-3 flex justify-between text-sm">
            <span>
              {item.title} × {item.quantity}
            </span>
            <span>{formatNaira(item.price * item.quantity)}</span>
          </li>
        ))}
      </ul>
      {order.deliveryStatus === "delivered" && (
        <Button
          className="mt-6"
          loading={confirm.isPending}
          onClick={() =>
            confirm.mutate(order.id, {
              onSuccess: () => toast("Thanks — escrow will release to the seller.", "success"),
              onError: (err) => toast(getErrorMessage(err), "error"),
            })
          }
        >
          Confirm I received this
        </Button>
      )}
    </div>
  );
}
