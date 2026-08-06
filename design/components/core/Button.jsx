import React from "react";

const sizeStyles = {
  lg: { height: 56, padding: "0 28px", fontSize: "var(--fs-body-lg)" },
  md: { height: 48, padding: "0 22px", fontSize: "var(--fs-body)" },
  sm: { height: 40, padding: "0 16px", fontSize: "var(--fs-body-sm)" },
};

const variantStyles = {
  primary: {
    background: "var(--action-primary-bg)",
    color: "var(--action-primary-text)",
    border: "none",
  },
  secondary: {
    background: "var(--action-secondary-bg)",
    color: "var(--action-secondary-text)",
    border: "none",
  },
  ghost: {
    background: "transparent",
    color: "var(--text-primary)",
    border: "1px solid var(--action-ghost-border)",
  },
  danger: {
    background: "var(--accent-error)",
    color: "var(--text-inverse)",
    border: "none",
  },
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  fullWidth = false,
  disabled = false,
  onClick,
  type = "button",
}) {
  const v = variantStyles[variant] || variantStyles.primary;
  const s = sizeStyles[size] || sizeStyles.md;
  const style = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontFamily: "var(--font-sans)",
    fontWeight: "var(--fw-semibold)",
    borderRadius: "var(--radius-pill)",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "transform var(--duration-fast) var(--ease-out), background var(--duration-fast) var(--ease-out), opacity var(--duration-fast)",
    width: fullWidth ? "100%" : undefined,
    ...s,
    ...v,
    ...(disabled
      ? { background: "var(--action-disabled-bg)", color: "var(--action-disabled-text)", border: "none" }
      : {}),
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={style}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = "scale(0.97)"; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      {icon}
      {children}
    </button>
  );
}
