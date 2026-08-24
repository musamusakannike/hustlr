"use client";

import React from "react";
import { useStore } from "@/hooks/useStore";
import { Spinner } from "@/components/ui/Spinner";
import StoreCustomizer from "@/components/dashboard/customizer/StoreCustomizer";

export default function CustomizeTemplatePage() {
  const { data: store, isLoading } = useStore();

  if (isLoading || !store) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Spinner size="lg" label="Loading store customizer..." />
      </div>
    );
  }

  return <StoreCustomizer store={store} />;
}
