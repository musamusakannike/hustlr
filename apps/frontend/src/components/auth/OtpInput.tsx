"use client";

import React, { useRef, useEffect } from "react";

interface OtpInputProps {
  value: string[];
  onChange: (otp: string[]) => void;
  length?: number;
  disabled?: boolean;
}

export default function OtpInput({
  value,
  onChange,
  length = 6,
  disabled = false,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input automatically on mount
    if (inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus();
    }
  }, [disabled]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const rawVal = e.target.value;
    const digit = rawVal.replace(/\D/g, "").slice(-1); // Take last digit if multiple

    const newOtp = [...value];
    newOtp[index] = digit;
    onChange(newOtp);

    // Auto-focus next field
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace") {
      if (!value[index] && index > 0) {
        // Current is empty, focus and clear previous
        const newOtp = [...value];
        newOtp[index - 1] = "";
        onChange(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...value];
        newOtp[index] = "";
        onChange(newOtp);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);

    if (!pasteData) return;

    const newOtp = Array(length).fill("");
    for (let i = 0; i < pasteData.length; i++) {
      newOtp[i] = pasteData[i];
    }
    onChange(newOtp);

    // Focus last filled box or next empty box
    const nextIndex = Math.min(pasteData.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3 w-full">
      {Array.from({ length }).map((_, index) => {
        const isFilled = Boolean(value[index]);
        return (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={value[index] || ""}
            disabled={disabled}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            className={`w-11 sm:w-13 h-13 sm:h-14 text-center text-xl sm:text-2xl font-bold font-space-grotesk rounded-xl sm:rounded-2xl border transition-all duration-150 outline-none select-none ${
              isFilled
                ? "border-primary bg-primary/5 text-[#0A0E11] shadow-xs"
                : "border-neutral-200 bg-white text-neutral-800 focus:border-primary focus:ring-2 focus:ring-primary/15"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            autoComplete="one-time-code"
          />
        );
      })}
    </div>
  );
}
