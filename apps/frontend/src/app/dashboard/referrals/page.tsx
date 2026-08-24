"use client";

import React from "react";
import { Gift } from "lucide-react";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useReferrals } from "@/hooks/useCommerce";
import { formatDate } from "@/lib/utils";

export default function ReferralsPage() {
  const { data, isLoading } = useReferrals();
  const { toast } = useToast();
  const code = data?.code ?? "";
  const list = data?.referrals ?? [];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Referrals</h2>
        <p className="text-sm text-muted mt-0.5">
          Share your code. When a seller you invited pays for their first plan, you earn wallet credit.
        </p>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <Card className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider text-muted font-semibold">Your code</p>
              <p className="text-2xl font-mono font-bold mt-1">{code || "—"}</p>
            </div>
            <Button
              variant="outline"
              disabled={!code}
              onClick={async () => {
                await navigator.clipboard.writeText(code);
                toast("Code copied.", "success");
              }}
            >
              Copy
            </Button>
          </Card>

          {list.length === 0 ? (
            <Card>
              <EmptyState
                icon={<Gift className="w-6 h-6" />}
                title="No referrals yet"
                description="Share your code on socials or with friends launching a store."
              />
            </Card>
          ) : (
            <Card>
              <ul className="divide-y divide-border">
                {list.map((row) => (
                  <li key={row.id} className="flex justify-between py-3 text-sm">
                    <span>{row.status ?? "recorded"}</span>
                    <span className="text-muted">{formatDate(row.createdAt)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
