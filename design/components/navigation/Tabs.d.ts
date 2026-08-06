export interface TabItem {
  value: string;
  label: string;
}
export interface TabsProps {
  tabs: TabItem[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
}
