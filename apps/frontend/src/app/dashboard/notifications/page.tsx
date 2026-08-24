"use client";

import React from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useMarkAllRead, useNotifications } from "@/hooks/useCommerce";
import { relativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications({ limit: 50 });
  const markAll = useMarkAllRead();
  const items = data?.items ?? [];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
          <p className="text-sm text-muted mt-0.5">Orders, KYC, and payouts.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => markAll.mutate()} loading={markAll.isPending}>
          Mark all read
        </Button>
      </div>

      {isLoading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <Card>
          <EmptyState icon={<Bell className="w-6 h-6" />} title="You're all caught up" />
        </Card>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((n) => {
            const inner = (
              <div
                className={cn(
                  "rounded-2xl border p-4",
                  n.isRead ? "border-border bg-white" : "border-primary/30 bg-primary-light/20"
                )}
              >
                <p className="font-semibold text-sm">{n.title}</p>
                <p className="text-sm text-muted mt-0.5">{n.message}</p>
                <p className="text-xs text-subtle mt-2">{relativeTime(n.createdAt)}</p>
              </div>
            );
            return (
              <li key={n.id}>
                {n.link ? <Link href={n.link}>{inner}</Link> : inner}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
