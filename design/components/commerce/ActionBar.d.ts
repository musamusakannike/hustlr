export interface ActionBarProps {
  primaryLabel: string;
  secondaryLabel?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
  primaryIcon?: React.ReactNode;
  secondaryIcon?: React.ReactNode;
}
