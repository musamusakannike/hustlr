"use client";

import React, { useState } from "react";
import { Ban, Loader2, X } from "lucide-react";

interface BanUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  userName: string;
  isLoading?: boolean;
}

export default function BanUserDialog({
  isOpen,
  onClose,
  onConfirm,
  userName,
  isLoading = false,
}: BanUserDialogProps) {
  const [reason, setReason] = useState("");

  const handleClose = () => {
    setReason("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={handleClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-red-50 text-red-600">
            <Ban className="w-6 h-6" />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900">Ban user</h3>
            <p className="mt-1 text-sm text-gray-500">
              This will suspend{" "}
              <span className="font-semibold text-slate-700">{userName}</span>,
              take their store offline immediately, and notify them by email.
            </p>
          </div>
        </div>

        <label className="block mt-5 text-xs font-bold uppercase tracking-wider text-gray-500">
          Reason
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="e.g. Repeated policy violations on product listings"
          className="mt-2 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary resize-none"
        />

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-full text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason.trim())}
            disabled={isLoading || reason.trim().length === 0}
            title={reason.trim().length === 0 ? "A reason is required" : undefined}
            className="px-6 py-2.5 rounded-full text-sm font-bold text-white transition-all shadow-sm bg-red-600 hover:bg-red-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Ban User</span>
          </button>
        </div>
      </div>
    </div>
  );
}
