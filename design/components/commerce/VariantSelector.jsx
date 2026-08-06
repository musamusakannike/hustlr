import React from "react";

export function VariantSelector({ options, value, onChange, name }) {
  return (
    <div role="radiogroup" aria-label={name} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      {options.map((opt) => {
        const selected = opt.value === value;
        const disabled = opt.disabled;
        let style = {
          minWidth: 48,
          height: 44,
          padding: "0 16px",
          borderRadius: "var(--radius-pill)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-sans)",
          fontWeight: "var(--fw-semibold)",
          fontSize: "var(--fs-body)",
          cursor: disabled ? "not-allowed" : "pointer",
          border: "1px solid var(--variant-available-border)",
          background: "var(--surface-card)",
          color: "var(--variant-available-text)",
          transition: "all var(--duration-fast) var(--ease-out)",
        };
        if (selected) {
          style = { ...style, background: "var(--variant-selected-bg)", color: "var(--variant-selected-text)", border: "1px solid var(--variant-selected-bg)" };
        }
        if (disabled) {
          style = {
            ...style,
            background: "var(--variant-oos-bg)",
            color: "var(--variant-oos-text)",
            border: "1px solid var(--variant-oos-border)",
            textDecoration: "line-through",
          };
        }
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => !disabled && onChange && onChange(opt.value)}
            style={style}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function ColorSwatchSelector({ options, value, onChange, name }) {
  return (
    <div role="radiogroup" aria-label={name} style={{ display: "flex", gap: 12 }}>
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            aria-label={opt.label}
            aria-checked={selected}
            onClick={() => onChange && onChange(opt.value)}
            style={{
              width: 36,
              height: 36,
              borderRadius: "var(--radius-pill)",
              border: selected ? "2px solid var(--variant-selected-bg)" : "1px solid var(--border-default)",
              padding: 3,
              background: "var(--surface-card)",
              cursor: "pointer",
            }}
          >
            <span style={{ display: "block", width: "100%", height: "100%", borderRadius: "var(--radius-pill)", background: opt.color }} />
          </button>
        );
      })}
    </div>
  );
}
