"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin Global Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 font-sans">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-lg border border-gray-100 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Something went wrong
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          {error.message ||
            "An unexpected error occurred in the administration console."}
        </p>
        <button
          onClick={reset}
          className="mt-6 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-primary-hover text-white font-bold text-sm transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Try again</span>
        </button>
      </div>
    </div>
  );
}
