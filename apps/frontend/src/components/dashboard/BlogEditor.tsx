"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useBlogPost, useSaveBlog } from "@/hooks/useCommerce";
import { getErrorMessage } from "@/lib/utils";

export default function BlogEditor({ postId }: { postId?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { data: existing, isLoading } = useBlogPost(postId ?? "");
  const save = useSaveBlog();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");

  useEffect(() => {
    if (!existing) return;
    setTitle(existing.title);
    setExcerpt(existing.excerpt);
    setContent(existing.content);
    setCoverImage(existing.coverImage ?? "");
  }, [existing]);

  if (postId && isLoading) return <Spinner />;

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/blog")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">{postId ? "Edit post" : "New post"}</h2>
      </div>
      <Card className="flex flex-col gap-4">
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Input
          label="Cover image URL"
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
        />
        <Textarea
          label="Excerpt"
          rows={3}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
        />
        <Textarea
          label="Content"
          rows={12}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Button
          disabled={title.trim().length < 2}
          loading={save.isPending}
          onClick={() =>
            save.mutate(
              {
                id: postId,
                data: { title: title.trim(), excerpt, content, coverImage },
              },
              {
                onSuccess: () => {
                  toast("Post saved.", "success");
                  router.push("/dashboard/blog");
                },
                onError: (err) => toast(getErrorMessage(err), "error"),
              }
            )
          }
        >
          Save
        </Button>
      </Card>
    </div>
  );
}
