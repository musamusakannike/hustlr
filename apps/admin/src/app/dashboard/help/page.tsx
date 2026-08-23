"use client";

import React, { useState } from "react";
import {
  HelpCircle,
  Search,
  BookOpen,
  PhoneCall,
  Mail,
  ShieldCheck,
  FileText,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle2,
} from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
  category: "KYC Rules" | "Dispute Protocol" | "Security & Fraud" | "Escrow & Payouts";
}

const faqs: FaqItem[] = [
  {
    question: "What government ID types are valid for Nigerian merchant verification?",
    answer:
      "Hustlr accepts valid International Passports, National Identification Numbers (NIN Slip / Card), Driver's Licenses, and Voter's Cards issued by official Nigerian government agencies.",
    category: "KYC Rules",
  },
  {
    question: "How is escrow payment released to merchants after dispute resolution?",
    answer:
      "Once an admin resolves a dispute in favor of the seller, executing 'Release to Seller' transfers escrow funds directly into the merchant's withdrawable wallet balance immediately.",
    category: "Dispute Protocol",
  },
  {
    question: "What triggers automatic account freeze in the Security Console?",
    answer:
      "Accounts registering high risk velocity triggers (e.g. repeated failed payment attempts, disposable email signups, or blacklisted IP addresses) are automatically flagged and locked pending admin review.",
    category: "Security & Fraud",
  },
  {
    question: "What is the standard SLA response time for urgent disputes?",
    answer:
      "Disputes tagged as 'High Priority' or high value (> ₦200,000) must be arbitrated by an admin within 6 business hours.",
    category: "Dispute Protocol",
  },
  {
    question: "How does automated Paystack transfer dispatch work for approved payouts?",
    answer:
      "When a payout request is approved, clicking 'Dispatch Transfer' calls the Paystack Transfer API to credit the merchant's verified Nigerian NBN account.",
    category: "Escrow & Payouts",
  },
];

export default function HelpDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [ticketSent, setTicketSent] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketBody, setTicketBody] = useState("");

  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketBody) return;
    setTicketSent(true);
    setTimeout(() => {
      setTicketSent(false);
      setTicketSubject("");
      setTicketBody("");
    }, 3000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#0A0E11] tracking-tight flex items-center gap-2.5">
          <HelpCircle className="w-6 h-6 text-primary" />
          Admin SOP & Operational Compliance
        </h1>
        <p className="text-sm text-gray-500 font-medium mt-1">
          Standard operating procedures, merchant compliance guidelines, and emergency internal support escalation.
        </p>
      </div>

      {/* Emergency Contacts Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-200/70 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-primary-bg text-primary flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-slate-900">Trust & Safety Desk</p>
            <p className="text-gray-400">safety@hustlr.ng</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200/70 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-slate-900">Compliance Hotline</p>
            <p className="text-gray-400">+234 (0) 800 487 8576</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200/70 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-slate-900">Legal Escalations</p>
            <p className="text-gray-400">legal@hustlr.ng</p>
          </div>
        </div>
      </div>

      {/* FAQ & Contact Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FAQs */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-7 rounded-3xl border border-gray-200/70 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Standard Operating Procedures (SOP)
            </h3>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search SOP guidelines..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredFaqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className="border border-gray-100 rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full p-4 text-left flex items-center justify-between bg-gray-50/60 hover:bg-primary-bg/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-primary-bg text-primary">
                        {faq.category}
                      </span>
                      <span className="font-bold text-xs sm:text-sm text-slate-900">
                        {faq.question}
                      </span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-gray-100">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Support Ticket Form */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/70 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Internal Admin Escalation
          </h3>
          <p className="text-xs text-gray-400">
            Submit a direct escalation ticket to senior platform engineering or legal compliance.
          </p>

          {ticketSent ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 animate-in fade-in">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-emerald-900 text-sm">Escalation Dispatched</h4>
              <p className="text-xs text-emerald-700">Your escalation has been logged with ID #ESC-{Date.now().toString().slice(-4)}.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitTicket} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="e.g. Paystack webhook timeout"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Issue Details</label>
                <textarea
                  required
                  rows={4}
                  value={ticketBody}
                  onChange={(e) => setTicketBody(e.target.value)}
                  placeholder="Provide incident timestamps, affected accounts, and error logs..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-primary resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <Send className="w-4 h-4" />
                <span>Submit Escalation</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
