import React, { useState } from "react";

export function Tabs({ tabs, defaultValue, value, onChange }) {
  const [internal, setInternal] = useState(defaultValue || (tabs[0] && tabs[0].value));
  const active = value !== undefined ? value : internal;
  const set = (v) => { setInternal(v); onChange && onChange(v); };
  return (
    <div style={{ display: "flex", gap: 4, background: "var(--surface-sunken)", borderRadius: "var(--radius-pill)", padding: 4, fontFamily: "var(--font-sans)" }}>
      {tabs.map((t) => (
        <button key={t.value} onClick={() => set(t.value)} style={{
          flex: 1, height: 40, border: "none", cursor: "pointer",
          borderRadius: "var(--radius-pill)", fontSize: "var(--fs-body-sm)", fontWeight: "var(--fw-semibold)",
          background: active === t.value ? "var(--surface-card)" : "transparent",
          color: active === t.value ? "var(--text-primary)" : "var(--text-tertiary)",
          boxShadow: active === t.value ? "var(--shadow-xs)" : "none",
          transition: "all var(--duration-fast) var(--ease-out)",
        }}>{t.label}</button>
      ))}
    </div>
  );
}
