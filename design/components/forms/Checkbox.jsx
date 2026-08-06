import React from "react";

export function Checkbox({ checked, onChange, label }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: "var(--font-sans)", fontSize: "var(--fs-body)", color: "var(--text-primary)", cursor: "pointer" }}>
      <span style={{
        width: 22, height: 22, borderRadius: "var(--radius-sm)", flexShrink: 0,
        border: checked ? "none" : "1.5px solid var(--border-strong)",
        background: checked ? "var(--action-secondary-bg)" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all var(--duration-fast) var(--ease-out)",
      }}>
        {checked && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M4 12l6 6L20 6"/></svg>}
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange && onChange(e.target.checked)} style={{ display: "none" }} />
      {label}
    </label>
  );
}
