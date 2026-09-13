import React from "react";
import { TrendingUp, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface Customer {
  id: string;
  name: string;
  amount: string;
  initials: string;
  avatarBg: string;
  avatarText: string;
}

const TOP_CUSTOMERS: Customer[] = [
  {
    id: "cust-1",
    name: "Tunde Adebayo",
    amount: "₦1,250,480",
    initials: "TA",
    avatarBg: "bg-primary-light",
    avatarText: "text-primary",
  },
  {
    id: "cust-2",
    name: "Chioma Okafor",
    amount: "₦816,780",
    initials: "CO",
    avatarBg: "bg-info-light",
    avatarText: "text-info",
  },
  {
    id: "cust-3",
    name: "Ronald Richards",
    amount: "₦540,200",
    initials: "RR",
    avatarBg: "bg-success-light",
    avatarText: "text-success",
  },
  {
    id: "cust-4",
    name: "Esther Howard",
    amount: "₦385,000",
    initials: "EH",
    avatarBg: "bg-warning-light",
    avatarText: "text-warning",
  },
  {
    id: "cust-5",
    name: "Cody Fisher",
    amount: "₦210,500",
    initials: "CF",
    avatarBg: "bg-bg-soft",
    avatarText: "text-dark",
  },
  {
    id: "cust-6",
    name: "Theresa Webb",
    amount: "₦95,000",
    initials: "TW",
    avatarBg: "bg-primary-light",
    avatarText: "text-primary",
  },
];

const CHART_BARS = [
  { height: "45%" },
  { height: "70%" },
  { height: "100%" },
  { height: "60%" },
  { height: "85%" },
];

export default function Content2() {
  return (
    <section
      aria-label="Customer Management & Sales Insights"
      className="w-full bg-bg py-16 sm:py-20 lg:py-28 font-space-grotesk overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-20 items-center">
          {/* Left Column: UI Mockup Cards */}
          <div className="lg:col-span-6 w-full flex justify-center">
            <div className="relative w-full max-w-[420px] sm:max-w-[460px]">
              {/* Main Card: Top Customers */}
              <div className="w-full bg-bg rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(10,14,17,0.07)] border border-border">
                <h3 className="text-lg sm:text-xl font-bold text-dark tracking-tight mb-5 sm:mb-6">
                  Top Customers
                </h3>

                <div className="divide-y divide-border/50">
                  {TOP_CUSTOMERS.map((customer) => (
                    <div
                      key={customer.id}
                      className="py-3 sm:py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-xs shrink-0 ${customer.avatarBg} ${customer.avatarText}`}
                        >
                          {customer.initials}
                        </div>
                        <span className="text-sm sm:text-base font-semibold text-dark truncate">
                          {customer.name}
                        </span>
                      </div>

                      <span className="text-xs sm:text-sm font-medium text-muted shrink-0 tabular-nums">
                        {customer.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating Overlay Card: Total Invoices with Bar Chart */}
              <div className="absolute -bottom-6 right-2 sm:-right-6 sm:-bottom-8 z-10 bg-bg rounded-2xl p-4 sm:p-5 shadow-[0_15px_40px_rgba(10,14,17,0.12)] border border-border flex items-center gap-6 sm:gap-8">
                {/* Stats */}
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-muted">
                    Total Invoice
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-bold text-dark tracking-tight">
                      520
                    </span>
                    <span className="inline-flex items-center text-xs font-semibold text-success">
                      +12%
                    </span>
                  </div>
                </div>

                {/* Vertical Bar Chart */}
                <div className="flex items-end gap-1.5 sm:gap-2 h-12 sm:h-14">
                  {CHART_BARS.map((bar, index) => (
                    <div
                      key={index}
                      className="w-2 sm:w-2.5 h-full rounded-full bg-bg-soft flex flex-col justify-end overflow-hidden"
                    >
                      <div
                        className="w-full rounded-full bg-warning transition-all duration-500"
                        style={{ height: bar.height }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Copy & Messaging */}
          <div className="lg:col-span-6 flex flex-col items-start max-w-xl">
            <p className="text-xs sm:text-sm font-bold tracking-widest uppercase text-primary mb-3 sm:mb-4">
              CUSTOMER INSIGHTS &amp; REVENUE
            </p>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-dark leading-[1.18]">
              Managing &amp; scaling your online store is now easier.
            </h2>

            <p className="mt-5 sm:mt-6 text-base sm:text-lg text-muted leading-relaxed font-normal">
              Digital commerce is where the growth is. Hustlr eliminates the
              hassle of running an online business by automating orders,
              tracking your highest-value customers, and securing every payment
              with escrow protection.
            </p>

            <div className="mt-8 sm:mt-10">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm sm:text-base font-semibold rounded-lg text-light bg-primary hover:bg-primary-hover active:scale-[0.98] transition-all shadow-sm"
              >
                <span>Start Selling Free</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
