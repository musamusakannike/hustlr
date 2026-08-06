export interface IconButtonProps {
  icon: React.ReactNode;
  tone?: "light" | "dark" | "outline";
  size?: "lg" | "md" | "sm";
  onClick?: () => void;
  ariaLabel: string;
}
