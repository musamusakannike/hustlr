export const colors = {
  // Brand
  primary: "#800A1D",
  primaryLight: "#FAD4D8",
  primaryDark: "#660817",
  primaryBg: "#FFF5F6",

  // Surfaces & text
  background: "#FFFFFF",
  heading: "#0A0E11",
  text: "#191A19",

  // Neutrals
  border: "#E5E7EB",
  divider: "#F0F0F0",
  muted: "#667085",
  disabled: "#D1D5DB",
  bgSoft: "#F9FAFB",

  // Semantic status
  success: "#22C55E",
  error: "#EF4444",
  warning: "#F59E0B",
  info: "#3B82F6",
} as const;

export type Colors = typeof colors;
export type ColorName = keyof Colors;
