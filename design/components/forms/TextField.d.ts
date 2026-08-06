export interface TextFieldProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange?: (value: string) => void;
  prefix?: React.ReactNode;
  error?: string;
  type?: "text" | "tel" | "email";
  helperText?: string;
}
/**
 * @startingPoint section="Components" subtitle="Phone input pre-formatted for Nigerian numbers (+234)" viewport="700x120"
 */
export interface PhoneFieldProps {
  value: string;
  onChange?: (value: string) => void;
  error?: string;
}
export interface SelectOption {
  value: string;
  label: string;
}
export interface SelectProps {
  label?: string;
  value: string;
  onChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
}
