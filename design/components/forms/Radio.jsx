import React from "react";

export function Radio({ checked, onChange, label, name }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: "var(--font-sans)", fontSize: "var(--fs-body)", color: "var(--text-primary)", cursor: "pointer" }}>
      <span style={{
        width: 22, height: 22, borderRadius: "var(--radius-pill)", flexShrink: 0,
        border: checked ? "6px solid var(--variant-selected-bg)" : "1.5px solid var(--border-strong)",
        transition: "all var(--duration-fast) var(--ease-out)",
      }} />
      <input type="radio" name={name} checked={checked} onChange={(e) => onChange && onChange(e.target.checked)} style={{ display: "none" }} />
      {label}
    </label>
  );
}
