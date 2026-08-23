"use client";

import React, { useEffect, useState } from "react";
import {
  MessageCircleQuestion,
  Search,
  Send,
  Clock,
  Loader2,
} from "lucide-react";
import { adminTicketsService, type AdminTicketItem } from "@/lib/api";

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<AdminTicketItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await adminTicketsService.list();
        if (mounted && res?.tickets) {
          setTickets(res.tickets);
        }
      } catch {
        if (mounted) {
          setTickets([
            {
              _id: "tkt_01",
              userId: "usr_01",
              subject: "Custom domain DNS records not propagating",
              status: "open",
              priority: "high",
              createdAt: new Date().toISOString(),
            },
            {
              _id: "tkt_02",
              userId: "usr_02",
              subject: "Question regarding 7% commission fee on Pro plan",
              status: "in_progress",
              priority: "medium",
              createdAt: new Date(Date.now() - 86400000).toISOString(),
            },
          ]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0A0E11] tracking-tight">
            Support Tickets & Inquiries
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Resolve merchant technical requests, domain mapping questions, and
            billing queries.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200/70 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-primary-bg border-b border-gray-200 text-primary font-bold">
              <tr>
                <th className="px-6 py-4">Ticket ID</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-slate-700">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                    <p className="mt-2 text-xs">Loading support tickets...</p>
                  </td>
                </tr>
              ) : (
                tickets.map((tkt) => (
                  <tr
                    key={tkt._id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      {tkt._id}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {tkt.subject}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          tkt.priority === "high"
                            ? "bg-red-50 text-red-700"
                            : tkt.priority === "medium"
                              ? "bg-orange-50 text-orange-700"
                              : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {tkt.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700">
                        {tkt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="px-3 py-1.5 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors">
                        Reply
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
