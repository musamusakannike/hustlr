"use client";

import React, { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  Search,
  Pencil,
  Archive,
  CheckCircle2,
  Circle,
  MoreVertical,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import Tabs from "@/components/ui/Tabs";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import {
  useProducts,
  useCategories,
  useBulkProductStatus,
  useArchiveProduct,
  useSetProductStatus,
} from "@/hooks";
import Dropdown from "@/components/ui/Dropdown";
import { usePlanEntitlements } from "@/hooks/useSubscription";
import { formatNaira, getErrorMessage, cn } from "@/lib/utils";
import type { Product, ProductStatus } from "@/types/product";

function ProductsTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const status = searchParams.get("status") ?? "all";
  const category = searchParams.get("category") ?? "";
  const search = searchParams.get("q") ?? "";
  const page = Number(searchParams.get("page") ?? "1");

  const [searchInput, setSearchInput] = useState(search);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data: categories } = useCategories();
  const { data, isLoading } = useProducts({
    status: status as ProductStatus | "all",
    category: categories?.find((c) => c.slug === category)?.name ?? undefined,
    search: search || undefined,
    page,
    limit: 10,
  });
  const bulkStatus = useBulkProductStatus();
  const archive = useArchiveProduct();
  const setStatus = useSetProductStatus();
  const { entitlements } = usePlanEntitlements();

  const products = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== "page") params.delete("page");
    router.replace(`/dashboard/products?${params.toString()}`, {
      scroll: false,
    });
  };

  const allSelected =
    products.length > 0 && products.every((p) => selected.has(p.id));
  const toggleAll = () => {
    setSelected(
      allSelected
        ? new Set()
        : new Set(products.filter((p) => p.status !== "archived").map((p) => p.id))
    );
  };
  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulk = (target: ProductStatus) => {
    bulkStatus.mutate(
      { productIds: Array.from(selected), status: target },
      {
        onSuccess: (res) => {
          toast(`${res.updated} product(s) updated.`, "success");
          setSelected(new Set());
        },
        onError: (err) => toast(getErrorMessage(err), "error"),
      }
    );
  };

  const handleArchive = (product: Product) => {
    archive.mutate(product.id, {
      onSuccess: () => toast(`"${product.title}" archived.`, "success"),
      onError: (err) => toast(getErrorMessage(err), "error"),
    });
  };

  const stockBadge = (product: Product) => {
    const totalStock = product.hasVariants
      ? product.variantCombinations.reduce((sum, c) => sum + c.stock, 0)
      : product.stock;
    if (product.status === "archived") return <Badge variant="outline">archived</Badge>;
    if (totalStock === 0) return <Badge variant="danger">out of stock</Badge>;
    if (totalStock <= 5) return <Badge variant="warning">low: {totalStock}</Badge>;
    return <Badge variant="neutral">{totalStock} in stock</Badge>;
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Products</h2>
          <p className="text-sm text-muted mt-0.5">
            {total} product{total === 1 ? "" : "s"}
            {entitlements.maxProducts !== null &&
              ` • plan limit ${entitlements.maxProducts}`}
          </p>
        </div>
        <Link href="/dashboard/products/new">
          <Button>
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <Tabs
          items={[
            { id: "all", label: "ALL" },
            { id: "active", label: "Live" },
            { id: "draft", label: "Draft" },
            { id: "archived", label: "Archived" },
          ]}
          activeId={status}
          onChange={(id) => setParam("status", id === "all" ? "" : id)}
        />
        <div className="flex gap-3 flex-1 sm:justify-end">
          <Select
            placeholder="All categories"
            value={category}
            onChange={(e) => setParam("category", e.target.value)}
            options={(categories ?? []).map((c) => ({
              value: c.slug,
              label: c.name,
            }))}
            className="sm:max-w-48"
          />
          <form
            className="relative flex-1 sm:max-w-64"
            onSubmit={(e) => {
              e.preventDefault();
              setParam("q", searchInput);
            }}
          >
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle pointer-events-none" />
            <input
              placeholder="Search products…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-primary"
            />
          </form>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-primary/30 bg-primary-light/30 px-4 py-3">
          <span className="text-sm font-semibold text-primary">
            {selected.size} selected
          </span>
          <div className="flex-1" />
          <Button size="sm" variant="primary" onClick={() => handleBulk("active")}>
            <CheckCircle2 className="w-4 h-4" />
            Activate
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleBulk("draft")}>
            Move to Draft
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleBulk("archived")}>
            <Archive className="w-4 h-4" />
            Archive
          </Button>
        </div>
      )}

      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <Spinner label="Loading products…" />
        ) : products.length === 0 ? (
          <EmptyState
            title="No products found"
            description={
              total === 0
                ? "Add your first product and it will appear on your storefront once published."
                : "Try adjusting the filters or search."
            }
            action={
              total === 0 ? (
                <Link href="/dashboard/products/new">
                  <Button>
                    <Plus className="w-4 h-4" />
                    Add Your First Product
                  </Button>
                </Link>
              ) : undefined
            }
          />
        ) : (
          <Table>
            <THead>
              <TR className="hover:bg-transparent">
                <TH className="w-10">
                  <button
                    onClick={toggleAll}
                    aria-label="Select all"
                    className="cursor-pointer text-muted hover:text-primary"
                  >
                    {allSelected ? (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>
                </TH>
                <TH>Product</TH>
                <TH className="hidden md:table-cell">Category</TH>
                <TH>Price</TH>
                <TH className="hidden sm:table-cell">Stock</TH>
                <TH>Status</TH>
                <TH className="text-right">Actions</TH>
              </TR>
            </THead>
            <TBody>
              {products.map((product) => {
                const catSlug = categories?.find(
                  (c) => c.name === product.category
                )?.slug;
                const isSelected = selected.has(product.id);
                return (
                  <TR
                    key={product.id}
                    className={cn(isSelected && "bg-primary-light/20")}
                  >
                    <TD>
                      <button
                        onClick={() => toggleOne(product.id)}
                        disabled={product.status === "archived"}
                        aria-label={`Select ${product.title}`}
                        className="cursor-pointer text-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        {isSelected ? (
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>
                    </TD>
                    <TD>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-bg-soft border border-border shrink-0">
                          {product.images[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.title}
                              fill
                              className="object-cover"
                              sizes="44px"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/dashboard/products/${product.id}/edit`}
                            className="font-semibold hover:text-primary transition-colors block truncate"
                          >
                            {product.title}
                          </Link>
                          <p className="text-xs text-muted truncate">
                            {product.sku || product.slug}
                            {product.hasVariants &&
                              ` • ${product.variantCombinations.length} variants`}
                          </p>
                        </div>
                      </div>
                    </TD>
                    <TD className="hidden md:table-cell">
                      {catSlug ? (
                        <button
                          onClick={() => setParam("category", catSlug)}
                          className="text-sm text-muted hover:text-primary cursor-pointer"
                        >
                          {product.category}
                        </button>
                      ) : (
                        <span className="text-sm text-muted">—</span>
                      )}
                    </TD>
                    <TD>
                      <span className="font-semibold">
                        {formatNaira(product.price)}
                      </span>
                    </TD>
                    <TD className="hidden sm:table-cell">{stockBadge(product)}</TD>
                    <TD>
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
                    </TD>
                    <TD className="text-right">
                      <Dropdown
                        trigger={
                          <button
                            aria-label={`Actions for ${product.title}`}
                            className="p-2 text-muted hover:text-primary"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        }
                        options={[
                          {
                            value: "edit",
                            label: "Edit",
                            icon: <Pencil className="w-4 h-4" />,
                          },
                          ...(product.status === "active"
                            ? [
                                {
                                  value: "unpublish",
                                  label: "Unpublish",
                                },
                              ]
                            : product.status === "draft"
                              ? [
                                  {
                                    value: "publish",
                                    label: "Publish",
                                  },
                                ]
                              : []),
                          ...(product.status !== "archived"
                            ? [
                                {
                                  value: "archive",
                                  label: "Archive",
                                  danger: true,
                                  icon: <Archive className="w-4 h-4" />,
                                },
                              ]
                            : []),
                        ]}
                        onSelect={(value) => {
                          if (value === "edit") {
                            router.push(`/dashboard/products/${product.id}/edit`);
                          }
                          if (value === "unpublish") {
                            setStatus.mutate(
                              { productId: product.id, status: "draft" },
                              {
                                onSuccess: () =>
                                  toast(`"${product.title}" unpublished.`, "success"),
                                onError: (err) => toast(getErrorMessage(err), "error"),
                              }
                            );
                          }
                          if (value === "publish") {
                            setStatus.mutate(
                              { productId: product.id, status: "active" },
                              {
                                onSuccess: () =>
                                  toast(`"${product.title}" is live.`, "success"),
                                onError: (err) => toast(getErrorMessage(err), "error"),
                              }
                            );
                          }
                          if (value === "archive") handleArchive(product);
                        }}
                      />
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setParam("page", String(page - 1))}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setParam("page", String(page + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsTable />
    </Suspense>
  );
}
