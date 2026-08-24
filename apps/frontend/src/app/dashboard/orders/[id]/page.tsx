"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check, Truck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useAdvanceOrder, useOrder, useShipOrder } from "@/hooks/useCommerce";
import { formatNaira, formatDateTime, getErrorMessage, cn } from "@/lib/utils";
import type { DeliveryStatus } from "@/types/order";

const STEPS: { id: DeliveryStatus | "confirmed"; label: string }[] = [
  { id: "processing", label: "New" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
  { id: "confirmed", label: "Confirmed" },
];

function stepIndex(status: DeliveryStatus): number {
  if (status === "processing") return 0;
  if (status === "shipped" || status === "in_transit") return 1;
  if (status === "delivered") return 2;
  if (status === "confirmed") return 3;
  if (status === "disputed") return 3;
  return 0;
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const { data: order, isLoading } = useOrder(id);
  const ship = useShipOrder();
  const advance = useAdvanceOrder();

  const [shipOpen, setShipOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingNote, setTrackingNote] = useState("");

  if (isLoading || !order) {
    return <Spinner label="Loading order…" />;
  }

  const current = stepIndex(order.deliveryStatus);
  const canShip = order.deliveryStatus === "processing" && order.paymentStatus === "paid";
  const canTransit = order.deliveryStatus === "shipped";
  const canDeliver = order.deliveryStatus === "in_transit" || order.deliveryStatus === "shipped";

  const handleShip = () => {
    ship.mutate(
      { orderId: order.id, input: { trackingNumber, trackingNote } },
      {
        onSuccess: () => {
          toast("Order marked as shipped.", "success");
          setShipOpen(false);
        },
        onError: (err) => toast(getErrorMessage(err), "error"),
      }
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/orders")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="min-w-0">
          <h2 className="text-2xl font-bold tracking-tight truncate">{order.orderNumber}</h2>
          <p className="text-sm text-muted">{formatDateTime(order.createdAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {STEPS.map((step, i) => (
          <div key={step.id} className="flex flex-col items-center gap-1">
            <span
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                i <= current ? "bg-primary text-white" : "bg-neutral-200 text-muted"
              )}
            >
              {i < current ? <Check className="w-4 h-4" /> : i + 1}
            </span>
            <span className="text-[11px] font-semibold text-muted">{step.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <h3 className="font-bold text-lg mb-4">Items</h3>
            <ul className="divide-y divide-border">
              {order.items.map((item, i) => (
                <li key={`${item.productId}-${i}`} className="flex items-center gap-3 py-3">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-bg-soft border border-border shrink-0">
                    {item.image ? (
                      <Image src={item.image} alt="" fill className="object-cover" sizes="56px" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{item.title}</p>
                    <p className="text-xs text-muted">
                      Qty {item.quantity}
                      {Object.keys(item.selectedVariants || {}).length > 0 &&
                        ` • ${Object.values(item.selectedVariants).join(" / ")}`}
                    </p>
                  </div>
                  <p className="font-semibold">{formatNaira(item.price * item.quantity)}</p>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <h3 className="font-bold text-lg mb-4">Ship to</h3>
            <p className="font-semibold">{order.shippingAddress.fullName}</p>
            <p className="text-sm text-muted mt-1 leading-relaxed">
              {order.shippingAddress.streetAddress}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.zipCode}
              <br />
              {order.shippingAddress.country}
              <br />
              {order.shippingAddress.phoneNumber}
            </p>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <h3 className="font-bold text-lg mb-4">Payment</h3>
            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="font-semibold">{formatNaira(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Shipping</dt>
                <dd className="font-semibold">{formatNaira(order.shippingTotal)}</dd>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted">Discount</dt>
                  <dd className="font-semibold">-{formatNaira(order.discountAmount)}</dd>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-border">
                <dt className="font-bold">Total</dt>
                <dd className="font-bold">{formatNaira(order.totalAmount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Escrow</dt>
                <dd>
                  <Badge variant={order.escrowStatus === "released" ? "success" : "warning"}>
                    {order.escrowStatus}
                  </Badge>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Your payout</dt>
                <dd className="font-semibold">{formatNaira(order.payoutAmount)}</dd>
              </div>
            </dl>
          </Card>

          {order.trackingNumber && (
            <Card>
              <p className="text-xs uppercase tracking-wider text-muted font-semibold">Tracking</p>
              <p className="font-mono font-semibold mt-1">{order.trackingNumber}</p>
              {order.trackingNote && (
                <p className="text-sm text-muted mt-1">{order.trackingNote}</p>
              )}
            </Card>
          )}

          <div className="flex flex-col gap-2">
            {canShip && (
              <Button onClick={() => setShipOpen(true)}>
                <Truck className="w-4 h-4" />
                Mark as shipped
              </Button>
            )}
            {canTransit && (
              <Button
                variant="outline"
                loading={advance.isPending}
                onClick={() =>
                  advance.mutate(
                    { orderId: order.id, action: "inTransit" },
                    {
                      onSuccess: () => toast("Marked in transit.", "success"),
                      onError: (err) => toast(getErrorMessage(err), "error"),
                    }
                  )
                }
              >
                Mark in transit
              </Button>
            )}
            {canDeliver && (
              <Button
                variant="outline"
                loading={advance.isPending}
                onClick={() =>
                  advance.mutate(
                    { orderId: order.id, action: "delivered" },
                    {
                      onSuccess: () => toast("Marked delivered.", "success"),
                      onError: (err) => toast(getErrorMessage(err), "error"),
                    }
                  )
                }
              >
                Mark delivered
              </Button>
            )}
            {order.invoiceUrl && (
              <a href={order.invoiceUrl} target="_blank" rel="noreferrer">
                <Button variant="outline" fullWidth>
                  Download invoice
                </Button>
              </a>
            )}
            {order.deliveryStatus === "disputed" && (
              <Link href="/dashboard/disputes">
                <Button variant="danger" fullWidth>
                  Open dispute
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={shipOpen}
        onClose={() => setShipOpen(false)}
        title="Add tracking"
        description="Share a carrier and tracking ID so the buyer can follow the parcel."
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Tracking number"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="e.g. DHL123456789"
            required
          />
          <Textarea
            label="Note (optional)"
            rows={3}
            value={trackingNote}
            onChange={(e) => setTrackingNote(e.target.value)}
            placeholder="Shipped via DHL, 3–5 business days"
          />
          <Button
            onClick={handleShip}
            loading={ship.isPending}
            disabled={!trackingNumber.trim()}
          >
            Confirm shipment
          </Button>
        </div>
      </Modal>
    </div>
  );
}
