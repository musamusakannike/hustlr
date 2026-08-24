import React from "react";
import { PackageOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center gap-3 py-14 px-6",
        className
      )}
    >
      <div className="w-14 h-14 rounded-full bg-primary-light/60 text-primary flex items-center justify-center">
        {icon ?? <PackageOpen className="w-6 h-6" />}
      </div>
      <h4 className="text-lg font-bold text-text tracking-tight">{title}</h4>
      {description && (
        <p className="text-sm text-muted max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
