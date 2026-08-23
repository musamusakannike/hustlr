import React from "react";
import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/Card";
import { APP_NAME, APP_TAGLINE } from "@/constants/app.constants";

export const metadata = {
  title: "About Us",
  description: `${APP_NAME} empowers African merchants and creators to launch branded online stores with escrow-protected payments.`,
};

const VALUES = [
  {
    title: "Merchant-first",
    description:
      "Every feature is built around what sellers actually need: fast setup, fair fees, and payouts that arrive on time.",
  },
  {
    title: "Trust by default",
    description:
      "Escrow protects both sides of every transaction. Buyers shop with confidence; sellers get paid reliably.",
  },
  {
    title: "Built for Africa",
    description:
      "Paystack payments, Naira pricing, WhatsApp integration and delivery flows designed for African commerce.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex-1 flex flex-col font-space-grotesk">
      {/* Header band */}
      <section className="bg-bg-soft py-14 md:py-20 px-6 sm:px-12 lg:px-16 xl:px-20 border-b border-black/5">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            eyebrow="About Us"
            title={`Why ${APP_NAME} Exists`}
            description={APP_TAGLINE}
          />
        </div>
      </section>

      {/* Content */}
      <section className="flex-1 bg-white py-12 md:py-16 px-6 sm:px-12 lg:px-16 xl:px-20">
        <div className="max-w-7xl mx-auto flex flex-col gap-14">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="flex flex-col gap-5">
            <h3 className="text-2xl font-bold tracking-tight leading-snug">
              African merchants deserve world-class storefronts — without
              world-class bills.
            </h3>
            <p className="text-muted leading-relaxed">
              Too many talented sellers are stuck selling through chat threads
              and social DMs, losing orders to missed messages and earning
              nothing from buyer distrust. {APP_NAME} gives every merchant a
              branded storefront with their own subdomain (or custom domain),
              professional templates, and escrow-protected Paystack checkout —
              live in minutes.
            </p>
            <p className="text-muted leading-relaxed">
              We handle the hard parts: payments, verification, payouts and
              fraud protection — so you can focus on your craft and your
              customers.
            </p>
          </div>
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-black shadow-xl">
            <Image
              src="/whatwedo.jpg"
              alt={`${APP_NAME} merchants`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {VALUES.map((value) => (
            <div
              key={value.title}
              className="rounded-3xl bg-bg-soft border border-black/5 p-7"
            >
              <span className="inline-block text-xs font-bold text-primary uppercase tracking-widest bg-primary-light px-3 py-1 rounded-md mb-4">
                {value.title}
              </span>
              <p className="text-sm text-muted leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-3xl bg-dark text-white p-8 sm:p-12 text-center border border-primary/40">
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Join thousands of hustlers building their brands
          </h3>
          <p className="text-sm text-neutral-300 mt-2 max-w-xl mx-auto">
            Launch your free store today — no credit card required.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-7 py-3.5 rounded-xl font-semibold transition-all duration-200 shadow-md mt-6"
          >
            Start Your Free Store
          </Link>
        </div>
        </div>
      </section>
    </div>
  );
}
