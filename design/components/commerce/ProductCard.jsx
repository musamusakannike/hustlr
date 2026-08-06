import React from "react";

export function ProductCard({ image, brand, title, price, comparePrice, discountPct, rating }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, fontFamily: "var(--font-sans)" }}>
      <div style={{ position: "relative", aspectRatio: "1", borderRadius: "var(--radius-lg)", background: "var(--surface-sunken)", overflow: "hidden" }}>
        {image && <img src={image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
        {discountPct && (
          <span style={{ position: "absolute", top: 10, left: 10, background: "var(--accent-error)", color: "var(--text-inverse)", fontSize: "var(--fs-caption)", fontWeight: "var(--fw-semibold)", padding: "4px 10px", borderRadius: "var(--radius-pill)" }}>
            -{discountPct}%
          </span>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {brand && <span style={{ fontSize: "var(--fs-caption)", color: "var(--text-tertiary)" }}>{brand}</span>}
        <span style={{ fontSize: "var(--fs-body)", fontWeight: "var(--fw-medium)", color: "var(--text-primary)" }}>{title}</span>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 2 }}>
          <span style={{ fontSize: "var(--fs-body)", fontWeight: "var(--fw-bold)" }}>{price}</span>
          {comparePrice && <span style={{ fontSize: "var(--fs-caption)", color: "var(--text-tertiary)", textDecoration: "line-through" }}>{comparePrice}</span>}
        </div>
      </div>
    </div>
  );
}
