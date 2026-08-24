"use client";

import React, { useState } from "react";
import { TicketPercent } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import {
  useCoupons,
  useCreateCoupon,
  useDeleteCoupon,
  useToggleCoupon,
} from "@/hooks/useCommerce";
import { formatNaira, getErrorMessage } from "@/lib/utils";
import type { CouponInput, CouponType } from "@/types/coupon";

export default function CouponsPage() {
  const { toast } = useToast();
  const { data, isLoading } = useCoupons({ limit: 50 });
  const create = useCreateCoupon();
  const toggle = useToggleCoupon();
  const remove = useDeleteCoupon();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CouponInput>({
    code: "",
    type: "percentage",
    value: 10,
  });

  const items = data?.items ?? [];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Coupons</h2>
          <p className="text-sm text-muted mt-0.5">
            Percentage or fixed discounts buyers can apply at checkout.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>New coupon</Button>
      </div>

      {isLoading ? (
        <Spinner label="Loading coupons…" />
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon={<TicketPercent className="w-6 h-6" />}
            title="No coupons yet"
            description="Create a code like WELCOME10 to reward first-time buyers."
            action={<Button onClick={() => setOpen(true)}>Create coupon</Button>}
          />
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((c) => (
            <li key={c.id}>
              <Card className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-mono font-bold">{c.code}</p>
                  <p className="text-sm text-muted">
                    {c.type === "percentage" ? `${c.value}% off` : `${formatNaira(c.value)} off`}
                    {c.minimumOrderAmount
                      ? ` • min ${formatNaira(c.minimumOrderAmount)}`
                      : ""}
                    {` • used ${c.currentUsageCount}${c.maxUsageCount ? `/${c.maxUsageCount}` : ""}`}
                  </p>
                </div>
                <Badge variant={c.isActive ? "success" : "neutral"}>
                  {c.isActive ? "Active" : "Off"}
                </Badge>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      toggle.mutate(c.id, {
                        onError: (err) => toast(getErrorMessage(err), "error"),
                      })
                    }
                  >
                    {c.isActive ? "Disable" : "Enable"}
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() =>
                      remove.mutate(c.id, {
                        onError: (err) => toast(getErrorMessage(err), "error"),
                      })
                    }
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Create coupon">
        <div className="flex flex-col gap-4">
          <Input
            label="Code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="WELCOME10"
          />
          <Select
            label="Type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as CouponType })}
            options={[
              { value: "percentage", label: "Percentage" },
              { value: "fixed", label: "Fixed amount (₦)" },
            ]}
          />
          <Input
            label="Value"
            type="number"
            min={1}
            value={form.value}
            onChange={(e) => setForm({ ...form, value: Number(e.target.value) || 0 })}
          />
          <Input
            label="Minimum order (optional)"
            type="number"
            min={0}
            value={form.minimumOrderAmount ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                minimumOrderAmount: e.target.value ? Number(e.target.value) : null,
              })
            }
          />
          <Button
            disabled={!form.code.trim() || !form.value}
            loading={create.isPending}
            onClick={() =>
              create.mutate(form, {
                onSuccess: () => {
                  toast("Coupon created.", "success");
                  setOpen(false);
                  setForm({ code: "", type: "percentage", value: 10 });
                },
                onError: (err) => toast(getErrorMessage(err), "error"),
              })
            }
          >
            Save coupon
          </Button>
        </div>
      </Modal>
    </div>
  );
}
