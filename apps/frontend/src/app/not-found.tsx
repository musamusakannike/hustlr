import Link from "next/link";
import { APP_NAME } from "@/constants/app.constants";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-bg-soft text-text font-space-grotesk flex flex-col items-center justify-center gap-5 px-6 text-center">
      <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary-light px-3.5 py-1 rounded-md">
        404
      </span>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
        This page took a wrong turn
      </h1>
      <p className="text-muted max-w-md leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
        Let&apos;s get you back to building your {APP_NAME} store.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-sm"
      >
        Back to Home
      </Link>
    </main>
  );
}
