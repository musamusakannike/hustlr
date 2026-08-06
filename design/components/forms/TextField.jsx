import React from "react";

export function TextField({ label, placeholder, value, onChange, prefix, error, type = "text", helperText }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, fontFamily: "var(--font-sans)" }}>
      {label && <span style={{ fontSize: "var(--fs-body-sm)", fontWeight: "var(--fw-medium)", color: "var(--text-secondary)" }}>{label}</span>}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, height: 52, padding: "0 16px",
        borderRadius: "var(--radius-md)", background: "var(--surface-sunken)",
        border: error ? "1px solid var(--accent-error)" : "1px solid transparent",
      }}>
        {prefix && <span style={{ color: "var(--text-tertiary)", fontSize: "var(--fs-body)" }}>{prefix}</span>}
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange && onChange(e.target.value)}
          style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: "var(--fs-body)", color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}
        />
      </div>
      {error ? (
        <span style={{ fontSize: "var(--fs-caption)", color: "var(--accent-error)" }}>{error}</span>
      ) : helperText ? (
        <span style={{ fontSize: "var(--fs-caption)", color: "var(--text-tertiary)" }}>{helperText}</span>
      ) : null}
    </label>
  );
}

export function PhoneField({ value, onChange, error }) {
  return (
    <TextField
      label="Phone number"
      prefix="+234"
      placeholder="801 234 5678"
      value={value}
      onChange={onChange}
      error={error}
      helperText={!error ? "We'll text delivery updates to this number" : undefined}
      type="tel"
    />
  );
}

export function Select({ label, value, onChange, options, placeholder }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, fontFamily: "var(--font-sans)" }}>
      {label && <span style={{ fontSize: "var(--fs-body-sm)", fontWeight: "var(--fw-medium)", color: "var(--text-secondary)" }}>{label}</span>}
      <div style={{ position: "relative", height: 52, borderRadius: "var(--radius-md)", background: "var(--surface-sunken)" }}>
        <select
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          style={{
            width: "100%", height: "100%", border: "none", background: "transparent", outline: "none",
            padding: "0 16px", fontSize: "var(--fs-body)", color: value ? "var(--text-primary)" : "var(--text-tertiary)",
            fontFamily: "var(--font-sans)", appearance: "none",
          }}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
        </select>
        <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-tertiary)" }}>▾</span>
      </div>
    </label>
  );
}
