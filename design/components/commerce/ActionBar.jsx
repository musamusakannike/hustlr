import React from "react";

export function ActionBar({ primaryLabel, secondaryLabel, onPrimary, onSecondary, primaryIcon, secondaryIcon }) {
  return (
    <div style={{
      position: "sticky", bottom: 0, left: 0, right: 0,
      display: "flex", gap: 12, padding: "14px 20px",
      paddingBottom: "calc(14px + env(safe-area-inset-bottom))",
      background: "var(--surface-card)", borderTop: "1px solid var(--border-default)",
      fontFamily: "var(--font-sans)",
    }}>
      {secondaryLabel && (
        <button onClick={onSecondary} style={{
          flex: "0 0 42%", height: 56, borderRadius: "var(--radius-pill)", border: "none",
          background: "var(--action-secondary-bg)", color: "var(--action-secondary-text)",
          fontWeight: "var(--fw-semibold)", fontSize: "var(--fs-body)", display: "flex",
          alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer",
        }}>{secondaryIcon}{secondaryLabel}</button>
      )}
      <button onClick={onPrimary} style={{
        flex: 1, height: 56, borderRadius: "var(--radius-pill)", border: "none",
        background: "var(--action-primary-bg)", color: "var(--action-primary-text)",
        fontWeight: "var(--fw-semibold)", fontSize: "var(--fs-body)", display: "flex",
        alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer",
      }}>{primaryIcon}{primaryLabel}</button>
    </div>
  );
}
