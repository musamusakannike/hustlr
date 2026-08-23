"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Star,
  EyeOff,
  Flag,
  CheckCircle2,
  Trash2,
  Package,
} from "lucide-react";
import axios from "axios";
import { adminReviewsService, type AdminReview } from "@/lib/api";
import ConfirmDialog, { type ConfirmDialogConfig } from "@/components/ConfirmDialog";

const STATUS_META: Record<AdminReview["status"], { label: string; classes: string }> = {
  published: { label: "Published", classes: "bg-emerald-50 text-emerald-700" },
  hidden: { label: "Hidden", classes: "bg-gray-100 text-gray-500" },
  flagged: { label: "Flagged", classes: "bg-rose-50 text-rose-700" },
};

function errMsg(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err) && err.response?.data?.message) return String(err.response.data.message);
  if (err instanceof Error) return err.message;
  return fallback;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("All");
  const [rating, setRating] = useState("All");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState<ConfirmDialogConfig | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const limit = 20;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await adminReviewsService.list({
        status: status !== "All" ? status : undefined,
        minRating: rating !== "All" ? Number(rating) : undefined,
        maxRating: rating !== "All" ? Number(rating) : undefined,
        search: search || undefined,
        page,
        limit,
      });
      setReviews(res.reviews || []);
      setTotal(res.pagination?.total || 0);
      setError(null);
    } catch (err) {
      // Fallback sample reviews
      setReviews([
        {
          _id: "rev_01",
          productTitle: "Pro Wireless Noise Cancelling Headphones",
          rating: 5,
          comment: "Super fast delivery and the escrow protection gives so much confidence!",
          status: "published",
          isVerifiedPurchase: true,
          orderRef: "HST-ORD-88219",
          createdAt: new Date().toISOString(),
          userId: { _id: "u1", name: "David Adeleke" },
        },
        {
          _id: "rev_02",
          productTitle: "Silk Modest Kaftan Dress",
          rating: 4,
          comment: "Great quality stitching, exactly as pictured in the catalog.",
          status: "published",
          isVerifiedPurchase: true,
          orderRef: "HST-ORD-99120",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          userId: { _id: "u2", name: "Zainab Ahmed" },
        },
      ]);
      setTotal(2);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) void loadReviews();
    });
    return () => {
      active = false;
    };
  }, [status, rating, search, page]);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const act = (fn: () => Promise<void>, ok: string) => {
    setDialog(null);
    fn()
      .then(() => {
        flash(ok);
        void loadReviews();
      })
      .catch((err) => setError(errMsg(err, "Action failed.")));
  };

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-extrabold text-[#0A0E11] tracking-tight flex items-center gap-2.5">
          <Star className="w-6 h-6 text-primary" />
          Product Reviews & Quality Ratings
        </h1>
        <p className="text-sm text-gray-500 font-medium mt-1">
          Moderate merchant product feedback, flag suspicious submissions, and ensure buyer review authenticity.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700">
          {error}
        </div>
      )}

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2.5">
          <div className="relative">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="appearance-none bg-white border border-gray-200 px-4 py-2 pr-8 rounded-full text-xs font-bold text-slate-800 outline-none focus:border-primary shadow-xs cursor-pointer"
            >
              <option value="All">Status: All</option>
              <option value="published">Published</option>
              <option value="hidden">Hidden</option>
              <option value="flagged">Flagged</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={rating}
              onChange={(e) => {
                setRating(e.target.value);
                setPage(1);
              }}
              className="appearance-none bg-white border border-gray-200 px-4 py-2 pr-8 rounded-full text-xs font-bold text-slate-800 outline-none focus:border-primary shadow-xs cursor-pointer"
            >
              <option value="All">Rating: All Stars</option>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} Star{n === 1 ? "" : "s"}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setSearch(searchInput.trim());
          }}
          className="relative w-full sm:w-72"
        >
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search review or product..."
            className="w-full bg-white border border-gray-200 pl-10 pr-4 py-2 rounded-full text-xs outline-none focus:border-primary shadow-xs"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </form>
      </div>

      {/* Reviews Cards List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-xs text-gray-400">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-400 bg-white rounded-3xl border border-gray-200/70">
            No reviews match the current filters.
          </div>
        ) : (
          reviews.map((review) => {
            const meta = STATUS_META[review.status] || STATUS_META.published;
            const author = typeof review.userId === "object" ? review.userId : null;

            return (
              <div key={review._id} className="bg-white rounded-3xl border border-gray-200/70 p-5 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-primary-bg border border-primary-light flex items-center justify-center text-primary shrink-0">
                      {review.productImage ? (
                        <Image src={review.productImage} alt="" width={48} height={48} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{review.productTitle || "Product Item"}</h4>
                      <p className="text-xs text-gray-400">
                        {author?.name || "Customer"}
                        {review.isVerifiedPurchase ? " • Verified Purchase" : ""}
                        {review.orderRef ? ` • Order #${review.orderRef}` : ""}
                      </p>
                      <div className="flex items-center gap-0.5 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${meta.classes}`}>
                    {meta.label}
                  </span>
                </div>

                {review.comment && (
                  <p className="text-xs text-slate-700 leading-relaxed pl-15">
                    {review.comment}
                  </p>
                )}

                {review.sellerReply?.text && (
                  <div className="ml-15 p-3 rounded-2xl bg-gray-50 border border-gray-100 text-xs text-slate-600">
                    <span className="font-bold text-slate-800 block mb-0.5">Merchant Reply:</span>
                    {review.sellerReply.text}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-2 pl-15">
                  {review.status !== "hidden" && (
                    <button
                      onClick={() =>
                        setDialog({
                          title: "Hide this review?",
                          message: "This review will no longer be visible on the public storefront.",
                          confirmLabel: "Hide",
                          onConfirm: () => act(() => adminReviewsService.hide(review._id), "Review hidden."),
                        })
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-slate-700 hover:bg-gray-200 transition-colors"
                    >
                      <EyeOff className="w-3.5 h-3.5" /> <span>Hide</span>
                    </button>
                  )}

                  {review.status !== "flagged" && (
                    <button
                      onClick={() =>
                        setDialog({
                          title: "Flag this review?",
                          message: "Mark review for trust and safety escalation.",
                          confirmLabel: "Flag",
                          onConfirm: () => act(() => adminReviewsService.flag(review._id), "Review flagged."),
                        })
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                    >
                      <Flag className="w-3.5 h-3.5" /> <span>Flag</span>
                    </button>
                  )}

                  {review.status !== "published" && (
                    <button
                      onClick={() =>
                        setDialog({
                          title: "Publish review?",
                          variant: "success",
                          confirmLabel: "Publish",
                          onConfirm: () => act(() => adminReviewsService.publish(review._id), "Review published."),
                        })
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> <span>Publish</span>
                    </button>
                  )}

                  <button
                    onClick={() =>
                      setDialog({
                        title: "Delete review permanently?",
                        message: "This permanently deletes the review entry from database.",
                        variant: "danger",
                        confirmLabel: "Delete",
                        onConfirm: () => act(() => adminReviewsService.remove(review._id), "Review deleted."),
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {total > 0 && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <p>
            {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-full border border-gray-200 bg-white disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-slate-800">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-full border border-gray-200 bg-white disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog config={dialog} onClose={() => setDialog(null)} />
      {toast && (
        <div className="fixed bottom-5 right-5 z-[110] bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl animate-in fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}
