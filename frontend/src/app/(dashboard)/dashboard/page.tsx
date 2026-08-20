"use client";

import React from "react";
import Link from "next/link";
import {
  Package,
  PackageCheck,
  FolderTree,
  ShieldCheck,
  CreditCard,
  Globe2,
  Plus,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge, StatusDot } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import OnboardingChecklist, {
  buildOnboardingSteps,
} from "@/components/dashboard/OnboardingChecklist";
import { useStore } from "@/hooks/useStore";
import { useKyc } from "@/hooks/useKyc";
import {
  useCurrentSubscription,
  usePlanEntitlements,
} from "@/hooks/useSubscription";
import { useProducts } from "@/hooks/useProducts";
import { formatNaira, formatDate } from "@/lib/utils";

export default function DashboardOverviewPage() {
  const { data: store, isLoading: storeLoading } = useStore();
  const { data: kyc } = useKyc();
  const { data: subscription } = useCurrentSubscription();
  const { data: productPage } = useProducts({ limit: 100 });

  const { entitlements } = usePlanEntitlements();
  const products = productPage?.items ?? [];
  const activeProducts = products.filter((p) => p.status === "active");

  const isLoading = storeLoading;

  const steps = buildOnboardingSteps({
    store,
    kyc,
    subscription,
    hasProducts: products.length > 0,
  });

  const kycBadge = () => {
    switch (kyc?.status) {
      case "approved":
        return <Badge variant="success">Approved</Badge>;
      case "pending":
        return <Badge variant="warning">Under Review</Badge>;
      case "rejected":
        return <Badge variant="danger">Rejected</Badge>;
      case "info_requested":
        return <Badge variant="warning">Info Requested</Badge>;
      default:
        return <Badge variant="neutral">Not Started</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <OnboardingChecklist steps={steps} isLoading={isLoading} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="w-10 h-10 rounded-xl bg-primary-light/60 text-primary flex items-center justify-center">
              <Package className="w-5 h-5" />
            </span>
            {entitlements.maxProducts !== null && (
              <span className="text-xs font-semibold text-muted">
                limit {entitlements.maxProducts}
              </span>
            )}
          </div>
          <p className="text-3xl font-bold font-archivo tracking-tight">
            {products.length}
          </p>
          <p className="text-sm text-muted mt-1">Total products</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="w-10 h-10 rounded-xl bg-success-light text-success flex items-center justify-center">
              <PackageCheck className="w-5 h-5" />
            </span>
          </div>
          <p className="text-3xl font-bold font-archivo tracking-tight">
            {activeProducts.length}
          </p>
          <p className="text-sm text-muted mt-1">Active listings</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="w-10 h-10 rounded-xl bg-info-light text-info flex items-center justify-center">
              <FolderTree className="w-5 h-5" />
            </span>
          </div>
          <p className="text-3xl font-bold font-archivo tracking-tight">
            {new Set(products.map((p) => p.category).filter(Boolean)).size}
          </p>
          <p className="text-sm text-muted mt-1">Categories</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="w-10 h-10 rounded-xl bg-warning-light text-warning flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </span>
          </div>
          <p className="text-sm font-semibold mt-0.5">{kycBadge()}</p>
          <p className="text-sm text-muted mt-1">KYC status</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Current Plan"
            description={
              subscription
                ? `${subscription.planName.toUpperCase()} • ${subscription.billingCycle}`
                : "No subscription yet — required to go live"
            }
            action={
              <Link href="/dashboard/billing">
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </Link>
            }
          />
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted">Status</span>
              {subscription ? (
                <Badge
                  variant={
                    subscription.status === "active" ? "success" : "warning"
                  }
                >
                  {subscription.status.replace("_", " ")}
                </Badge>
              ) : (
                <Badge variant="neutral">none</Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Platform commission</span>
              <span className="font-semibold">
                {entitlements.commissionPercent}%
              </span>
            </div>
            {subscription?.endDate && (
              <div className="flex items-center justify-between">
                <span className="text-muted">Renews</span>
                <span className="font-semibold">
                  {formatDate(subscription.endDate)}
                </span>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Store Status"
            description={`${store?.slug ?? "your-store"}.hustlr.online`}
            action={
              <Link href="/dashboard/setup">
                <Button variant="outline" size="sm">
                  Settings
                </Button>
              </Link>
            }
          />
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted">Visibility</span>
              <span className="inline-flex items-center gap-2 font-semibold">
                <StatusDot variant={store?.isLive ? "success" : "warning"} />
                {store?.isLive ? "Live — buyers can shop" : "Offline"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Template</span>
              <span className="font-semibold">
                {store?.templateId ? "Selected" : "Not selected"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Currency</span>
              <span className="font-semibold">
                {store?.currencySymbol ?? "₦"} {store?.currency ?? "NGN"}
              </span>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Recent products"
          description="Your latest listings"
          action={
            <Link href="/dashboard/products/new">
              <Button size="sm">
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            </Link>
          }
        />
        {products.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-muted mb-4">
              No products yet. Add your first product to get your store ready.
            </p>
            <Link href="/dashboard/products/new">
              <Button>
                <Plus className="w-4 h-4" />
                Add Your First Product
              </Button>
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {products.slice(0, 4).map((product) => (
              <li
                key={product.id}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {product.title}
                  </p>
                  <p className="text-xs text-muted">
                    {formatNaira(product.price)} • {product.stock} in stock
                  </p>
                </div>
                <Badge
                  variant={
                    product.status === "active"
                      ? "success"
                      : product.status === "draft"
                        ? "neutral"
                        : "outline"
                  }
                >
                  {product.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {isLoading && (
        <div className="sr-only">
          <Spinner />
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-muted">
        <Globe2 className="w-4 h-4" />
        <span>
          Buyers will shop at{" "}
          <span className="font-mono text-primary font-medium">
            {store?.slug ?? "your-store"}.hustlr.online
          </span>{" "}
          once your store is live.
        </span>
        <CreditCard className="w-4 h-4 ml-2" />
        <span>Payments are protected with Paystack escrow.</span>
      </div>
    </div>
  );
}
