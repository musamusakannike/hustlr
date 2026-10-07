"use client";

import React, { useEffect, useRef } from "react";
import { useCustomizerEdit, useEditSectionId } from "./customizer-edit-context";

type TagName = "h1" | "h2" | "h3" | "p" | "span";

export default function EditableText({
  path,
  value,
  as: Tag = "span",
  className,
  style,
  multiline = false,
}: {
  path: string;
  value?: string;
  as?: TagName;
  className?: string;
  style?: React.CSSProperties;
  multiline?: boolean;
}) {
  const ctx = useCustomizerEdit();
  const sectionId = useEditSectionId();
  const ref = useRef<HTMLElement>(null);
  const text = value ?? "";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (document.activeElement === el) return;
    if (el.textContent !== text) el.textContent = text;
  }, [text]);

  if (!ctx?.enabled || !sectionId) {
    return (
      <Tag className={className} style={style}>
        {text}
      </Tag>
    );
  }

  return (
    <Tag
      ref={ref as never}
      className={`${className ?? ""} outline-none rounded-sm cursor-text hover:ring-2 hover:ring-primary/25 focus:ring-2 focus:ring-primary/40`}
      style={style}
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => {
        const next = (e.currentTarget.textContent || "").replace(/\n+/g, multiline ? "\n" : " ").trim();
        if (next !== text) ctx.patchPath(sectionId, path, next);
      }}
      onKeyDown={(e) => {
        if (!multiline && e.key === "Enter") {
          e.preventDefault();
          (e.currentTarget as HTMLElement).blur();
        }
      }}
    >
      {text}
    </Tag>
  );
}
