"use client";

import { APP_NAME, SUPPORT_EMAIL } from "@/constants/app.constants";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-bg-soft text-text font-space-grotesk flex flex-col items-center justify-center gap-5 px-6 text-center">
      <span className="text-xs font-bold text-danger uppercase tracking-widest bg-danger-light px-3.5 py-1 rounded-md">
        Something broke
      </span>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
        An unexpected error occurred
      </h1>
      <p className="text-muted max-w-md leading-relaxed">
        {APP_NAME} hit a snag loading this page. Try again, and if it persists
        reach us at{" "}
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="text-primary font-semibold"
        >
          {SUPPORT_EMAIL}
        </a>
        .
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-sm cursor-pointer"
      >
        Try Again
      </button>
    </main>
  );
}
