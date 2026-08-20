import React from "react";
import { APP_NAME, SUPPORT_EMAIL } from "@/constants/app.constants";

export const metadata = {
  title: "Privacy Policy",
  description: `How ${APP_NAME} collects, uses and protects your data.`,
};

const SECTIONS: { heading: string; body: string[] }[] = [
  {
    heading: "1. Data We Collect",
    body: [
      "Account data: your name, email address, and password (hashed). Sellers also provide KYC documents (ID, selfie, proof of address) and bank details for payouts.",
      "Commerce data: products, orders, shipping addresses, buyer profiles scoped per store, and payment references. Payment card details are handled entirely by Paystack and never touch our servers.",
    ],
  },
  {
    heading: "2. How We Use Data",
    body: [
      "To operate your storefront and the marketplace: processing orders, holding payments in escrow, releasing payouts, verifying identities, preventing fraud, and providing support.",
      "We also use aggregated data to improve the platform. We do not sell your personal data to third parties.",
    ],
  },
  {
    heading: "3. Buyer Privacy on Storefronts",
    body: [
      "Each store operates as its own tenant. A buyer account registered on one seller's storefront is separate from an account on any other storefront, and sellers can only see the buyers of their own store.",
    ],
  },
  {
    heading: "4. Storage & Security",
    body: [
      "Documents and store assets are stored on encrypted object storage. Sessions use HttpOnly cookies. Access to KYC documents is restricted to authorized compliance reviewers and is retained only as long as required by law.",
    ],
  },
  {
    heading: "5. Your Rights",
    body: [
      `You may request a copy of your data, correction of inaccurate details, or deletion of your account (subject to legal retention for completed transactions). Contact us at ${SUPPORT_EMAIL} to exercise these rights.`,
    ],
  },
  {
    heading: "6. Cookies",
    body: [
      "We use essential cookies to keep you signed in. Analytics cookies, where enabled, help us understand aggregate usage. You can disable non-essential cookies in your browser.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <section className="py-16 md:py-24 px-6 sm:px-12 lg:px-16 font-space-grotesk">
      <div className="max-w-3xl mx-auto flex flex-col gap-10">
        <header>
          <span className="inline-block text-xs font-bold text-primary uppercase tracking-widest bg-primary-light px-3.5 py-1 rounded-md mb-3">
            Legal
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted mt-2">
            {APP_NAME} collects the minimum data needed to run your store and
            protect every transaction. Last updated: August 2026.
          </p>
        </header>

        <div className="flex flex-col gap-8">
          {SECTIONS.map((section) => (
            <div key={section.heading}>
              <h2 className="text-lg font-bold tracking-tight mb-2">
                {section.heading}
              </h2>
              {section.body.map((paragraph, i) => (
                <p
                  key={i}
                  className="text-sm text-muted leading-relaxed mb-2 last:mb-0"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
