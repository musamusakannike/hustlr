"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { useAnalyticsOverview, useRevenueTrend, useTopProducts } from "@/hooks/useCommerce";
import { formatNaira } from "@/lib/utils";

export default function AnalyticsPage() {
  const { data: overview, isLoading } = useAnalyticsOverview();
  const { data: trend } = useRevenueTrend("30d");
  const { data: top } = useTopProducts();

  const maxRevenue = Math.max(1, ...(trend ?? []).map((p) => p.revenue));

  if (isLoading) return <Spinner label="Loading analytics…" />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
        <p className="text-sm text-muted mt-0.5">Revenue, orders, and what is selling.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Revenue", value: formatNaira(overview?.totalRevenue ?? 0) },
          { label: "This month", value: formatNaira(overview?.revenueThisMonth ?? 0) },
          { label: "Orders", value: String(overview?.totalOrders ?? 0) },
          { label: "Customers", value: String(overview?.totalCustomers ?? 0) },
        ].map((stat) => (
          <Card key={stat.label} className="p-5">
            <p className="text-xs uppercase tracking-wider text-muted font-semibold">{stat.label}</p>
            <p className="text-2xl font-bold font-archivo mt-2">{stat.value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="font-bold text-lg mb-4">Revenue (30 days)</h3>
        {(trend ?? []).length === 0 ? (
          <p className="text-sm text-muted">No paid orders in this window yet.</p>
        ) : (
          <div className="flex items-end gap-1 h-40">
            {trend!.map((point) => (
              <div key={point.date} className="flex-1 flex flex-col justify-end items-center gap-1 min-w-0">
                <div
                  className="w-full rounded-t bg-primary"
                  style={{ height: `${Math.max(6, (point.revenue / maxRevenue) * 100)}%` }}
                  title={`${point.date}: ${formatNaira(point.revenue)}`}
                />
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h3 className="font-bold text-lg mb-4">Top products</h3>
        {(top ?? []).length === 0 ? (
          <p className="text-sm text-muted">No product performance yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {(top ?? []).slice(0, 8).map((row, i) => (
              <li key={row.productId ?? i} className="flex justify-between py-2 text-sm">
                <span className="font-semibold truncate">{row.title ?? "Product"}</span>
                <span>{formatNaira(row.revenue)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
