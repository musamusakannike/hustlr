import React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "primary"
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "outline";

const variantClasses: Record<BadgeVariant, string> = {
  primary: "bg-primary-light text-primary",
  neutral: "bg-neutral-status-light text-neutral-status",
  success: "bg-success-light text-success",
  warning: "bg-warning-light text-warning",
  danger: "bg-danger-light text-danger",
  info: "bg-info-light text-info",
  outline: "border border-border text-muted bg-white",
};

export function Badge({
  variant = "primary",
  className,
  children,
}: {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-md whitespace-nowrap",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusDot({ variant = "neutral" }: { variant?: BadgeVariant }) {
  const dotColors: Record<BadgeVariant, string> = {
    primary: "bg-primary",
    neutral: "bg-neutral-status",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    info: "bg-info",
    outline: "bg-subtle",
  };
  return (
    <span
      className={cn("w-2 h-2 rounded-full shrink-0", dotColors[variant])}
      aria-hidden
    />
  );
}
