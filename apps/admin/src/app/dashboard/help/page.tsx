"use client";

import React from "react";
import {
  HelpCircle,
  BookOpen,
  Shield,
  ExternalLink,
  LifeBuoy,
} from "lucide-react";

export default function HelpPage() {
  const guides = [
    {
      title: "Paystack Escrow Lifecycle",
      desc: "Detailed workflow of charge capture, fraud checks, tracking milestones, and automated release triggers.",
    },
    {
      title: "Merchant KYC Verification SOP",
      desc: "Standard operating procedures for checking CAC documents, NIN/BVN matches, and utility proof validation.",
    },
    {
      title: "Dispute Mediation Guidelines",
      desc: "Protocols for handling transit damages, refund splits, and seller return logistics.",
    },
    {
      title: "Subdomain & Custom Domain Routing",
      desc: "Technical guide on Wildcard SSL DNS configuration and CNAME verification for Pro+ sellers.",
    },
  ];

  return (
    <div className="space-y-6 font-sans max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-[#0A0E11] tracking-tight">
          Admin Documentation & Knowledge Base
        </h1>
        <p className="text-sm text-gray-500 font-medium mt-1">
          Operational playbooks, escrow dispute rules, and platform management
          guides.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {guides.map((g, i) => (
          <div
            key={i}
            className="bg-white rounded-3xl p-6 border border-gray-200/70 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-primary-bg text-primary flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">{g.title}</h3>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                {g.desc}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer">
                <span>Read Playbook</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
