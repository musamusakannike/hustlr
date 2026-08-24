"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export default function Tabs({
  items,
  activeId,
  onChange,
  className,
}: {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 overflow-x-auto no-scrollbar bg-white p-1.5 rounded-2xl shadow-xs border border-border w-fit max-w-full",
        className
      )}
    >
      {items.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5",
            activeId === tab.id
              ? "bg-primary text-white shadow-xs"
              : "text-muted hover:text-black"
          )}
        >
          <span>{tab.label}</span>
          {typeof tab.count === "number" && (
            <span
              className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full",
                activeId === tab.id
                  ? "bg-white/20 text-white"
                  : "bg-primary-light text-primary"
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
