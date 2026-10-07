"use client";

import React, { useRef } from "react";
import { Upload } from "lucide-react";
import { useUploadAsset } from "@/hooks/useStore";
import { useCustomizerEdit, useEditSectionId } from "./customizer-edit-context";

export default function EditableImage({
  path,
  src,
  alt,
  className,
  imgClassName,
  fill = false,
}: {
  path: string;
  src?: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  fill?: boolean;
}) {
  const ctx = useCustomizerEdit();
  const sectionId = useEditSectionId();
  const upload = useUploadAsset();
  const inputRef = useRef<HTMLInputElement>(null);
  const editing = Boolean(ctx?.enabled && sectionId);

  const onFile = async (file: File) => {
    if (!ctx || !sectionId) return;
    const res = await upload.mutateAsync({ kind: "store-banner", file });
    ctx.patchPath(sectionId, path, res.url);
  };

  return (
    <div className={`relative ${className ?? ""} ${fill ? "w-full h-full" : ""}`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className={imgClassName ?? "w-full h-full object-cover"} />
      ) : (
        <div className={`${imgClassName ?? "w-full h-full"} bg-bg-soft`} />
      )}
      {editing && (
        <>
          <button
            type="button"
            className="absolute inset-0 z-10 flex items-center justify-center bg-black/0 hover:bg-black/35 transition-colors group"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              inputRef.current?.click();
            }}
          >
            <span className="hidden group-hover:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-text text-xs font-bold shadow-sm">
              <Upload className="w-3.5 h-3.5" />
              {upload.isPending ? "Uploading..." : "Replace image"}
            </span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onFile(file);
              e.currentTarget.value = "";
            }}
          />
        </>
      )}
    </div>
  );
}
