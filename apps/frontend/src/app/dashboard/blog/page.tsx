"use client";

import React from "react";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useBlogPosts } from "@/hooks/useCommerce";
import { usePlanEntitlements } from "@/hooks/useSubscription";
import { blogService } from "@/services/commerce";
import { formatDate, getErrorMessage } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

export default function BlogListPage() {
  const { entitlements } = usePlanEntitlements();
  const { data, isLoading } = useBlogPosts({ limit: 50 });
  const { toast } = useToast();
  const qc = useQueryClient();
  const items = data?.items ?? [];

  if (!entitlements.allowBlog) {
    return (
      <Card>
        <EmptyState
          title="Blog is a Pro feature"
          description="Upgrade to Pro or Pro+ to publish stories on your storefront."
          action={
            <Link href="/dashboard/billing">
              <Button>View plans</Button>
            </Link>
          }
        />
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Blog</h2>
          <p className="text-sm text-muted mt-0.5">Stories shown on your storefront.</p>
        </div>
        <Link href="/dashboard/blog/new">
          <Button>New post</Button>
        </Link>
      </div>

      {isLoading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Newspaper className="w-6 h-6" />}
            title="No posts yet"
            action={
              <Link href="/dashboard/blog/new">
                <Button>Write a post</Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((post) => (
            <li key={post.id}>
              <Card className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{post.title}</p>
                  <p className="text-xs text-muted">{formatDate(post.createdAt)}</p>
                </div>
                <Badge variant={post.status === "published" ? "success" : "neutral"}>
                  {post.status}
                </Badge>
                <div className="flex gap-2">
                  <Link href={`/dashboard/blog/${post.id}`}>
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      try {
                        if (post.status === "published") await blogService.unpublish(post.id);
                        else await blogService.publish(post.id);
                        qc.invalidateQueries({ queryKey: ["seller-blog"] });
                      } catch (err) {
                        toast(getErrorMessage(err), "error");
                      }
                    }}
                  >
                    {post.status === "published" ? "Unpublish" : "Publish"}
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
