"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useReplyReview, useSellerReviews } from "@/hooks/useCommerce";
import { formatDate, getErrorMessage } from "@/lib/utils";
import type { Review } from "@/types/review";

export default function ReviewsPage() {
  const { toast } = useToast();
  const { data, isLoading } = useSellerReviews({ limit: 50 });
  const reply = useReplyReview();
  const [target, setTarget] = useState<Review | null>(null);
  const [text, setText] = useState("");

  const items = data?.items ?? [];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Reviews</h2>
        <p className="text-sm text-muted mt-0.5">
          Verified-purchase ratings from your storefront. Reply publicly if you want.
        </p>
      </div>

      {isLoading ? (
        <Spinner label="Loading reviews…" />
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Star className="w-6 h-6" />}
            title="No reviews yet"
            description="Reviews appear after a buyer confirms an order and rates the product."
          />
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((review) => (
            <li key={review.id}>
              <Card className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{review.productTitle}</p>
                    <p className="text-xs text-muted">{formatDate(review.createdAt)}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-primary">
                    <Star className="w-4 h-4 fill-current" />
                    {review.rating}
                  </span>
                </div>
                {review.title && <p className="font-semibold mt-2">{review.title}</p>}
                {review.comment && (
                  <p className="text-sm text-muted mt-1 leading-relaxed">{review.comment}</p>
                )}
                {review.sellerReply ? (
                  <p className="text-sm mt-3 p-3 rounded-xl bg-bg-soft">
                    <span className="font-semibold">Your reply: </span>
                    {review.sellerReply.text}
                  </p>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3"
                    onClick={() => {
                      setTarget(review);
                      setText("");
                    }}
                  >
                    Reply
                  </Button>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Modal
        isOpen={Boolean(target)}
        onClose={() => setTarget(null)}
        title="Reply to review"
        description={target?.productTitle}
      >
        <Textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} />
        <Button
          className="mt-3"
          disabled={!text.trim()}
          loading={reply.isPending}
          onClick={() => {
            if (!target) return;
            reply.mutate(
              { id: target.id, text: text.trim() },
              {
                onSuccess: () => {
                  toast("Reply posted.", "success");
                  setTarget(null);
                },
                onError: (err) => toast(getErrorMessage(err), "error"),
              }
            );
          }}
        >
          Post reply
        </Button>
      </Modal>
    </div>
  );
}
