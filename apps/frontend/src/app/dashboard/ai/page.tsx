"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bot, Plus, Send, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { usePlanEntitlements } from "@/hooks/useSubscription";
import { aiPartnerService } from "@/services/commerce";
import { cn, formatDateTime, getErrorMessage } from "@/lib/utils";
import type { AiAction, AiChatMessage, AiThread } from "@/types/ai-partner";

const CHIPS = [
  "What's my cash position and escrow?",
  "What should I restock?",
  "Any disputes or stuck orders?",
];

function renderContent(text: string) {
  return text.split("\n").map((line, i) => (
    <p key={i} className={cn("text-sm leading-relaxed", line.startsWith("#") && "font-semibold text-base mt-2")}>
      {line.replace(/^#+\s*/, "") || "\u00a0"}
    </p>
  ));
}

function ActionCard({
  action,
  busy,
  onApply,
  onDismiss,
}: {
  action: AiAction;
  busy: boolean;
  onApply: () => void;
  onDismiss: () => void;
}) {
  const href =
    action.type === "coupon"
      ? "/dashboard/coupons"
      : action.type === "restock" || action.type === "price" || action.type === "catalog"
        ? `/dashboard/products/${String(action.payload.productId ?? "")}/edit`
        : "/dashboard";

  return (
    <div className="mt-3 rounded-xl border border-border bg-bg-soft p-3">
      <p className="text-sm font-medium">{action.previewLabel}</p>
      {action.status === "proposed" ? (
        <div className="mt-2 flex gap-2">
          <Button size="sm" onClick={onApply} disabled={busy} loading={busy}>
            Apply
          </Button>
          <Button size="sm" variant="ghost" onClick={onDismiss} disabled={busy}>
            Dismiss
          </Button>
        </div>
      ) : (
        <p className="mt-1 text-xs text-muted">
          {action.status === "applied" ? (
            <Link href={href} className="text-primary font-medium">
              Applied — view
            </Link>
          ) : (
            "Dismissed"
          )}
        </p>
      )}
    </div>
  );
}

export default function AiPartnerPage() {
  const { entitlements, isLoading: planLoading } = usePlanEntitlements();
  const { toast } = useToast();
  const [threads, setThreads] = useState<AiThread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeId) ?? null,
    [threads, activeId],
  );

  useEffect(() => {
    if (!entitlements.allowAiPartner) {
      setLoadingList(false);
      return;
    }
    aiPartnerService
      .listThreads()
      .then((items) => {
        const list = Array.isArray(items) ? items : [];
        setThreads(list);
        if (list[0]) setActiveId(list[0].id);
      })
      .catch((err) => toast(getErrorMessage(err), "error"))
      .finally(() => setLoadingList(false));
  }, [entitlements.allowAiPartner, toast]);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    setLoadingMsgs(true);
    aiPartnerService
      .listMessages(activeId)
      .then((data) => setMessages(data.messages ?? []))
      .catch((err) => toast(getErrorMessage(err), "error"))
      .finally(() => setLoadingMsgs(false));
  }, [activeId, toast]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  async function newChat() {
    try {
      const thread = await aiPartnerService.createThread();
      setThreads((prev) => [thread, ...prev]);
      setActiveId(thread.id);
      setMessages([]);
    } catch (err) {
      toast(getErrorMessage(err), "error");
    }
  }

  async function removeThread(id: string) {
    try {
      await aiPartnerService.deleteThread(id);
      setThreads((prev) => prev.filter((t) => t.id !== id));
      if (activeId === id) {
        const next = threads.find((t) => t.id !== id);
        setActiveId(next?.id ?? null);
      }
    } catch (err) {
      toast(getErrorMessage(err), "error");
    }
  }

  async function send(text: string) {
    const content = text.trim();
    if (!content || sending) return;
    let threadId = activeId;
    try {
      if (!threadId) {
        const thread = await aiPartnerService.createThread();
        setThreads((prev) => [thread, ...prev]);
        threadId = thread.id;
        setActiveId(thread.id);
      }
      setSending(true);
      setDraft("");
      setStreaming("");
      const optimistic: AiChatMessage = {
        id: `local-${Date.now()}`,
        role: "user",
        content,
        citations: [],
        actions: [],
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimistic]);
      const assistant = await aiPartnerService.streamMessage(threadId, content, (delta) => {
        setStreaming((s) => s + delta);
      });
      setStreaming("");
      setMessages((prev) => [...prev.filter((m) => m.id !== optimistic.id), { ...optimistic, id: `${optimistic.id}-ok` }, assistant]);
      setThreads((prev) =>
        prev
          .map((t) => (t.id === threadId ? { ...t, preview: assistant.content.slice(0, 80), title: t.title === "New chat" ? content.slice(0, 60) : t.title } : t))
          .sort((a, b) => (a.id === threadId ? -1 : b.id === threadId ? 1 : 0)),
      );
    } catch (err) {
      setStreaming("");
      toast(getErrorMessage(err), "error");
    } finally {
      setSending(false);
    }
  }

  function patchMessage(updated: AiChatMessage) {
    setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  }

  async function apply(actionId: string) {
    setActionBusy(actionId);
    try {
      patchMessage(await aiPartnerService.applyAction(actionId));
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setActionBusy(null);
    }
  }

  async function dismiss(actionId: string) {
    setActionBusy(actionId);
    try {
      patchMessage(await aiPartnerService.dismissAction(actionId));
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setActionBusy(null);
    }
  }

  if (planLoading) return <Spinner />;

  if (!entitlements.allowAiPartner) {
    return (
      <Card>
        <EmptyState
          icon={<Bot className="w-6 h-6" />}
          title="AI Partner is a Pro+ feature"
          description="Upgrade to Pro+ for a dedicated partner that reads this store's wallet, orders, and inventory."
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
    <div className="flex flex-col lg:flex-row gap-4 min-h-[calc(100vh-8rem)]">
      <aside className="lg:w-60 shrink-0 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight">AI Partner</h2>
          <Button size="sm" variant="outline" onClick={newChat}>
            <Plus className="w-4 h-4" />
            New
          </Button>
        </div>
        {loadingList ? (
          <Spinner />
        ) : (
          <ul className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-y-auto">
            {threads.map((t) => (
              <li key={t.id} className="min-w-[12rem] lg:min-w-0">
                <div
                  className={cn(
                    "flex items-start gap-1 rounded-xl border px-3 py-2",
                    t.id === activeId ? "border-primary bg-primary-light/40" : "border-border bg-white",
                  )}
                >
                  <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setActiveId(t.id)}>
                    <p className="text-sm font-medium truncate">{t.title}</p>
                    <p className="text-[11px] text-muted truncate">{t.preview}</p>
                  </button>
                  <button
                    type="button"
                    className="text-muted hover:text-danger p-1"
                    onClick={() => removeThread(t.id)}
                    aria-label="Delete chat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <section className="flex-1 flex flex-col rounded-3xl border border-border bg-white min-h-[28rem]">
        <div className="px-5 py-3 border-b border-border">
          <p className="text-sm font-semibold">{activeThread?.title ?? "New chat"}</p>
          <p className="text-xs text-muted">Reads only this store. Confirm before any catalog change.</p>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {loadingMsgs ? (
            <Spinner />
          ) : messages.length === 0 && !streaming ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-10">
              <Bot className="w-8 h-8 text-primary" />
              <p className="text-sm text-muted text-center max-w-sm">
                Ask about cash, restock, or orders. Figures come from this store only.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xl">
                {CHIPS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => send(c)}
                    className="text-left text-sm rounded-xl border border-border px-3 py-2 hover:border-primary"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((m) => (
                <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3",
                      m.role === "user" ? "bg-primary text-white" : "bg-bg-soft text-text",
                    )}
                  >
                    {renderContent(m.content)}
                    {m.role === "assistant" && m.citations?.length > 0 && (
                      <p className="mt-2 text-[11px] text-muted">
                        {m.citations.map((c) => `${c.source} · ${formatDateTime(c.asOf)}`).join(" · ")}
                      </p>
                    )}
                    {m.actions?.map((a) => (
                      <ActionCard
                        key={a.actionId}
                        action={a}
                        busy={actionBusy === a.actionId}
                        onApply={() => apply(a.actionId)}
                        onDismiss={() => dismiss(a.actionId)}
                      />
                    ))}
                  </div>
                </div>
              ))}
              {streaming && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-bg-soft">{renderContent(streaming)}</div>
                </div>
              )}
              <div ref={bottomRef} />
            </>
          )}
        </div>
        <form
          className="p-4 border-t border-border flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void send(draft);
          }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask about this store…"
            disabled={sending}
            className="flex-1 rounded-xl border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <Button type="submit" disabled={sending || !draft.trim()} loading={sending}>
            <Send className="w-4 h-4" />
            Send
          </Button>
        </form>
      </section>
    </div>
  );
}
