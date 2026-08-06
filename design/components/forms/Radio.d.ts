export interface RadioProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  label: React.ReactNode;
  name: string;
}
