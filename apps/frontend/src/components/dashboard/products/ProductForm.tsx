"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Star, Upload, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useCategories, useCreateProduct, useUpdateProduct, useUploadAsset, useProduct } from "@/hooks";
import { aiService } from "@/services/commerce";
import Modal from "@/components/ui/Modal";
import { getErrorMessage, cn } from "@/lib/utils";
import type { ProductInput } from "@/types/product";
import VariantBuilder from "./VariantBuilder";

const MAX_IMAGES = 8;

const emptyProduct: ProductInput = {
  title: "",
  description: "",
  category: "",
  price: 0,
  compareAtPrice: null,
  sku: "",
  stock: 0,
  weightKg: null,
  hasVariants: false,
  variants: [],
  variantCombinations: [],
  status: "draft",
  isFeatured: false,
  tags: [],
  shippingFee: 0,
  estimatedDeliveryDays: "3-5 business days",
  images: [],
};

export default function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = Boolean(productId);

  const { data: existing } = useProduct(productId ?? "");
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const upload = useUploadAsset();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ProductInput>(emptyProduct);
  const [hydratedFor, setHydratedFor] = useState<string | null>(
    isEdit ? null : "new"
  );
  const [tagsText, setTagsText] = useState("");
  const [aiBusy, setAiBusy] = useState<"title" | "description" | "seo" | null>(null);
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [descPreview, setDescPreview] = useState<string | null>(null);

  // Hydrate form when the existing product loads (render-time derived reset).
  if (isEdit && existing && hydratedFor !== existing.id) {
    setForm({
      title: existing.title,
      description: existing.description,
      category: existing.category,
      price: existing.price,
      compareAtPrice: existing.compareAtPrice ?? null,
      sku: existing.sku ?? "",
      stock: existing.stock,
      weightKg: existing.weightKg ?? null,
      hasVariants: existing.hasVariants,
      variants: existing.variants,
      variantCombinations: existing.variantCombinations,
      status: existing.status,
      isFeatured: existing.isFeatured,
      tags: existing.tags,
      shippingFee: existing.shippingFee,
      estimatedDeliveryDays: existing.estimatedDeliveryDays,
      images: existing.images,
    });
    setTagsText(existing.tags.join(", "));
    setHydratedFor(existing.id);
  }

  const patch = (p: Partial<ProductInput>) =>
    setForm((prev) => ({ ...prev, ...p }));

  const saving = createProduct.isPending || updateProduct.isPending;
  const canSubmit =
    form.title.trim().length >= 2 &&
    form.price > 0 &&
    (form.hasVariants ? form.variantCombinations.length > 0 : form.stock >= 0) &&
    (!form.hasVariants || form.category.trim().length > 0 || true);

  const handleUploadImages = async (files: FileList) => {
    const room = MAX_IMAGES - form.images.length;
    const list = Array.from(files).slice(0, room);
    for (const file of list) {
      try {
        const { url } = await upload.mutateAsync({
          kind: "product-image",
          file,
        });
        patch({ images: [...form.images, url] });
      } catch (err) {
        toast(getErrorMessage(err), "error");
      }
    }
  };

  const handleSubmit = (published: boolean) => {
    if (!canSubmit) {
      toast("Please fill in a title and a price above zero.", "error");
      return;
    }
    const payload: ProductInput = {
      ...form,
      title: form.title.trim(),
      status: published ? "active" : "draft",
      tags: tagsText
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      compareAtPrice: form.compareAtPrice || null,
      weightKg: form.weightKg || null,
      sku: form.sku ?? "",
      estimatedDeliveryDays:
        form.estimatedDeliveryDays || "3-5 business days",
    };
    if (isEdit && productId) {
      updateProduct.mutate(
        { productId, input: payload },
        {
          onSuccess: () => {
            toast(published ? "Product updated & published." : "Draft saved.", "success");
            router.push("/dashboard/products");
          },
          onError: (err) => toast(getErrorMessage(err), "error"),
        }
      );
    } else {
      createProduct.mutate(payload, {
        onSuccess: () => {
          toast(published ? "Product published!" : "Draft saved.", "success");
          router.push("/dashboard/products");
        },
        onError: (err) => toast(getErrorMessage(err), "error"),
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/products">
            <Button variant="ghost" size="sm" aria-label="Back to products">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {isEdit ? "Edit product" : "Add new product"}
            </h2>
            <p className="text-sm text-muted mt-0.5">
              {isEdit
                ? "Changes are saved to your live catalog."
                : "Start with the basics — you can refine anytime."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Basics */}
          <Card>
            <h3 className="font-bold text-lg mb-4">Basics</h3>
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    Product Title
                  </span>
                  <button
                    type="button"
                    disabled={!form.title.trim() || aiBusy !== null}
                    onClick={async () => {
                      setAiBusy("title");
                      try {
                        const res = await aiService.improveTitle({ title: form.title });
                        const list = res.suggestions?.filter(Boolean) ?? (res.title ? [res.title] : []);
                        if (list.length === 0) {
                          toast("No suggestions yet. Try a more specific title.", "error");
                        } else {
                          setTitleSuggestions(list);
                        }
                      } catch (err) {
                        toast(getErrorMessage(err), "error");
                      } finally {
                        setAiBusy(null);
                      }
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {aiBusy === "title" ? "Writing…" : "Improve with AI"}
                  </button>
                </div>
                <Input
                  required
                  placeholder="e.g. Handmade Ankara Wrap Dress"
                  value={form.title}
                  onChange={(e) => patch({ title: e.target.value })}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    Description
                  </span>
                  <button
                    type="button"
                    disabled={!form.description.trim() || aiBusy !== null}
                    onClick={async () => {
                      setAiBusy("description");
                      try {
                        const res = await aiService.rewriteDescription({
                          title: form.title,
                          description: form.description,
                        });
                        const next = res.description || res.text || "";
                        if (!next) {
                          toast("Couldn't rewrite that yet. Try again.", "error");
                        } else {
                          setDescPreview(next);
                        }
                      } catch (err) {
                        toast(getErrorMessage(err), "error");
                      } finally {
                        setAiBusy(null);
                      }
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {aiBusy === "description" ? "Writing…" : "Rewrite with AI"}
                  </button>
                </div>
                <Textarea
                  rows={5}
                  placeholder="Describe the material, fit, care instructions…"
                  value={form.description}
                  onChange={(e) => patch({ description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Category"
                  placeholder="Select a category"
                  value={form.category}
                  onChange={(e) => patch({ category: e.target.value })}
                  options={(categories ?? []).map((c) => ({
                    value: c.name,
                    label: c.name,
                  }))}
                  hint="Pick or create — new categories are added automatically."
                />
                <Input
                  label="SKU (optional)"
                  placeholder="ANK-DRESS-001"
                  value={form.sku ?? ""}
                  onChange={(e) => patch({ sku: e.target.value })}
                />
              </div>
              <Input
                label="Tags (comma separated)"
                placeholder="ankara, dress, handmade"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                hint="Helps buyers find your product via search."
              />
            </div>
          </Card>

          {/* Pricing */}
          <Card>
            <h3 className="font-bold text-lg mb-4">Pricing & Stock</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Price (₦)"
                type="number"
                min={0}
                required
                value={form.price || ""}
                onChange={(e) => patch({ price: Number(e.target.value) || 0 })}
              />
              <Input
                label="Compare-at Price (₦)"
                type="number"
                min={0}
                placeholder="optional"
                value={form.compareAtPrice ?? ""}
                onChange={(e) =>
                  patch({
                    compareAtPrice: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
                hint="Shown crossed out as a discount."
              />
              <Input
                label={form.hasVariants ? "Stock (per combo below)" : "Stock"}
                type="number"
                min={0}
                required={!form.hasVariants}
                disabled={form.hasVariants}
                value={form.hasVariants ? "" : form.stock}
                onChange={(e) => patch({ stock: Number(e.target.value) || 0 })}
              />
            </div>
            {form.compareAtPrice && form.compareAtPrice <= form.price && (
              <p className="text-xs text-warning font-medium mt-2">
                Compare-at price should be higher than the selling price.
              </p>
            )}
          </Card>

          {/* Variants */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg">Variants</h3>
                <p className="text-xs text-muted mt-0.5">
                  Offer sizes, colors or editions with individual pricing.
                </p>
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <span className="text-sm font-semibold text-muted">
                  This product has variants
                </span>
                <input
                  type="checkbox"
                  checked={form.hasVariants}
                  onChange={(e) => patch({ hasVariants: e.target.checked })}
                  className="sr-only peer"
                />
                <span className="w-11 h-6 rounded-full bg-neutral-200 peer-checked:bg-primary relative transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
              </label>
            </div>
            {form.hasVariants && (
              <VariantBuilder
                variants={form.variants}
                combinations={form.variantCombinations}
                onVariantsChange={(variants) => patch({ variants })}
                onCombinationsChange={(variantCombinations) =>
                  patch({ variantCombinations })
                }
              />
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          <Card>
            <h3 className="font-bold text-lg mb-4">Publishing</h3>
            <div className="flex flex-col gap-4">
              <Select
                label="Status"
                value={form.status}
                onChange={(e) =>
                  patch({ status: e.target.value as ProductInput["status"] })
                }
                options={[
                  { value: "draft", label: "Draft (hidden)" },
                  { value: "active", label: "Active (visible)" },
                ]}
              />
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => patch({ isFeatured: e.target.checked })}
                  className="w-4 h-4 accent-[#800A1D]"
                />
                <span className="text-sm font-semibold flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-primary" />
                  Feature on storefront homepage
                </span>
              </label>
            </div>
          </Card>

          <Card>
            <h3 className="font-bold text-lg mb-2">Photos</h3>
            <p className="text-xs text-muted mb-4">
              Up to {MAX_IMAGES} images. First image is the cover.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {form.images.map((url, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-xl overflow-hidden border border-border group"
                >
                  <Image
                    src={url}
                    alt={`Product photo ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="150px"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      patch({ images: form.images.filter((_, j) => j !== i) })
                    }
                    aria-label={`Remove photo ${i + 1}`}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full">
                      COVER
                    </span>
                  )}
                </div>
              ))}
              {form.images.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={upload.isPending}
                  className="aspect-square rounded-xl border-2 border-dashed border-border bg-bg-soft flex flex-col items-center justify-center gap-1.5 text-muted hover:text-primary hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <Upload className="w-5 h-5" />
                  <span className="text-[11px] font-semibold">
                    {upload.isPending ? "Uploading…" : "Add photo"}
                  </span>
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) handleUploadImages(e.target.files);
                e.target.value = "";
              }}
            />
          </Card>

          <Card>
            <h3 className="font-bold text-lg mb-4">Shipping</h3>
            <div className="flex flex-col gap-4">
              <Input
                label="Flat Shipping Fee (₦)"
                type="number"
                min={0}
                value={form.shippingFee || ""}
                onChange={(e) =>
                  patch({ shippingFee: Number(e.target.value) || 0 })
                }
                hint="0 means free shipping."
              />
              <Input
                label="Estimated Delivery"
                placeholder="3-5 business days"
                value={form.estimatedDeliveryDays}
                onChange={(e) => patch({ estimatedDeliveryDays: e.target.value })}
              />
              <Input
                label="Weight (kg, optional)"
                type="number"
                min={0}
                step="0.1"
                value={form.weightKg ?? ""}
                onChange={(e) =>
                  patch({
                    weightKg: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </div>
          </Card>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 pb-4">
        <Button
          variant="outline"
          onClick={() => handleSubmit(false)}
          loading={saving}
          disabled={hydratedFor === null}
        >
          Save as Draft
        </Button>
        <Button
          onClick={() => handleSubmit(true)}
          loading={saving}
          disabled={hydratedFor === null}
          className={cn(!canSubmit && "opacity-60")}
        >
          {isEdit ? "Save & Publish" : "Publish Product"}
        </Button>
      </div>

      <Modal
        isOpen={titleSuggestions.length > 0}
        onClose={() => setTitleSuggestions([])}
        title="Title suggestions"
        description="Pick one to replace your current title."
      >
        <ul className="flex flex-col gap-2">
          {titleSuggestions.map((suggestion) => (
            <li key={suggestion}>
              <button
                type="button"
                onClick={() => {
                  patch({ title: suggestion });
                  setTitleSuggestions([]);
                }}
                className="w-full text-left rounded-xl border border-border px-4 py-3 text-sm font-semibold hover:border-primary hover:bg-primary-light/30"
              >
                {suggestion}
              </button>
            </li>
          ))}
        </ul>
      </Modal>

      <Modal
        isOpen={Boolean(descPreview)}
        onClose={() => setDescPreview(null)}
        title="Rewritten description"
        description="Replace your current copy with this version?"
      >
        <p className="text-sm text-muted whitespace-pre-wrap mb-4">{descPreview}</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDescPreview(null)}>
            Keep original
          </Button>
          <Button
            onClick={() => {
              if (descPreview) patch({ description: descPreview });
              setDescPreview(null);
            }}
          >
            Use this
          </Button>
        </div>
      </Modal>
    </div>
  );
}
