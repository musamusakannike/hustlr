import React from "react";

export function Switch({ checked, onChange, label }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", justifyContent: "space-between", gap: 12, fontFamily: "var(--font-sans)", fontSize: "var(--fs-body)", color: "var(--text-primary)", cursor: "pointer" }}>
      {label}
      <span onClick={() => onChange && onChange(!checked)} style={{
        width: 44, height: 26, borderRadius: "var(--radius-pill)", padding: 3,
        background: checked ? "var(--action-primary-bg)" : "var(--ink-200)",
        transition: "background var(--duration-fast) var(--ease-out)", display: "inline-flex", alignItems: "center",
      }}>
        <span style={{
          width: 20, height: 20, borderRadius: "var(--radius-pill)", background: "var(--ink-0)",
          boxShadow: "var(--shadow-xs)", transform: checked ? "translateX(18px)" : "translateX(0)",
          transition: "transform var(--duration-fast) var(--ease-out)",
        }} />
      </span>
    </label>
  );
}
