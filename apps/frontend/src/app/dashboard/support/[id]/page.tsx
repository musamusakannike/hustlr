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
import { useReplyTicket, useTicket } from "@/hooks/useCommerce";
import { formatDateTime, getErrorMessage } from "@/lib/utils";

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const { data: ticket, isLoading } = useTicket(id);
  const reply = useReplyTicket();
  const [message, setMessage] = useState("");

  if (isLoading || !ticket) return <Spinner />;

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/support")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="min-w-0">
          <h2 className="text-2xl font-bold tracking-tight truncate">{ticket.subject}</h2>
          <p className="text-xs text-muted">{ticket.ticketNumber}</p>
        </div>
        <Badge className="ml-auto">{ticket.status}</Badge>
      </div>

      <Card>
        <ul className="flex flex-col gap-3">
          {(ticket.messages ?? []).map((m, i) => (
            <li
              key={`${m.createdAt}-${i}`}
              className={`rounded-2xl p-3 text-sm ${
                m.senderRole === "seller" ? "bg-primary-light/40 ml-8" : "bg-bg-soft mr-8"
              }`}
            >
              <p className="text-xs font-semibold mb-1">
                {m.senderName} · {formatDateTime(m.createdAt)}
              </p>
              <p>{m.message}</p>
            </li>
          ))}
        </ul>
        {ticket.status !== "Closed" && ticket.status !== "Resolved" && (
          <form
            className="mt-4 flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!message.trim()) return;
              reply.mutate(
                { id: ticket.id, message: message.trim() },
                {
                  onSuccess: () => setMessage(""),
                  onError: (err) => toast(getErrorMessage(err), "error"),
                }
              );
            }}
          >
            <Textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
            <Button type="submit" loading={reply.isPending} disabled={!message.trim()}>
              Send
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
