export interface ButtonProps {
  children: React.ReactNode;
  /** Visual style. primary = lime CTA, secondary = dark/black CTA, ghost = outlined, danger = red */
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "lg" | "md" | "sm";
  icon?: React.ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}
