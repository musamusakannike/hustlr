"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  ShoppingBag,
  Wallet,
  Tag,
  AlertTriangle,
  Info,
  Clock,
  Package,
  CreditCard,
  Globe2,
  Loader2,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge, StatusDot } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import OnboardingChecklist, {
  buildOnboardingSteps,
} from "@/components/dashboard/OnboardingChecklist";
import { useStore } from "@/hooks/useStore";
import { useKyc } from "@/hooks/useKyc";
import { useCurrentSubscription, usePlanEntitlements } from "@/hooks/useSubscription";
import { useProducts } from "@/hooks/useProducts";
import { useOrderStats, useWallet } from "@/hooks/useCommerce";
import { useSellerAuth } from "@/context/SellerAuthContext";
import { formatNaira, formatDate, storePublicUrl } from "@/lib/utils";
import type { KycStatus } from "@/types/kyc";

function compactNumber(num: number): string {
  if (!num || Number.isNaN(num)) return "0";
  if (num < 1000) return String(num);
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}K`;
}

const KYC_MODAL_STATUSES: Array<KycStatus | undefined> = [
  "draft",
  "rejected",
  "info_requested",
  "pending",
];

export default function DashboardOverviewPage() {
  const { user } = useSellerAuth();
  const { data: store, isLoading: storeLoading } = useStore();
  const { data: kyc } = useKyc();
  const { data: subscription } = useCurrentSubscription();
  const { data: productPage } = useProducts({ limit: 8 });
  const { data: stats, isLoading: statsLoading } = useOrderStats();
  const { data: wallet, isLoading: walletLoading } = useWallet();
  const { entitlements } = usePlanEntitlements();

  const products = productPage?.items ?? [];
  const firstName = user?.name?.split(" ")[0] ?? "there";
  const [kycOpen, setKycOpen] = useState(false);

  useEffect(() => {
    if (!kyc) return;
    if (KYC_MODAL_STATUSES.includes(kyc.status)) setKycOpen(true);
  }, [kyc]);

  const steps = buildOnboardingSteps({
    store,
    kyc,
    subscription,
    hasProducts: (productPage?.total ?? products.length) > 0,
  });

  const kycConfig = (() => {
    if (kyc?.status === "rejected") {
      return {
        icon: <AlertTriangle className="w-6 h-6 text-danger" />,
        title: "We couldn't verify your account.",
        message:
          kyc.reviewerNote ||
          "Please review the notes from our team and resubmit your documents.",
        primary: { href: "/dashboard/kyc", label: "Try again" },
        secondary: { href: "/dashboard/support", label: "Contact support" },
      };
    }
    if (kyc?.status === "info_requested") {
      return {
        icon: <Info className="w-6 h-6 text-warning" />,
        title: "We need a clearer document.",
        message:
          kyc.reviewerNote ||
          "Please re-upload the requested files so we can finish verification.",
        primary: { href: "/dashboard/kyc", label: "Re-upload documents" },
        secondary: { href: "/dashboard/support", label: "Contact support" },
      };
    }
    if (kyc?.status === "pending") {
      return {
        icon: <Clock className="w-6 h-6 text-warning" />,
        title: "Verification in progress",
        message:
          "Your verification is under review. We'll notify you once it's approved.",
        primary: { href: "/dashboard/kyc", label: "View status" },
        secondary: null,
      };
    }
    return {
      icon: <Info className="w-6 h-6 text-primary" />,
      title: "Seller verification required",
      message:
        "Complete KYC so you can go live, receive payouts, and keep buyer trust.",
      primary: { href: "/dashboard/kyc", label: "Verify now" },
      secondary: null,
    };
  })();

  const shortcuts = [
    { href: "/dashboard/products/new", label: "List a product", icon: Tag },
    { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
    { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
    { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome {firstName}
          </h2>
          <p className="text-sm text-muted mt-1">
            {store?.isLive
              ? "Your store is live and accepting orders."
              : "Finish setup to take your store live."}
          </p>
        </div>
      </div>

      <OnboardingChecklist steps={steps} isLoading={storeLoading} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Orders
          </p>
          {statsLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-primary my-3" />
          ) : (
            <p className="text-3xl font-bold font-archivo tracking-tight text-primary mt-2">
              {compactNumber(stats?.totalOrders ?? 0)}
            </p>
          )}
          <p className="text-xs text-subtle mt-1">
            {compactNumber(stats?.ordersToday ?? 0)} new today
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            In escrow
          </p>
          {walletLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-primary my-3" />
          ) : (
            <p className="text-3xl font-bold font-archivo tracking-tight text-primary mt-2">
              {formatNaira(wallet?.pendingBalance ?? 0)}
            </p>
          )}
          <p className="text-xs text-subtle mt-1">Pending release</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Available
          </p>
          {walletLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-primary my-3" />
          ) : (
            <p className="text-3xl font-bold font-archivo tracking-tight text-primary mt-2">
              {formatNaira(wallet?.balance ?? 0)}
            </p>
          )}
          <p className="text-xs text-subtle mt-1">Ready to withdraw</p>
        </Card>
      </div>

      <Link href="/dashboard/products/new">
        <Button size="lg" fullWidth className="justify-center">
          <Plus className="w-5 h-5" />
          List a product
        </Button>
      </Link>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {shortcuts.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-2xl border border-border bg-white p-4 hover:border-primary/40 hover:shadow-sm transition-all"
          >
            <item.icon className="w-5 h-5 text-primary mb-2" />
            <p className="text-sm font-semibold">{item.label}</p>
          </Link>
        ))}
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
                <Badge variant={subscription.status === "active" ? "success" : "warning"}>
                  {subscription.status.replace("_", " ")}
                </Badge>
              ) : (
                <Badge variant="neutral">none</Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Platform commission</span>
              <span className="font-semibold">{entitlements.commissionPercent}%</span>
            </div>
            {subscription?.endDate && (
              <div className="flex items-center justify-between">
                <span className="text-muted">Renews</span>
                <span className="font-semibold">{formatDate(subscription.endDate)}</span>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Store Status"
            description={store?.slug ? storePublicUrl(store.slug) : "Not configured"}
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
              <span className="text-muted">Products</span>
              <span className="font-semibold inline-flex items-center gap-1">
                <Package className="w-3.5 h-3.5" />
                {productPage?.total ?? products.length}
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
            <Link href="/dashboard/products">
              <Button variant="outline" size="sm">
                View all
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
              <li key={product.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{product.title}</p>
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

      {store?.slug && (
        <div className="flex items-center gap-2 text-xs text-muted">
          <Globe2 className="w-4 h-4" />
          <span>
            Buyers shop at{" "}
            <a
              href={storePublicUrl(store.slug)}
              className="font-mono text-primary font-medium"
              target="_blank"
              rel="noreferrer"
            >
              {storePublicUrl(store.slug).replace(/^https?:\/\//, "")}
            </a>
          </span>
        </div>
      )}

      <Modal
        isOpen={kycOpen && kyc?.status !== "approved"}
        onClose={() => setKycOpen(false)}
        title={kycConfig.title}
        description={kycConfig.message}
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-light/60 flex items-center justify-center">
            {kycConfig.icon}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link href={kycConfig.primary.href} className="flex-1">
              <Button fullWidth>{kycConfig.primary.label}</Button>
            </Link>
            {kycConfig.secondary ? (
              <Link href={kycConfig.secondary.href} className="flex-1">
                <Button variant="outline" fullWidth>
                  {kycConfig.secondary.label}
                </Button>
              </Link>
            ) : (
              <Button variant="outline" fullWidth onClick={() => setKycOpen(false)}>
                Maybe later
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
