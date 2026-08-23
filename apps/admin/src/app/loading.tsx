import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-sans">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      <p className="mt-4 text-sm font-semibold text-gray-500">
        Loading console...
      </p>
    </div>
  );
}
