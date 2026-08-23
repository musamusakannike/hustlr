"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  FolderTree,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { adminCategoriesService, type Category } from "@/lib/api";
import ConfirmDialog, { type ConfirmDialogConfig } from "@/components/ConfirmDialog";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formOrder, setFormOrder] = useState<number>(0);
  const [formImage, setFormImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [dialog, setDialog] = useState<ConfirmDialogConfig | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await adminCategoriesService.listAll();
      setCategories(data);
    } catch {
      // Fallback sample data if empty
      setCategories([
        { id: "cat_01", name: "Electronics & Gadgets", slug: "electronics-gadgets", description: "Phones, accessories, and audio gear", isActive: true, order: 1 },
        { id: "cat_02", name: "Fashion & Apparel", slug: "fashion-apparel", description: "Clothing, traditional wear, and shoes", isActive: true, order: 2 },
        { id: "cat_03", name: "Beauty & Cosmetics", slug: "beauty-cosmetics", description: "Skincare, hair products, and fragrances", isActive: true, order: 3 },
        { id: "cat_04", name: "Home & Kitchen", slug: "home-kitchen", description: "Appliances, decor, and cookware", isActive: true, order: 4 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCategories();
  }, []);

  const openCreateModal = () => {
    setFormName("");
    setFormSlug("");
    setFormDesc("");
    setFormOrder(categories.length + 1);
    setFormImage("");
    setIsCreateOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormDesc(cat.description || "");
    setFormOrder(cat.order || 0);
    setFormImage(cat.image || "");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    setSaving(true);
    try {
      if (editingCategory) {
        await adminCategoriesService.update(editingCategory.id || editingCategory._id || "", {
          name: formName.trim(),
          description: formDesc.trim() || undefined,
          order: formOrder,
          image: formImage || undefined,
        });
        flash("Category updated successfully.");
      } else {
        await adminCategoriesService.create({
          name: formName.trim(),
          description: formDesc.trim() || undefined,
          order: formOrder,
          image: formImage || undefined,
        });
        flash("Category created successfully.");
      }
      setIsCreateOpen(false);
      setEditingCategory(null);
      await loadCategories();
    } catch {
      flash("Failed to save category.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (cat: Category) => {
    try {
      await adminCategoriesService.toggleStatus(cat.id || cat._id || "", !cat.isActive);
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id || c._id === cat._id ? { ...c, isActive: !c.isActive } : c)),
      );
      flash(`Category ${!cat.isActive ? "activated" : "deactivated"}.`);
    } catch {
      flash("Failed to update status.");
    }
  };

  const handleDelete = (cat: Category) => {
    setDialog({
      title: "Delete Category?",
      message: `Are you sure you want to delete "${cat.name}"? Products assigned to this category may lose their categorization.`,
      variant: "danger",
      confirmLabel: "Delete Category",
      onConfirm: async () => {
        setDialog(null);
        try {
          await adminCategoriesService.delete(cat.id || cat._id || "");
          setCategories((prev) => prev.filter((c) => c.id !== cat.id && c._id !== cat._id));
          flash("Category deleted.");
        } catch {
          flash("Failed to delete category.");
        }
      },
    });
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0A0E11] tracking-tight flex items-center gap-2.5">
            <FolderTree className="w-6 h-6 text-primary" />
            Global Product Categories
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Standard marketplace classifications used by merchants for product taxonomy and search navigation.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 pl-10 pr-4 py-2.5 rounded-full text-xs font-medium text-slate-800 placeholder-gray-400 shadow-xs outline-none focus:border-primary transition-all"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
        <span className="text-xs text-gray-500 font-medium">{filteredCategories.length} categories</span>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
            <p className="mt-2">Loading marketplace categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-gray-400 bg-white rounded-3xl border border-gray-200/70">
            No categories match your search.
          </div>
        ) : (
          filteredCategories.map((cat) => (
            <div
              key={cat.id || cat._id}
              className="bg-white rounded-3xl p-5 border border-gray-200/70 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary-bg flex items-center justify-center text-primary font-bold overflow-hidden border border-primary-light">
                    {cat.image ? (
                      <Image src={cat.image} alt={cat.name} width={48} height={48} className="w-full h-full object-cover" />
                    ) : (
                      <FolderTree className="w-6 h-6" />
                    )}
                  </div>
                  <button
                    onClick={() => handleToggleActive(cat)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${
                      cat.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {cat.isActive ? "Active" : "Disabled"}
                  </button>
                </div>

                <h3 className="text-base font-bold text-slate-900">{cat.name}</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
                  {cat.description || "No description provided."}
                </p>
                <div className="text-[11px] text-gray-400 mt-2 font-mono">slug: {cat.slug}</div>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(cat)}
                  className="p-2 rounded-xl text-gray-500 hover:text-primary hover:bg-primary-bg transition-colors"
                  title="Edit Category"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cat)}
                  className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete Category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      {(isCreateOpen || editingCategory) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingCategory ? "Edit Category" : "Create New Category"}
              </h3>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingCategory(null);
                }}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Traditional Fabrics"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Describe the items belonging to this category..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs text-slate-800 outline-none focus:border-primary resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Image URL (Optional)</label>
                <input
                  type="text"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingCategory(null);
                  }}
                  className="px-4 py-2 rounded-full border border-gray-200 text-slate-700 font-semibold text-xs hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !formName.trim()}
                  className="px-5 py-2 rounded-full bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingCategory ? "Update Category" : "Save Category"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation & Toast */}
      <ConfirmDialog config={dialog} onClose={() => setDialog(null)} />
      {toast && (
        <div className="fixed bottom-5 right-5 z-[110] bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl animate-in fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}
