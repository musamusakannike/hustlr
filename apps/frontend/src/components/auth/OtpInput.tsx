"use client";

import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export default function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  hasError = false,
}: {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  hasError?: boolean;
}) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [focusIndex, setFocusIndex] = useState(0);

  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    if (!digit) return;
    const next = value.split("");
    next[index] = digit;
    const joined = next.join("").replace(/\s/g, "").slice(0, length);
    onChange(joined);
    const nextIndex = Math.min(index + 1, length - 1);
    inputsRef.current[nextIndex]?.focus();
    setFocusIndex(nextIndex);
    if (joined.length === length && !joined.includes(" ")) {
      onComplete?.(joined);
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = value.split("");
      if (next[index]) {
        next[index] = "";
        onChange(next.join(""));
      } else if (index > 0) {
        next[index - 1] = "";
        onChange(next.join(""));
        inputsRef.current[index - 1]?.focus();
        setFocusIndex(index - 1);
      }
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
      setFocusIndex(index - 1);
    }
    if (e.key === "ArrowRight" && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
      setFocusIndex(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    const focusTarget = Math.min(pasted.length, length - 1);
    inputsRef.current[focusTarget]?.focus();
    setFocusIndex(focusTarget);
    if (pasted.length === length) onComplete?.(pasted);
  };

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => setFocusIndex(index)}
          aria-label={`Digit ${index + 1}`}
          className={cn(
            "w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-bold rounded-xl border bg-white text-text",
            "focus:outline-none transition-all",
            hasError
              ? "border-danger"
              : focusIndex === index
                ? "border-primary shadow-xs"
                : digit
                  ? "border-text/30"
                  : "border-border"
          )}
        />
      ))}
    </div>
  );
}
