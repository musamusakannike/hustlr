"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
}

export default function Dropdown({
  trigger,
  options,
  onSelect,
  align = "right",
  className,
}: {
  trigger: React.ReactNode;
  options: DropdownOption[];
  onSelect: (value: string) => void;
  align?: "left" | "right";
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <div
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="cursor-pointer select-none"
      >
        {trigger}
      </div>
      <div
        className={cn(
          "absolute top-full mt-2 w-52 z-50 bg-white rounded-xl shadow-lg border border-black/5 py-2 transition-all duration-200 origin-top",
          align === "right" ? "right-0" : "left-0",
          isOpen
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onSelect(opt.value);
            }}
            className={cn(
              "w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium transition-colors cursor-pointer",
              opt.danger
                ? "text-danger hover:bg-danger-light/50"
                : "text-text/80 hover:text-primary hover:bg-primary-light/40"
            )}
          >
            {opt.icon}
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
