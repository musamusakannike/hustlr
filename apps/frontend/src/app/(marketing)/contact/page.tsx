"use client";

import React, { useState } from "react";
import { Mail, MessageCircle, Clock3, Send } from "lucide-react";
import { SectionHeading, Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { APP_NAME, SUPPORT_EMAIL } from "@/constants/app.constants";
import { useSellerAuth } from "@/context/SellerAuthContext";
import { ticketService } from "@/services/commerce";
import { getErrorMessage } from "@/lib/utils";

const TOPICS = [
  { value: "getting-started", label: "Getting started" },
  { value: "payments", label: "Payments & escrow" },
  { value: "kyc", label: "KYC verification" },
  { value: "subscription", label: "Plans & billing" },
  { value: "other", label: "Something else" },
];

export default function ContactPage() {
  const { toast } = useToast();
  const { isAuthenticated } = useSellerAuth();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  return (
    <div className="flex-1 flex flex-col font-space-grotesk">
      {/* Header band */}
      <section className="bg-bg-soft py-14 md:py-20 px-6 sm:px-12 lg:px-16 xl:px-20 border-b border-black/5">
        <div className="max-w-5xl mx-auto">
          <SectionHeading
            eyebrow="Contact Us"
            title="Talk to a Human"
            description={`Questions about ${APP_NAME}, your store or your payouts? We reply fast.`}
          />
        </div>
      </section>

      {/* Content */}
      <section className="flex-1 bg-white py-12 md:py-16 px-6 sm:px-12 lg:px-16 xl:px-20">
        <div className="max-w-5xl mx-auto flex flex-col gap-12">

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 flex items-center gap-4">
            <span className="w-11 h-11 rounded-xl bg-primary-light/60 text-primary flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-muted uppercase tracking-wider font-semibold">
                Email
              </p>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-sm font-semibold hover:text-primary transition-colors truncate block"
              >
                {SUPPORT_EMAIL}
              </a>
            </div>
          </Card>
          <Card className="p-5 flex items-center gap-4">
            <span className="w-11 h-11 rounded-xl bg-primary-light/60 text-primary flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-muted uppercase tracking-wider font-semibold">
                Community
              </p>
              <p className="text-sm font-semibold">Seller WhatsApp group</p>
            </div>
          </Card>
          <Card className="p-5 flex items-center gap-4">
            <span className="w-11 h-11 rounded-xl bg-primary-light/60 text-primary flex items-center justify-center shrink-0">
              <Clock3 className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-muted uppercase tracking-wider font-semibold">
                Response time
              </p>
              <p className="text-sm font-semibold">Under 24 hours</p>
            </div>
          </Card>
        </div>

        <Card className="p-6 sm:p-8">
          {sent ? (
            <div className="flex flex-col items-center text-center gap-4 py-8">
              <div className="w-14 h-14 rounded-full bg-success-light text-success flex items-center justify-center">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">
                Message received!
              </h3>
              <p className="text-sm text-muted max-w-sm leading-relaxed">
                Thanks for reaching out — our team will get back to you within
                24 hours.
              </p>
              <Button variant="outline" onClick={() => setSent(false)}>
                Send another message
              </Button>
            </div>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const topic = String(fd.get("topic") ?? "other");
                const name = String(fd.get("name") ?? "");
                const email = String(fd.get("email") ?? "");
                const message = String(fd.get("message") ?? "");
                const subject = `${TOPICS.find((t) => t.value === topic)?.label ?? topic} — ${name}`;
                setSending(true);
                try {
                  if (isAuthenticated) {
                    await ticketService.create({
                      topic,
                      subject,
                      message,
                    });
                    setSent(true);
                    toast("Ticket opened. We'll reply in your support inbox.", "success");
                  } else {
                    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`${message}\n\nFrom: ${name} <${email}>`)}`;
                  }
                } catch (err) {
                  toast(getErrorMessage(err), "error");
                } finally {
                  setSending(false);
                }
              }}
              className="flex flex-col gap-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Your Name" name="name" required placeholder="Ada Obi" />
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  required
                  placeholder="ada@example.com"
                />
              </div>
              <Select
                label="Topic"
                name="topic"
                required
                placeholder="What is this about?"
                options={TOPICS}
              />
              <Textarea
                label="Message"
                name="message"
                required
                rows={5}
                placeholder="Tell us what you need help with…"
              />
              <div className="flex justify-end">
                <Button type="submit" size="lg" loading={sending}>
                  <Send className="w-4 h-4" />
                  Send Message
                </Button>
              </div>
            </form>
          )}
        </Card>
        </div>
      </section>
    </div>
  );
}
