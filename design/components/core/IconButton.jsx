import React from "react";

const sizes = { lg: 48, md: 40, sm: 32 };
const tones = {
  light: { background: "color-mix(in oklch, var(--ink-0) 88%, transparent)", color: "var(--text-primary)" },
  dark: { background: "var(--surface-inverse)", color: "var(--text-inverse)" },
  outline: { background: "transparent", color: "var(--text-primary)", border: "1px solid var(--border-default)" },
};

export function IconButton({ icon, tone = "light", size = "md", onClick, ariaLabel }) {
  const d = sizes[size] || sizes.md;
  const t = tones[tone] || tones.light;
  return (
    <button
      aria-label={ariaLabel}
      onClick={onClick}
      style={{
        width: d,
        height: d,
        borderRadius: "var(--radius-pill)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        border: "none",
        cursor: "pointer",
        transition: "transform var(--duration-fast) var(--ease-out)",
        ...t,
      }}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.92)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {icon}
    </button>
  );
}
