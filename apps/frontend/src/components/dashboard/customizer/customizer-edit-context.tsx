"use client";

import React, { createContext, useContext } from "react";

export type CustomizerEditContextValue = {
  enabled: boolean;
  selectSection: (sectionId: string) => void;
  patchPath: (sectionId: string, path: string, value: string) => void;
};

const CustomizerEditContext = createContext<CustomizerEditContextValue | null>(null);

export function CustomizerEditProvider({
  value,
  children,
}: {
  value: CustomizerEditContextValue;
  children: React.ReactNode;
}) {
  return <CustomizerEditContext.Provider value={value}>{children}</CustomizerEditContext.Provider>;
}

export function useCustomizerEdit() {
  return useContext(CustomizerEditContext);
}

const SectionIdContext = createContext<string | null>(null);

export function CustomizerSectionFrame({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const ctx = useCustomizerEdit();
  if (!ctx?.enabled) return <>{children}</>;
  return (
    <SectionIdContext.Provider value={id}>
      <div
        className="relative"
        onClickCapture={() => ctx.selectSection(id)}
      >
        {children}
      </div>
    </SectionIdContext.Provider>
  );
}

export function useEditSectionId() {
  return useContext(SectionIdContext);
}

export function setPathValue(data: Record<string, unknown>, path: string, value: string): Record<string, unknown> {
  const parts = path.split(".");
  const root: Record<string, unknown> = { ...data };

  const cloneAt = (current: unknown, index: number): unknown => {
    const key = parts[index];
    const isIndex = /^\d+$/.test(key);
    if (index === parts.length - 1) {
      if (Array.isArray(current)) {
        const next = [...current];
        next[Number(key)] = value;
        return next;
      }
      return { ...(current as Record<string, unknown>), [key]: value };
    }
    const child = Array.isArray(current)
      ? current[Number(key)]
      : (current as Record<string, unknown>)?.[key];
    const updated = cloneAt(child ?? (isIndex ? [] : {}), index + 1);
    if (Array.isArray(current)) {
      const next = [...current];
      next[Number(key)] = updated;
      return next;
    }
    return { ...(current as Record<string, unknown>), [key]: updated };
  };

  return cloneAt(root, 0) as Record<string, unknown>;
}
