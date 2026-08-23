"use client";

import React, { useMemo } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import type {
  ProductVariant,
  VariantCombination,
} from "@/types/product";

function cartesian(options: string[][]): Record<string, string>[] {
  return options.reduce<Record<string, string>[]>(
    (acc, opts, i) =>
      acc.length === 0
        ? opts.map((o) => ({ [i]: o }))
        : acc.flatMap((combo) => opts.map((o) => ({ ...combo, [i]: o }))),
    []
  );
}

export default function VariantBuilder({
  variants,
  combinations,
  onVariantsChange,
  onCombinationsChange,
}: {
  variants: ProductVariant[];
  combinations: VariantCombination[];
  onVariantsChange: (variants: ProductVariant[]) => void;
  onCombinationsChange: (combinations: VariantCombination[]) => void;
}) {
  const regenerated = useMemo(() => {
    const valid = variants.filter(
      (v) => v.name.trim() && v.options.filter((o) => o.trim()).length > 0
    );
    if (valid.length === 0) return [];
    const keys = valid.map((v) => v.name.trim());
    const optionLists = valid.map((v) =>
      v.options.filter((o) => o.trim()).map((o) => o.trim())
    );
    const existing = new Map(
      combinations.map((c) => [JSON.stringify(keys.map((k) => c.combination[k])), c])
    );
    return cartesian(optionLists).map((indexed) => {
      const combination: Record<string, string> = {};
      keys.forEach((key, i) => {
        combination[key] = indexed[i];
      });
      const prev = existing.get(JSON.stringify(keys.map((k) => combination[k])));
      return {
        combination,
        price: prev?.price ?? 0,
        stock: prev?.stock ?? 0,
        sku: prev?.sku ?? "",
        image: prev?.image ?? "",
      };
    });
  }, [variants, combinations]);

  const addVariant = () => {
    onVariantsChange([...variants, { name: "", options: [] }]);
  };

  const updateVariant = (
    index: number,
    patch: Partial<ProductVariant>
  ) => {
    const next = variants.map((v, i) => (i === index ? { ...v, ...patch } : v));
    onVariantsChange(next);
    // Recompute combinations for the new variant shape.
    const valid = next.filter(
      (v) => v.name.trim() && v.options.filter((o) => o.trim()).length > 0
    );
    if (valid.length === 0) {
      onCombinationsChange([]);
      return;
    }
    const keys = valid.map((v) => v.name.trim());
    const optionLists = valid.map((v) =>
      v.options.filter((o) => o.trim()).map((o) => o.trim())
    );
    const existing = new Map(
      combinations.map((c) => [
        JSON.stringify(keys.map((k) => c.combination[k])),
        c,
      ])
    );
    onCombinationsChange(
      cartesian(optionLists).map((indexed) => {
        const combination: Record<string, string> = {};
        keys.forEach((key, i) => {
          combination[key] = indexed[i];
        });
        const prev = existing.get(
          JSON.stringify(keys.map((k) => combination[k]))
        );
        return {
          combination,
          price: prev?.price ?? 0,
          stock: prev?.stock ?? 0,
          sku: prev?.sku ?? "",
          image: prev?.image ?? "",
        };
      })
    );
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Variant axes */}
      <div className="flex flex-col gap-4">
        {variants.map((variant, index) => (
          <div
            key={index}
            className="rounded-2xl border border-border p-4 bg-bg-soft/50"
          >
            <div className="flex items-center gap-3">
              <Input
                placeholder="Option name (e.g. Size)"
                value={variant.name}
                onChange={(e) =>
                  updateVariant(index, { name: e.target.value })
                }
                className="max-w-xs"
              />
              <button
                type="button"
                onClick={() =>
                  onVariantsChange(variants.filter((_, i) => i !== index))
                }
                className="p-2 text-neutral-400 hover:text-danger transition-colors cursor-pointer"
                aria-label={`Remove ${variant.name || "variant"}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {variant.options.map((option, optIndex) => (
                <span
                  key={optIndex}
                  className="inline-flex items-center gap-1.5 bg-white border border-border rounded-lg px-2.5 py-1.5 text-sm font-medium"
                >
                  {option}
                  <button
                    type="button"
                    onClick={() =>
                      updateVariant(index, {
                        options: variant.options.filter(
                          (_, i) => i !== optIndex
                        ),
                      })
                    }
                    className="text-neutral-400 hover:text-danger cursor-pointer"
                    aria-label={`Remove ${option}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              <input
                placeholder="Add option + Enter"
                className="bg-white border border-border rounded-lg px-2.5 py-1.5 text-sm w-40 focus:outline-none focus:border-primary"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const value = e.currentTarget.value.trim();
                    if (value) {
                      updateVariant(index, {
                        options: [...variant.options, value],
                      });
                      e.currentTarget.value = "";
                    }
                  }
                }}
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addVariant}
          className="w-fit inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add variant option (e.g. Size, Color)
        </button>
      </div>

      {/* Combination matrix */}
      {regenerated.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
            Combinations ({regenerated.length})
          </p>
          <p className="text-xs text-neutral-400 mb-3">
            Set price and stock per combination. Leave stock at 0 to hide it
            from buyers.
          </p>
          <div className="overflow-x-auto no-scrollbar rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-bg-soft text-xs text-muted uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2.5 text-left font-semibold">
                    Combination
                  </th>
                  <th className="px-4 py-2.5 text-left font-semibold">
                    Price (₦)
                  </th>
                  <th className="px-4 py-2.5 text-left font-semibold">
                    Stock
                  </th>
                  <th className="px-4 py-2.5 text-left font-semibold">SKU</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white">
                {regenerated.map((combo, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2.5 font-medium">
                      {Object.entries(combo.combination)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(" · ")}
                    </td>
                    <td className="px-4 py-2.5">
                      <input
                        type="number"
                        min={0}
                        value={combo.price || ""}
                        onChange={(e) => {
                          const next = [...regenerated];
                          next[i] = {
                            ...next[i],
                            price: Number(e.target.value) || 0,
                          };
                          onCombinationsChange(next);
                        }}
                        className="w-24 px-2.5 py-1.5 rounded-lg border border-border focus:outline-none focus:border-primary"
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <input
                        type="number"
                        min={0}
                        value={combo.stock || ""}
                        onChange={(e) => {
                          const next = [...regenerated];
                          next[i] = {
                            ...next[i],
                            stock: Number(e.target.value) || 0,
                          };
                          onCombinationsChange(next);
                        }}
                        className="w-20 px-2.5 py-1.5 rounded-lg border border-border focus:outline-none focus:border-primary"
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <input
                        type="text"
                        value={combo.sku ?? ""}
                        onChange={(e) => {
                          const next = [...regenerated];
                          next[i] = { ...next[i], sku: e.target.value };
                          onCombinationsChange(next);
                        }}
                        placeholder="optional"
                        className="w-32 px-2.5 py-1.5 rounded-lg border border-border focus:outline-none focus:border-primary"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
