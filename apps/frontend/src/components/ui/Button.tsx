"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant =
  | "primary"
  | "dark"
  | "outline"
  | "ghost"
  | "danger"
  | "light";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary hover:bg-primary-hover text-white shadow-sm hover:shadow-md",
  dark: "bg-dark hover:bg-dark-secondary text-white shadow-sm",
  outline:
    "bg-light text-text border border-black/10 hover:bg-black/5 shadow-xs",
  ghost: "bg-transparent text-text hover:bg-black/5",
  danger: "bg-danger hover:bg-red-800 text-white shadow-sm",
  light:
    "bg-neutral-100 hover:bg-neutral-200 text-text",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm rounded-lg gap-1.5",
  md: "px-5 py-2.5 text-sm sm:text-base rounded-xl gap-2",
  lg: "px-7 py-3.5 text-base sm:text-lg rounded-xl gap-2.5",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-all duration-200 cursor-pointer",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1",
        "disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
