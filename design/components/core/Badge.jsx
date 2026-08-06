import React from "react";

const tones = {
  sale: { background: "var(--accent-error)", color: "var(--text-inverse)" },
  info: { background: "var(--accent-info-bg)", color: "var(--accent-info)" },
  success: { background: "color-mix(in oklch, var(--accent-success) 15%, white)", color: "var(--accent-success)" },
  neutral: { background: "var(--ink-100)", color: "var(--text-secondary)" },
};

export function Badge({ children, tone = "neutral" }) {
  const t = tones[tone] || tones.neutral;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 28,
        padding: "0 12px",
        borderRadius: "var(--radius-pill)",
        fontFamily: "var(--font-sans)",
        fontWeight: "var(--fw-semibold)",
        fontSize: "var(--fs-body-sm)",
        ...t,
      }}
    >
      {children}
    </span>
  );
}

export function RatingBadge({ value }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "var(--font-sans)", fontWeight: "var(--fw-semibold)", fontSize: "var(--fs-body-sm)", color: "var(--text-primary)" }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--accent-rating)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01z"/></svg>
      {value}
    </span>
  );
}
