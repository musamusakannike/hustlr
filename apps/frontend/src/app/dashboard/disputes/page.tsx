"use client";

import React from "react";
import Link from "next/link";
import { MessageSquareWarning } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useSellerDisputes } from "@/hooks/useCommerce";
import { formatDate } from "@/lib/utils";

export default function DisputesPage() {
  const { data, isLoading } = useSellerDisputes({ limit: 50 });
  const items = data?.items ?? [];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Disputes</h2>
        <p className="text-sm text-muted mt-0.5">
          Reply to buyers here. Platform admins issue the final ruling.
        </p>
      </div>

      {isLoading ? (
        <Spinner label="Loading disputes…" />
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon={<MessageSquareWarning className="w-6 h-6" />}
            title="No open disputes"
            description="If a buyer raises an issue after delivery, it will appear in this queue."
          />
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((d) => (
            <li key={d.id}>
              <Link
                href={`/dashboard/disputes/${d.id}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-white p-4 hover:border-primary/40"
              >
                <div className="min-w-0">
                  <p className="font-semibold truncate">{d.reason}</p>
                  <p className="text-xs text-muted">
                    {d.order?.orderNumber ?? "Order"} • {formatDate(d.createdAt)}
                  </p>
                </div>
                <Badge
                  variant={
                    d.status === "Resolved"
                      ? "success"
                      : d.status === "Open"
                        ? "warning"
                        : "info"
                  }
                >
                  {d.status}
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
