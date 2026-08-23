"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full px-4 py-3 rounded-xl border bg-white text-sm text-text placeholder:text-subtle",
            "focus:outline-none transition-colors",
            error
              ? "border-danger focus:border-danger"
              : "border-border focus:border-primary",
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-neutral-400 mt-1">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-danger font-medium mt-1">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: React.ReactNode;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "w-full px-4 py-3 rounded-xl border bg-white text-sm text-text placeholder:text-subtle min-h-28 resize-y",
            "focus:outline-none transition-colors",
            error
              ? "border-danger focus:border-danger"
              : "border-border focus:border-primary",
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-neutral-400 mt-1">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-danger font-medium mt-1">{error}</p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: React.ReactNode;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, error, hint, className, id, options, placeholder, ...props },
    ref
  ) => {
    const inputId = id ?? props.name;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            "w-full px-4 py-3 rounded-xl border bg-white text-sm text-text appearance-none cursor-pointer",
            "focus:outline-none transition-colors",
            error
              ? "border-danger focus:border-danger"
              : "border-border focus:border-primary",
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {hint && !error && (
          <p className="text-xs text-neutral-400 mt-1">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-danger font-medium mt-1">{error}</p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";
