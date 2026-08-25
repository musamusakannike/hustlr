export const HEADER_VARIANTS = ["classic", "topbar", "centered", "market", "left-nav"] as const;
export const FOOTER_VARIANTS = ["simple", "columns", "dark"] as const;
export const SHOP_LAYOUTS = ["grid-2", "grid-3", "grid-4", "list", "boxed-sidebar"] as const;
export const PRODUCT_LAYOUTS = ["gallery", "centered", "sticky", "extended"] as const;
export const PRODUCT_CARD_VARIANTS = ["minimal", "overlay", "boxed"] as const;

export type HeaderVariant = (typeof HEADER_VARIANTS)[number];
export type FooterVariant = (typeof FOOTER_VARIANTS)[number];
export type ShopLayout = (typeof SHOP_LAYOUTS)[number];
export type ProductLayout = (typeof PRODUCT_LAYOUTS)[number];
export type ProductCardVariant = (typeof PRODUCT_CARD_VARIANTS)[number];

export interface StoreThemeSettings {
  headerVariant?: HeaderVariant;
  footerVariant?: FooterVariant;
  shopLayout?: ShopLayout;
  productLayout?: ProductLayout;
  productCardVariant?: ProductCardVariant;
  cardRadius?: string;
  buttonRadius?: string;
  palettePreset?: string;
  heroLayout?: "split" | "centered" | "editorial";
  showCategoryPills?: boolean;
}

export const DEFAULT_THEME_SETTINGS: Required<
  Pick<
    StoreThemeSettings,
    | "headerVariant"
    | "footerVariant"
    | "shopLayout"
    | "productLayout"
    | "productCardVariant"
    | "cardRadius"
    | "buttonRadius"
  >
> = {
  headerVariant: "classic",
  footerVariant: "simple",
  shopLayout: "grid-3",
  productLayout: "gallery",
  productCardVariant: "minimal",
  cardRadius: "16px",
  buttonRadius: "9999px",
};

export function resolveTheme(settings?: StoreThemeSettings | null): typeof DEFAULT_THEME_SETTINGS & StoreThemeSettings {
  return {
    ...DEFAULT_THEME_SETTINGS,
    ...(settings || {}),
    headerVariant: HEADER_VARIANTS.includes(settings?.headerVariant as HeaderVariant)
      ? (settings!.headerVariant as HeaderVariant)
      : DEFAULT_THEME_SETTINGS.headerVariant,
    footerVariant: FOOTER_VARIANTS.includes(settings?.footerVariant as FooterVariant)
      ? (settings!.footerVariant as FooterVariant)
      : DEFAULT_THEME_SETTINGS.footerVariant,
    shopLayout: SHOP_LAYOUTS.includes(settings?.shopLayout as ShopLayout)
      ? (settings!.shopLayout as ShopLayout)
      : DEFAULT_THEME_SETTINGS.shopLayout,
    productLayout: PRODUCT_LAYOUTS.includes(settings?.productLayout as ProductLayout)
      ? (settings!.productLayout as ProductLayout)
      : DEFAULT_THEME_SETTINGS.productLayout,
    productCardVariant: PRODUCT_CARD_VARIANTS.includes(settings?.productCardVariant as ProductCardVariant)
      ? (settings!.productCardVariant as ProductCardVariant)
      : DEFAULT_THEME_SETTINGS.productCardVariant,
  };
}

export const HEADER_VARIANT_OPTIONS: { id: HeaderVariant; name: string; description: string }[] = [
  { id: "classic", name: "Classic", description: "Logo left, links center, actions right" },
  { id: "topbar", name: "Top bar", description: "Utility bar with phone and links above the nav" },
  { id: "centered", name: "Centered", description: "Logo centered over a full-width link row" },
  { id: "market", name: "Market", description: "Search-first header with a category bar" },
  { id: "left-nav", name: "Left navigation", description: "Vertical category rail beside the page" },
];

export const FOOTER_VARIANT_OPTIONS: { id: FooterVariant; name: string; description: string }[] = [
  { id: "simple", name: "Simple", description: "Compact brand row and policy links" },
  { id: "columns", name: "Columns", description: "Multi-column footer with shop links" },
  { id: "dark", name: "Dark", description: "High-contrast footer using secondary color" },
];

export const SHOP_LAYOUT_OPTIONS: { id: ShopLayout; name: string; description: string }[] = [
  { id: "grid-2", name: "2 columns", description: "Large product tiles" },
  { id: "grid-3", name: "3 columns", description: "Balanced catalog grid" },
  { id: "grid-4", name: "4 columns", description: "Dense marketplace grid" },
  { id: "list", name: "List", description: "Horizontal rows with more product copy" },
  { id: "boxed-sidebar", name: "Boxed + sidebar", description: "Filter sidebar with a 3-column grid" },
];

export const PRODUCT_LAYOUT_OPTIONS: { id: ProductLayout; name: string; description: string }[] = [
  { id: "gallery", name: "Gallery", description: "Image column with thumbnails" },
  { id: "centered", name: "Centered", description: "Stacked gallery and buy box" },
  { id: "sticky", name: "Sticky buy box", description: "Gallery left, purchase panel sticks while scrolling" },
  { id: "extended", name: "Extended", description: "Wide gallery with details below" },
];

export const CARD_VARIANT_OPTIONS: { id: ProductCardVariant; name: string; description: string }[] = [
  { id: "minimal", name: "Minimal", description: "Clean image, title, and price" },
  { id: "overlay", name: "Overlay", description: "Action overlay on hover" },
  { id: "boxed", name: "Boxed", description: "Strong border and padded tile" },
];
