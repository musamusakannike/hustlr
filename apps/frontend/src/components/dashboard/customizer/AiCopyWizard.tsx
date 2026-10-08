"use client";

import React, { useState } from "react";
import { Bot, Loader2, X } from "lucide-react";
import type { Store } from "@/types/store";
import type { StorefrontSection } from "@/types/storefront";
import { aiService } from "@/services/commerce";
import { getErrorMessage } from "@/lib/utils";

type Question = { id: string; prompt: string };

export default function AiCopyWizard({
  store,
  sections,
  onApply,
  onClose,
}: {
  store: Store;
  sections: StorefrontSection[];
  onApply: (next: StorefrontSection[]) => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [description, setDescription] = useState(store.description || "");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const askQuestions = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await aiService.storefrontQuestions({
        storeName: store.name,
        description,
        sectionSummary: sections.map((s) => s.type).join(", "),
      });
      setQuestions(res.questions);
      setAnswers(Object.fromEntries(res.questions.map((q) => [q.id, ""])));
      setStep(2);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const generate = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await aiService.storefrontCopy({
        storeName: store.name,
        description,
        answers,
        sections,
      });
      onApply(res.sections);
      setStep(3);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-lg rounded-2xl bg-bg border border-border shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-text">Write store copy with AI</h2>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-muted hover:bg-bg-soft">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {step === 1 && (
            <>
              <p className="text-xs text-muted leading-relaxed">
                Describe what you sell. We will ask a few short questions, then rewrite the text on your homepage. Images, colors, and layout stay the same.
              </p>
              <textarea
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. We sell handmade Ankara dresses and accessories for women in Lagos, with same-week delivery."
                className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-text placeholder:text-subtle text-sm focus:border-primary focus:outline-none"
              />
              <button
                type="button"
                disabled={busy || description.trim().length < 12}
                onClick={() => void askQuestions()}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold disabled:opacity-50"
              >
                {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Continue
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-xs text-muted">Answer what you can. Blank answers are fine.</p>
              <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto">
                {questions.map((q) => (
                  <div key={q.id}>
                    <label className="text-xs font-semibold text-text block mb-1">{q.prompt}</label>
                    <input
                      type="text"
                      value={answers[q.id] || ""}
                      onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-text placeholder:text-subtle text-xs focus:border-primary focus:outline-none"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl border border-border text-xs font-bold"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void generate()}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold disabled:opacity-50"
                >
                  {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Update all text
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <p className="text-sm text-text">
                Copy is on your preview. Review it, then Save & Publish. Use Undo AI in the toolbar if you want the previous wording.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold"
              >
                Done
              </button>
            </>
          )}

          {error && <p className="text-xs text-danger">{error}</p>}
        </div>
      </div>
    </div>
  );
}
