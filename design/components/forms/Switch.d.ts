export interface SwitchProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  label?: React.ReactNode;
}
