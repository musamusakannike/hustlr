"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useDispute, useMessageDispute } from "@/hooks/useCommerce";
import { formatDateTime, getErrorMessage } from "@/lib/utils";

export default function DisputeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const { data: dispute, isLoading } = useDispute(id);
  const send = useMessageDispute();
  const [message, setMessage] = useState("");

  if (isLoading || !dispute) return <Spinner label="Loading dispute…" />;

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/disputes")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{dispute.reason}</h2>
          <p className="text-sm text-muted">{dispute.order?.orderNumber}</p>
        </div>
        <Badge className="ml-auto">{dispute.status}</Badge>
      </div>

      <Card>
        <p className="text-sm leading-relaxed">{dispute.description}</p>
        {dispute.resolutionNote && (
          <p className="text-sm mt-4 p-3 rounded-xl bg-bg-soft">
            <span className="font-semibold">Resolution: </span>
            {dispute.resolutionNote}
          </p>
        )}
      </Card>

      <Card>
        <h3 className="font-bold mb-4">Conversation</h3>
        <ul className="flex flex-col gap-3 mb-4">
          {(dispute.messages ?? []).map((m, i) => (
            <li
              key={`${m.createdAt}-${i}`}
              className={`rounded-2xl p-3 text-sm ${
                m.senderRole === "seller" ? "bg-primary-light/40 ml-8" : "bg-bg-soft mr-8"
              }`}
            >
              <p className="text-xs font-semibold mb-1">
                {m.senderName} · {m.senderRole} · {formatDateTime(m.createdAt)}
              </p>
              <p>{m.message}</p>
            </li>
          ))}
        </ul>
        {dispute.status !== "Resolved" && (
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!message.trim()) return;
              send.mutate(
                { id: dispute.id, message: message.trim() },
                {
                  onSuccess: () => setMessage(""),
                  onError: (err) => toast(getErrorMessage(err), "error"),
                }
              );
            }}
          >
            <Textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Reply to the buyer…"
            />
            <Button type="submit" loading={send.isPending} disabled={!message.trim()}>
              Send reply
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
