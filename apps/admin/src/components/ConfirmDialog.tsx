"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, HelpCircle, X, Loader2 } from "lucide-react";

export type ConfirmDialogVariant = "default" | "danger" | "success";

export interface ConfirmDialogConfig {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  /** Show a text input/textarea for capturing a reason/note alongside confirmation */
  showInput?: boolean;
  inputLabel?: string;
  inputPlaceholder?: string;
  inputRequired?: boolean;
  /** Render a dropdown of fixed choices instead of a free-text input */
  selectOptions?: Array<{ label: string; value: string }>;
  selectDefaultValue?: string;
  /** Render a single dismiss button instead of cancel/confirm — for error/info alerts */
  alertOnly?: boolean;
  onConfirm: (inputValue?: string) => void;
}

const VARIANT_STYLES: Record<
  ConfirmDialogVariant,
  { iconWrap: string; icon: React.ElementType; confirmBtn: string }
> = {
  default: {
    iconWrap: "bg-primary-bg text-primary",
    icon: HelpCircle,
    confirmBtn: "bg-primary hover:bg-primary-hover text-white",
  },
  danger: {
    iconWrap: "bg-rose-50 text-rose-600",
    icon: AlertTriangle,
    confirmBtn: "bg-rose-600 hover:bg-rose-700 text-white",
  },
  success: {
    iconWrap: "bg-emerald-50 text-emerald-600",
    icon: HelpCircle,
    confirmBtn: "bg-emerald-600 hover:bg-emerald-700 text-white",
  },
};

export interface ConfirmDialogProps {
  config?: ConfirmDialogConfig | null;
  isOpen?: boolean;
  onClose: () => void;
  onConfirm?: (inputValue?: string) => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export default function ConfirmDialog(props: ConfirmDialogProps) {
  // If invoked with the config object pattern
  if (props.config !== undefined) {
    if (!props.config) return null;
    const dialogKey = props.config.title + (props.config.inputLabel || "");
    return <ConfirmDialogInner key={dialogKey} config={props.config} onClose={props.onClose} />;
  }

  // Legacy direct props support
  if (!props.isOpen) return null;

  const legacyConfig: ConfirmDialogConfig = {
    title: props.title || "Confirm Action",
    message: props.description,
    confirmLabel: props.confirmLabel || "Confirm",
    cancelLabel: props.cancelLabel || "Cancel",
    variant: props.isDestructive ? "danger" : "default",
    onConfirm: () => props.onConfirm?.(),
  };

  return <ConfirmDialogInner config={legacyConfig} onClose={props.onClose} isLoading={props.isLoading} />;
}

function ConfirmDialogInner({
  config,
  onClose,
  isLoading = false,
}: {
  config: ConfirmDialogConfig;
  onClose: () => void;
  isLoading?: boolean;
}) {
  const [inputValue, setInputValue] = useState(config.selectDefaultValue || config.selectOptions?.[0]?.value || "");
  const useSelect = Boolean(config.selectOptions);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const variant = VARIANT_STYLES[config.variant || "default"];
  const Icon = variant.icon;
  const canConfirm =
    !config.showInput && !useSelect
      ? true
      : !config.inputRequired || inputValue.trim().length > 0;

  const handleConfirm = () => {
    if (!canConfirm || isLoading) return;
    if (config.showInput || useSelect) {
      config.onConfirm(inputValue.trim() || undefined);
    } else {
      config.onConfirm(undefined);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between px-6 pt-6">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${variant.iconWrap}`}>
            <Icon className="w-5 h-5" />
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors -mt-1 -mr-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 pt-3 pb-6 space-y-3">
          <h3 className="text-base font-bold text-slate-900">{config.title}</h3>
          {config.message && <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{config.message}</p>}

          {(config.showInput || useSelect) && (
            <div className="space-y-1.5 pt-1">
              {config.inputLabel && (
                <label className="text-xs font-semibold text-slate-700">{config.inputLabel}</label>
              )}
              {useSelect ? (
                <select
                  autoFocus
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-primary"
                >
                  {config.selectOptions?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <textarea
                  autoFocus
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={config.inputPlaceholder}
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-gray-400 outline-none focus:border-primary resize-none"
                />
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5 justify-end px-6 pb-6 pt-2 border-t border-gray-100/60">
          {!config.alertOnly && (
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-full border border-gray-200 text-slate-700 font-semibold text-xs hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {config.cancelLabel || "Cancel"}
            </button>
          )}
          <button
            onClick={config.alertOnly ? onClose : handleConfirm}
            disabled={!canConfirm || isLoading}
            className={`px-5 py-2 rounded-full font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${variant.confirmBtn}`}
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{config.confirmLabel || (config.alertOnly ? "OK" : "Confirm")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
