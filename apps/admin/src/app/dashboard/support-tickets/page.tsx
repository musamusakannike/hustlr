"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  MessageSquare,
  Search,
  ChevronDown,
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
  Send,
  RotateCcw,
  ArrowLeft,
  UserCircle,
  HelpCircle,
} from "lucide-react";
import { adminTicketsService, type AdminTicketItem, type TicketMessage } from "@/lib/api";

const STATUS_OPTIONS = ["Open", "In Progress", "Resolved", "Closed"] as const;

const statusPillClass = (status: string) => {
  const normalized = status.toLowerCase();
  switch (normalized) {
    case "open":
      return "bg-amber-50 text-amber-700";
    case "in_progress":
    case "in progress":
      return "bg-blue-50 text-blue-700";
    case "resolved":
      return "bg-emerald-50 text-emerald-700";
    case "closed":
      return "bg-gray-100 text-gray-500";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const priorityPillClass = (priority: string) => {
  const normalized = priority.toLowerCase();
  switch (normalized) {
    case "high":
    case "urgent":
      return "bg-rose-50 text-rose-700";
    case "medium":
      return "bg-amber-50 text-amber-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

export default function SupportTicketsDashboardPage() {
  const [tickets, setTickets] = useState<AdminTicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<AdminTicketItem | null>(null);
  const [openingTicket, setOpeningTicket] = useState(false);

  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [chatMessage, setChatMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const nowTimestamp = useMemo(() => Date.now(), []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await adminTicketsService.list({
        status: statusFilter !== "All" ? statusFilter.toLowerCase() : undefined,
        priority: priorityFilter !== "All" ? priorityFilter.toLowerCase() : undefined,
        search: searchQuery || undefined,
      });
      setTickets(res.tickets || []);
    } catch {
      // Fallback sample tickets
      setTickets([
        {
          _id: "tkt_01",
          ticketNumber: "TK-9912",
          subject: "Custom domain DNS records not propagating",
          topic: "Domain Setup",
          priority: "high",
          status: "open",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: { _id: "u1", name: "Oluwaseun Bakare", email: "seun@apex.ng", role: "seller", storeName: "Apex Electronics" },
          messages: [
            {
              senderId: "u1",
              senderRole: "seller",
              senderName: "Oluwaseun Bakare",
              message: "Hello support, I added the CNAME and A records 24 hours ago but the SSL handshake is still pending.",
              attachments: [],
              createdAt: new Date().toISOString(),
            },
          ],
        },
        {
          _id: "tkt_02",
          ticketNumber: "TK-9910",
          subject: "Inquiry about 5% transaction commission tier on Pro+",
          topic: "Billing & Plans",
          priority: "medium",
          status: "in_progress",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          userId: { _id: "u2", name: "Khadija Luxury", email: "sales@khadija.ng", role: "seller", storeName: "Khadija Luxury" },
          messages: [
            {
              senderId: "u2",
              senderRole: "seller",
              senderName: "Khadija Luxury",
              message: "Does the 5% commission apply automatically upon upgrade or starting next billing cycle?",
              attachments: [],
              createdAt: new Date(Date.now() - 86400000).toISOString(),
            },
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTickets();
  }, [statusFilter, priorityFilter, searchQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedTicket?.messages?.length]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = nowTimestamp - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handleOpenTicket = async (item: AdminTicketItem) => {
    setOpeningTicket(true);
    try {
      const res = await adminTicketsService.getById(item._id);
      setSelectedTicket(res?.ticket || item);
    } catch {
      setSelectedTicket(item);
    } finally {
      setOpeningTicket(false);
    }
  };

  const handleSendChatMessage = async () => {
    if (!selectedTicket || !chatMessage.trim()) return;
    setSendingMessage(true);
    try {
      const res = await adminTicketsService.reply(selectedTicket._id, chatMessage.trim());
      const updated = res.ticket || {
        ...selectedTicket,
        messages: [
          ...(selectedTicket.messages || []),
          {
            senderId: "admin",
            senderRole: "admin",
            senderName: "Support Admin",
            message: chatMessage.trim(),
            createdAt: new Date().toISOString(),
          },
        ],
      };
      setSelectedTicket(updated);
      setTickets((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
      setChatMessage("");
    } catch {
      console.error("Failed to send reply");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedTicket) return;
    setUpdatingStatus(true);
    try {
      await adminTicketsService.updateStatus(selectedTicket._id, status.toLowerCase());
      setSelectedTicket((prev) => (prev ? { ...prev, status: status as any } : prev));
      setTickets((prev) =>
        prev.map((t) => (t._id === selectedTicket._id ? { ...t, status: status as any } : t)),
      );
    } catch {
      console.error("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {!selectedTicket ? (
        /* ==================== VIEW 1: TICKET LIST ==================== */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-[#0A0E11] tracking-tight flex items-center gap-2.5">
                <MessageSquare className="w-6 h-6 text-primary" />
                Merchant Support Tickets
              </h1>
              <p className="text-sm text-gray-500 font-medium mt-1">
                Respond to merchant technical requests, domain mapping questions, and billing queries.
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 px-4 py-2.5 pr-8 rounded-full text-xs font-bold text-slate-800 outline-none focus:border-primary shadow-xs cursor-pointer"
                >
                  <option value="All">Status: All</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      Status: {s}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 px-4 py-2.5 pr-8 rounded-full text-xs font-bold text-slate-800 outline-none focus:border-primary shadow-xs cursor-pointer"
                >
                  <option value="All">Priority: All</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="relative flex-1 max-w-xs">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tickets..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-full text-xs text-slate-800 placeholder-gray-400 outline-none focus:border-primary shadow-xs transition-all"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl border border-gray-200/70 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-primary-bg border-b border-gray-200 text-primary font-bold">
                  <tr>
                    <th className="px-6 py-4">Ticket #</th>
                    <th className="px-6 py-4">Merchant</th>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Priority</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Updated</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400 text-xs">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                        <p className="mt-2">Loading support tickets...</p>
                      </td>
                    </tr>
                  ) : tickets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400 text-xs">
                        No support tickets found matching filters.
                      </td>
                    </tr>
                  ) : (
                    tickets.map((item) => {
                      const userObj = typeof item.userId === "object" ? item.userId : null;
                      return (
                        <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-slate-900">
                            {item.ticketNumber || item._id.slice(-6).toUpperCase()}
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-900">{userObj?.name || "Merchant"}</p>
                            <p className="text-gray-400 text-[11px]">{userObj?.storeName || userObj?.email || ""}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-semibold text-slate-800 max-w-xs truncate">{item.subject}</p>
                            <span className="text-[11px] text-gray-400">{item.topic || "Support"}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${priorityPillClass(item.priority)}`}>
                              {item.priority.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${statusPillClass(item.status)}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-500">
                            <div>{formatDate(item.updatedAt || item.createdAt)}</div>
                            <div className="text-[11px] text-gray-400">{formatTimeAgo(item.updatedAt || item.createdAt)}</div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleOpenTicket(item)}
                              disabled={openingTicket}
                              className="px-4 py-1.5 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors shadow-xs"
                            >
                              Open
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* ==================== VIEW 2: TICKET DETAIL & CONVERSATION ==================== */
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedTicket(null)}
              className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to all tickets</span>
            </button>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${priorityPillClass(selectedTicket.priority)}`}>
                {selectedTicket.priority.toUpperCase()}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusPillClass(selectedTicket.status)}`}>
                {selectedTicket.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Column 1: Requester Profile & Status Updater */}
            <div className="space-y-5">
              <div className="bg-white rounded-3xl p-6 border border-gray-200/70 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Requester Details</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary-bg text-primary flex items-center justify-center font-bold text-sm">
                    {typeof selectedTicket.userId === "object" ? selectedTicket.userId?.name?.[0] || "M" : "M"}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">
                      {typeof selectedTicket.userId === "object" ? selectedTicket.userId?.name : "Merchant"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {typeof selectedTicket.userId === "object" ? selectedTicket.userId?.email : ""}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-gray-100 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Store:</span>
                    <span className="font-bold text-slate-800">
                      {typeof selectedTicket.userId === "object" ? selectedTicket.userId?.storeName || "—" : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Category:</span>
                    <span className="font-bold text-slate-800">{selectedTicket.topic || "Technical"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Opened:</span>
                    <span className="text-slate-600">{formatDate(selectedTicket.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Status Manager */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200/70 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Ticket Status</h3>
                <div className="space-y-2">
                  {STATUS_OPTIONS.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(status)}
                      disabled={updatingStatus || selectedTicket.status.toLowerCase() === status.toLowerCase()}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                        selectedTicket.status.toLowerCase() === status.toLowerCase()
                          ? "bg-primary text-white shadow-xs"
                          : "bg-gray-50 border border-gray-200 text-slate-700 hover:bg-gray-100"
                      }`}
                    >
                      <span>{status}</span>
                      {selectedTicket.status.toLowerCase() === status.toLowerCase() && (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Column 2-3: Real-Time Conversation */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200/70 shadow-xs flex flex-col h-150 justify-between overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedTicket.subject}</h3>
                  <p className="text-xs text-gray-400">Ticket #{selectedTicket.ticketNumber || selectedTicket._id.slice(-6).toUpperCase()}</p>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/40">
                {!selectedTicket.messages || selectedTicket.messages.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-12">No messages in this ticket.</p>
                ) : (
                  selectedTicket.messages.map((msg, idx) => {
                    const isAdmin = msg.senderRole === "admin";
                    return (
                      <div key={idx} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[78%] rounded-3xl px-5 py-3.5 space-y-1 ${
                            isAdmin
                              ? "bg-primary text-white shadow-xs"
                              : "bg-white border border-gray-200 text-slate-800 shadow-2xs"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 text-[11px]">
                            <span className={`font-bold ${isAdmin ? "text-white" : "text-primary"}`}>
                              {msg.senderName || (isAdmin ? "Support Admin" : "Merchant")}
                            </span>
                            <span className={isAdmin ? "text-white/70" : "text-gray-400"}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Form */}
              <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendChatMessage();
                      }
                    }}
                    placeholder="Type official admin reply..."
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-full text-xs font-medium text-slate-800 outline-none focus:border-primary transition-all"
                  />
                  <button
                    onClick={handleSendChatMessage}
                    disabled={sendingMessage || !chatMessage.trim()}
                    className="p-3 rounded-full bg-primary hover:bg-primary-hover text-white transition-colors disabled:opacity-50 shadow-xs"
                  >
                    {sendingMessage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
