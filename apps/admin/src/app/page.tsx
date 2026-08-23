const metrics = [
  { label: "Gross sales", value: "NGN 12.8M", change: "+18.4%" },
  { label: "Active stores", value: "1,248", change: "+7.2%" },
  { label: "Open tickets", value: "36", change: "-11.0%" },
  { label: "Pending payouts", value: "84", change: "+3.1%" },
];

const queues = [
  "Review seller verification requests",
  "Approve high-value payout batch",
  "Investigate delayed fulfillment reports",
  "Publish updated subscription plans",
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside className="border-b border-[var(--border)] bg-[var(--panel)] px-6 py-5 lg:border-b-0 lg:border-r">
          <div className="text-xl font-bold tracking-normal text-[var(--primary)]">
            Hustlr Admin
          </div>
          <nav className="mt-8 grid gap-1 text-sm font-medium text-[var(--muted)]">
            {["Overview", "Stores", "Orders", "Payouts", "Support", "Settings"].map(
              (item) => (
                <a
                  className="rounded-md px-3 py-2 first:bg-[var(--primary-soft)] first:text-[var(--primary)] hover:bg-slate-100"
                  href="#"
                  key={item}
                >
                  {item}
                </a>
              ),
            )}
          </nav>
        </aside>

        <section className="px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex flex-col gap-4 border-b border-[var(--border)] pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">
                Platform Overview
              </h1>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Monitor marketplace health, seller activity, and operations queues.
              </p>
            </div>
            <button className="h-10 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-white">
              Export Report
            </button>
          </header>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <article
                className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5"
                key={metric.label}
              >
                <p className="text-sm text-[var(--muted)]">{metric.label}</p>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <strong className="text-2xl font-semibold">{metric.value}</strong>
                  <span className="text-sm font-semibold text-emerald-700">
                    {metric.change}
                  </span>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-[1.5fr_1fr]">
            <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)]">
              <div className="border-b border-[var(--border)] px-5 py-4">
                <h2 className="text-base font-semibold">Recent Activity</h2>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {["New seller onboarded", "Store flagged for review", "Payout completed"].map(
                  (activity, index) => (
                    <div className="flex items-center justify-between px-5 py-4" key={activity}>
                      <div>
                        <p className="font-medium">{activity}</p>
                        <p className="mt-1 text-sm text-[var(--muted)]">
                          {index + 2} minutes ago
                        </p>
                      </div>
                      <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        Live
                      </span>
                    </div>
                  ),
                )}
              </div>
            </section>

            <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5">
              <h2 className="text-base font-semibold">Operations Queue</h2>
              <div className="mt-4 grid gap-3">
                {queues.map((queue) => (
                  <label
                    className="flex items-start gap-3 rounded-md border border-[var(--border)] p-3 text-sm"
                    key={queue}
                  >
                    <input className="mt-1" type="checkbox" />
                    <span>{queue}</span>
                  </label>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
