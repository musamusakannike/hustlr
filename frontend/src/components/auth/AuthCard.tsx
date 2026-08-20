import React from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export default function AuthCard({
  title,
  subtitle,
  children,
  footer,
  className,
}: {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("p-6 sm:p-8 shadow-lg", className)}>
      <div className="mb-6">
        <h1 className="font-bold text-2xl text-text tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted mt-1.5 leading-relaxed">{subtitle}</p>
        )}
      </div>
      {children}
      {footer && (
        <div className="mt-6 pt-5 border-t border-border text-sm text-muted text-center">
          {footer}
        </div>
      )}
    </Card>
  );
}
