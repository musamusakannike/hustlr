import React from "react";
import { APP_NAME, SUPPORT_EMAIL } from "@/constants/app.constants";
import { SectionHeading } from "@/components/ui/Card";

export const metadata = {
  title: "Terms of Service",
  description: `The terms governing use of ${APP_NAME} by sellers and buyers.`,
};

const SECTIONS: { heading: string; body: string[] }[] = [
  {
    heading: "1. Acceptance of Terms",
    body: [
      `By creating a ${APP_NAME} account, setting up a store, or purchasing from a ${APP_NAME} storefront, you agree to these Terms of Service. If you do not agree, please do not use the platform.`,
    ],
  },
  {
    heading: "2. Seller Accounts & Storefronts",
    body: [
      "Sellers must provide accurate information during registration and KYC verification. Each seller operates one storefront on an assigned subdomain and may connect a custom domain on eligible plans.",
      "Sellers are solely responsible for the products they list, including legality, authenticity, safety, and accurate descriptions. Stores that repeatedly infringe these rules may be suspended.",
    ],
  },
  {
    heading: "3. KYC Verification",
    body: [
      "Before accepting live orders, sellers must complete identity (KYC) verification. We review submitted documents manually and may request additional information. Verification protects the entire marketplace and is required for payouts.",
    ],
  },
  {
    heading: "4. Subscriptions & Commissions",
    body: [
      "Going live requires an active subscription (Free, Pro, or Pro+). Plan fees are charged in Naira via Paystack. Each plan carries a platform commission on fulfilled orders as displayed at checkout and on the pricing page at the time of subscription.",
      "Subscriptions renew automatically until cancelled. If a payment fails, stores remain online during a short grace period before going offline.",
    ],
  },
  {
    heading: "5. Escrow Payments",
    body: [
      "Buyer payments are collected by the platform and held in escrow. Funds are released to the seller's wallet after the buyer confirms delivery, or automatically after the escrow window elapses without a dispute.",
      "If a buyer opens a dispute, funds remain locked until the platform resolves the case. Refunds, when granted, are returned to the buyer's original payment method.",
    ],
  },
  {
    heading: "6. Prohibited Conduct",
    body: [
      "You may not use the platform to sell illegal goods, infringe intellectual property, launder money, misrepresent products, or harass buyers or staff. We reserve the right to remove listings, suspend stores, and report unlawful activity.",
    ],
  },
  {
    heading: "7. Payouts",
    body: [
      "Released escrow funds can be withdrawn to the verified bank account provided during KYC. Withdrawal requests are reviewed by the platform and dispatched via Paystack transfers.",
    ],
  },
  {
    heading: "8. Changes & Contact",
    body: [
      "We may update these terms as the platform evolves. Material changes will be announced in advance. Questions? Reach us at",
      SUPPORT_EMAIL,
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="flex-1 flex flex-col font-space-grotesk">
      {/* Header band */}
      <section className="bg-bg-soft py-14 md:py-20 px-6 sm:px-12 lg:px-16 xl:px-20 border-b border-black/5">
        <SectionHeading
          eyebrow="Legal"
          title="Terms of Service"
          description={`The terms governing use of ${APP_NAME}. Last updated: August 2026.`}
        />
      </section>

      {/* Content */}
      <section className="flex-1 bg-white py-12 md:py-16 px-6 sm:px-12 lg:px-16 xl:px-20">
        <div className="max-w-3xl mx-auto flex flex-col gap-10">
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
    </div>
  );
}
