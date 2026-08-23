"use client";

import React, { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  FolderTree,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import EmptyState from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks";
import { getErrorMessage } from "@/lib/utils";
import type { StoreCategory } from "@/types/category";

interface EditorState {
  mode: "create" | "edit";
  category?: StoreCategory;
  name: string;
  description: string;
}

export default function CategoriesPage() {
  const { toast } = useToast();
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [editor, setEditor] = useState<EditorState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StoreCategory | null>(null);

  const saving =
    createCategory.isPending || updateCategory.isPending || deleteCategory.isPending;

  const openCreate = () =>
    setEditor({ mode: "create", name: "", description: "" });

  const openEdit = (category: StoreCategory) =>
    setEditor({
      mode: "edit",
      category,
      name: category.name,
      description: category.description,
    });

  const handleSave = () => {
    if (!editor || editor.name.trim().length < 2) {
      toast("Category name is too short.", "error");
      return;
    }
    const input = {
      name: editor.name.trim(),
      description: editor.description.trim(),
    };
    if (editor.mode === "create") {
      createCategory.mutate(input, {
        onSuccess: () => {
          toast("Category created.", "success");
          setEditor(null);
        },
        onError: (err) => toast(getErrorMessage(err), "error"),
      });
    } else if (editor.category) {
      updateCategory.mutate(
        { categoryId: editor.category.id, input },
        {
          onSuccess: () => {
            toast("Category updated.", "success");
            setEditor(null);
          },
          onError: (err) => toast(getErrorMessage(err), "error"),
        }
      );
    }
  };

  const move = (category: StoreCategory, direction: -1 | 1) => {
    const list = categories ?? [];
    const index = list.findIndex((c) => c.id === category.id);
    const swapWith = list[index + direction];
    if (!swapWith) return;
    updateCategory.mutate({
      categoryId: category.id,
      input: { order: swapWith.order },
    });
    updateCategory.mutate({
      categoryId: swapWith.id,
      input: { order: category.order },
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteCategory.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast(`"${deleteTarget.name}" deleted.`, "success");
        setDeleteTarget(null);
      },
      onError: (err) => toast(getErrorMessage(err), "error"),
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <CardHeader
        className="mb-0"
        title="Categories"
        description="Organize your catalog so buyers can browse your storefront easily."
        action={
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4" />
            New Category
          </Button>
        }
      />

      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <Spinner label="Loading categories…" />
        ) : (categories ?? []).length === 0 ? (
          <EmptyState
            icon={<FolderTree className="w-6 h-6" />}
            title="No categories yet"
            description="Categories are also created automatically when you add a product with a new category name."
            action={
              <Button onClick={openCreate}>
                <Plus className="w-4 h-4" />
                Create Your First Category
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-border">
            {(categories ?? []).map((category, index) => (
              <li
                key={category.id}
                className="flex items-center gap-4 px-5 py-4"
              >
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => move(category, -1)}
                    disabled={index === 0 || saving}
                    aria-label="Move up"
                    className="p-1 text-neutral-400 hover:text-primary disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => move(category, 1)}
                    disabled={index === (categories ?? []).length - 1 || saving}
                    aria-label="Move down"
                    className="p-1 text-neutral-400 hover:text-primary disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{category.name}</p>
                  <p className="text-xs text-muted truncate">
                    /{category.slug}
                    {category.description && ` • ${category.description}`}
                  </p>
                </div>

                <Badge
                  variant={category.productCount > 0 ? "primary" : "neutral"}
                >
                  {category.productCount} product
                  {category.productCount === 1 ? "" : "s"}
                </Badge>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(category)}
                    aria-label={`Edit ${category.name}`}
                    className="p-2 text-muted hover:text-primary transition-colors cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(category)}
                    aria-label={`Delete ${category.name}`}
                    className="p-2 text-muted hover:text-danger transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Create / Edit modal */}
      <Modal
        isOpen={editor !== null}
        onClose={() => setEditor(null)}
        title={editor?.mode === "edit" ? "Edit category" : "New category"}
        description="Categories appear in your storefront navigation and filters."
      >
        {editor && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
            className="flex flex-col gap-4"
          >
            <Input
              label="Category Name"
              required
              placeholder="e.g. Ankara Wear"
              value={editor.name}
              onChange={(e) =>
                setEditor({ ...editor, name: e.target.value })
              }
              autoFocus
            />
            <Textarea
              label="Description (optional)"
              rows={2}
              placeholder="Short line shown next to the category"
              value={editor.description}
              onChange={(e) =>
                setEditor({ ...editor, description: e.target.value })
              }
            />
            <div className="flex items-center justify-end gap-3 mt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditor(null)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                {editor.mode === "edit" ? "Save Changes" : "Create Category"}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete confirmation */}
      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete category?"
        size="sm"
      >
        <p className="text-sm text-muted leading-relaxed mb-6">
          {deleteTarget?.productCount ?? 0} product
          {deleteTarget?.productCount === 1 ? "" : "s"} currently use
          &ldquo;{deleteTarget?.name}&rdquo;. They will stay listed but lose
          this grouping on your storefront.
        </p>
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={saving}>
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
