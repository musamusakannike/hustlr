import React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  dark = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { dark?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-3xl p-6 sm:p-7 transition-all duration-300",
        dark
          ? "bg-dark text-white shadow-xl border border-primary/40"
          : "bg-white text-text shadow-xs border border-border",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-3 mb-5",
        className
      )}
    >
      <div>
        <h3 className="text-lg sm:text-xl font-bold tracking-tight">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted mt-1">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
  center = true,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  center?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col max-w-3xl",
        center && "items-center text-center mx-auto",
        className
      )}
    >
      {eyebrow && (
        <span className="inline-block text-xs font-bold text-primary uppercase tracking-widest bg-primary-light px-3.5 py-1 rounded-md mb-3">
          {eyebrow}
        </span>
      )}
      <h2 className="text-text text-3xl sm:text-4xl lg:text-[42px] font-bold leading-[1.2] tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="text-muted text-base sm:text-lg leading-relaxed mt-3">
          {description}
        </p>
      )}
    </div>
  );
}
