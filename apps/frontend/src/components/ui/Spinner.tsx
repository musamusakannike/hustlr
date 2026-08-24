import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({
  size = "md",
  className,
  label,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-12",
        className
      )}
      role="status"
      aria-label={label ?? "Loading"}
    >
      <Loader2
        className={cn("animate-spin text-primary", sizeClasses[size])}
      />
      {label && <p className="text-sm text-muted font-medium">{label}</p>}
    </div>
  );
}
