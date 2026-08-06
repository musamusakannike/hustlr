import React, { useState, useRef } from "react";

export function ProductCarousel({ images, badge }) {
  const [index, setIndex] = useState(0);
  const startX = useRef(null);
  const total = images.length;
  const go = (dir) => setIndex((i) => (i + dir + total) % total);
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "1", background: "var(--surface-sunken)", borderRadius: "var(--radius-lg)", overflow: "hidden", touchAction: "pan-y" }}
      onTouchStart={(e) => (startX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (startX.current == null) return;
        const dx = e.changedTouches[0].clientX - startX.current;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        startX.current = null;
      }}
    >
      <img src={images[index]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} draggable={false} />
      {badge && (
        <span style={{ position: "absolute", top: 14, left: 14, background: "var(--accent-error)", color: "var(--text-inverse)", fontSize: "var(--fs-caption)", fontWeight: "var(--fw-semibold)", padding: "6px 14px", borderRadius: "var(--radius-pill)" }}>{badge}</span>
      )}
      <div style={{
        position: "absolute", left: "50%", bottom: 44, transform: "translateX(-50%)",
        display: "flex", alignItems: "center", gap: 14, background: "var(--surface-card)",
        borderRadius: "var(--radius-pill)", padding: "8px 14px", boxShadow: "var(--shadow-md)",
      }}>
        <button aria-label="rotate left" onClick={() => go(-1)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 16, color: "var(--text-primary)" }}>&lsaquo;</button>
        <span style={{ fontSize: "var(--fs-caption)", color: "var(--text-tertiary)", fontWeight: "var(--fw-medium)" }}>360°</span>
        <button aria-label="rotate right" onClick={() => go(1)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 16, color: "var(--text-primary)" }}>&rsaquo;</button>
      </div>
      <div style={{ position: "absolute", left: "50%", bottom: 16, transform: "translateX(-50%)", display: "flex", gap: 6 }}>
        {images.map((_, i) => (
          <span key={i} style={{ width: 6, height: 6, borderRadius: "var(--radius-pill)", background: i === index ? "var(--ink-900)" : "var(--ink-300)" }} />
        ))}
      </div>
    </div>
  );
}
