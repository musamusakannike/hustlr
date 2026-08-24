"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import EmptyState from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { useStore } from "@/hooks/useStore";
import { usePlanEntitlements } from "@/hooks/useSubscription";
import { useSetDomain, useVerifyDomain } from "@/hooks/useCommerce";
import { domainService } from "@/services/commerce";
import { getErrorMessage } from "@/lib/utils";

export default function DomainSettingsPage() {
  const { entitlements } = usePlanEntitlements();
  const { data: store } = useStore();
  const { toast } = useToast();
  const setDomain = useSetDomain();
  const verify = useVerifyDomain();
  const [domain, setDomainValue] = useState(store?.customDomain ?? "");
  const [dns, setDns] = useState<{ note?: string; cname?: { host: string; value: string } } | null>(
    null
  );

  if (!entitlements.allowCustomDomain) {
    return (
      <Card>
        <EmptyState
          title="Custom domains are Pro+"
          description="Map www.yourbrand.com to your storefront on the Pro+ plan."
          action={
            <Link href="/dashboard/billing">
              <Button>Upgrade</Button>
            </Link>
          }
        />
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Custom domain</h2>
        <p className="text-sm text-muted mt-0.5">
          Point a CNAME at the Hustlr host, then verify. SSL is provisioned after DNS lands.
        </p>
      </div>

      <Card className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">Status</span>
          <Badge variant={store?.customDomainVerified ? "success" : "warning"}>
            {store?.customDomainVerified ? "Verified" : "Not verified"}
          </Badge>
        </div>
        <Input
          label="Domain"
          placeholder="www.yourstore.com"
          value={domain}
          onChange={(e) => setDomainValue(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            loading={setDomain.isPending}
            onClick={() =>
              setDomain.mutate(domain.trim(), {
                onSuccess: (res) => {
                  setDns(res.dns);
                  toast("Domain saved. Add the DNS records below.", "success");
                },
                onError: (err) => toast(getErrorMessage(err), "error"),
              })
            }
          >
            Save domain
          </Button>
          <Button
            variant="outline"
            loading={verify.isPending}
            onClick={() =>
              verify.mutate(undefined, {
                onSuccess: (res) =>
                  toast(res.verified ? "Domain verified." : "DNS not found yet.", "success"),
                onError: (err) => toast(getErrorMessage(err), "error"),
              })
            }
          >
            Verify DNS
          </Button>
          {store?.customDomain && (
            <Button
              variant="danger"
              onClick={async () => {
                try {
                  await domainService.remove();
                  toast("Custom domain removed.", "success");
                } catch (err) {
                  toast(getErrorMessage(err), "error");
                }
              }}
            >
              Remove
            </Button>
          )}
        </div>
        {dns?.cname && (
          <div className="rounded-xl bg-bg-soft p-4 text-sm font-mono">
            <p>CNAME {dns.cname.host} → {dns.cname.value}</p>
            {dns.note && <p className="font-sans text-muted mt-2">{dns.note}</p>}
          </div>
        )}
      </Card>
    </div>
  );
}
