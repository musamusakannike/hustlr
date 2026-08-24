import React from "react";
import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 font-sans">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-lg border border-gray-100 text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary-bg text-primary flex items-center justify-center mx-auto mb-4">
          <FileQuestion className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Page Not Found</h2>
        <p className="mt-2 text-sm text-gray-500">
          The admin module or resource you requested could not be located.
        </p>
        <Link
          href="/dashboard/overview"
          className="mt-6 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-primary-hover text-white font-bold text-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
