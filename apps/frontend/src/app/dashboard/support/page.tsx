"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LifeBuoy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useCreateTicket, useTickets } from "@/hooks/useCommerce";
import { formatDate, getErrorMessage } from "@/lib/utils";

const TOPICS = [
  { value: "billing", label: "Billing" },
  { value: "kyc", label: "KYC" },
  { value: "orders", label: "Orders & escrow" },
  { value: "technical", label: "Technical" },
  { value: "other", label: "Other" },
];

export default function SupportPage() {
  const { toast } = useToast();
  const { data, isLoading } = useTickets({ limit: 50 });
  const create = useCreateTicket();
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState("billing");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const items = data?.items ?? [];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Support</h2>
          <p className="text-sm text-muted mt-0.5">Talk to the Hustlr team about your store.</p>
        </div>
        <Button onClick={() => setOpen(true)}>New ticket</Button>
      </div>

      {isLoading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon={<LifeBuoy className="w-6 h-6" />}
            title="No tickets"
            action={<Button onClick={() => setOpen(true)}>Open a ticket</Button>}
          />
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((t) => (
            <li key={t.id}>
              <Link
                href={`/dashboard/support/${t.id}`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-white p-4 hover:border-primary/40"
              >
                <div className="min-w-0">
                  <p className="font-semibold truncate">{t.subject}</p>
                  <p className="text-xs text-muted">
                    {t.ticketNumber} • {formatDate(t.createdAt)}
                  </p>
                </div>
                <Badge variant={t.status === "Resolved" || t.status === "Closed" ? "success" : "warning"}>
                  {t.status}
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Modal isOpen={open} onClose={() => setOpen(false)} title="New support ticket">
        <div className="flex flex-col gap-4">
          <Select
            label="Topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            options={TOPICS}
          />
          <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          <Textarea label="Message" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} />
          <Button
            disabled={!subject.trim() || !message.trim()}
            loading={create.isPending}
            onClick={() =>
              create.mutate(
                { topic, subject: subject.trim(), message: message.trim() },
                {
                  onSuccess: () => {
                    toast("Ticket opened.", "success");
                    setOpen(false);
                    setSubject("");
                    setMessage("");
                  },
                  onError: (err) => toast(getErrorMessage(err), "error"),
                }
              )
            }
          >
            Submit
          </Button>
        </div>
      </Modal>
    </div>
  );
}
