import React from "react";

export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-100">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}
