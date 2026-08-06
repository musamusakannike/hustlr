/**
 * @startingPoint section="Components" subtitle="Size chips with selected / available / out-of-stock states" viewport="700x140"
 */
export interface VariantOption {
  value: string;
  label: string;
  disabled?: boolean;
}
export interface VariantSelectorProps {
  options: VariantOption[];
  value: string;
  onChange?: (value: string) => void;
  name: string;
}
export interface ColorOption {
  value: string;
  label: string;
  color: string;
}
export interface ColorSwatchSelectorProps {
  options: ColorOption[];
  value: string;
  onChange?: (value: string) => void;
  name: string;
}
