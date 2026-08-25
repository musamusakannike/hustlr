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

export interface StoreColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface StoreThemeSettings {
  headerVariant: HeaderVariant;
  footerVariant: FooterVariant;
  shopLayout: ShopLayout;
  productLayout: ProductLayout;
  productCardVariant: ProductCardVariant;
  cardRadius: string;
  buttonRadius: string;
  palettePreset?: string;
}

export const DEFAULT_COLOR_SCHEME: StoreColorScheme = {
  primary: "#800A1D",
  secondary: "#0A0E11",
  accent: "#FAD4D8",
  background: "#FFFFFF",
  text: "#0A0E11",
};

export const DEFAULT_THEME_SETTINGS: StoreThemeSettings = {
  headerVariant: "classic",
  footerVariant: "simple",
  shopLayout: "grid-3",
  productLayout: "gallery",
  productCardVariant: "minimal",
  cardRadius: "16px",
  buttonRadius: "9999px",
};

export function normalizeColorScheme(input?: Partial<StoreColorScheme> | null): StoreColorScheme {
  return {
    primary: input?.primary || DEFAULT_COLOR_SCHEME.primary,
    secondary: input?.secondary || DEFAULT_COLOR_SCHEME.secondary,
    accent: input?.accent || DEFAULT_COLOR_SCHEME.accent,
    background: input?.background || DEFAULT_COLOR_SCHEME.background,
    text: input?.text || DEFAULT_COLOR_SCHEME.text,
  };
}

export function normalizeThemeSettings(input?: Partial<StoreThemeSettings> | Record<string, unknown> | null): StoreThemeSettings {
  const raw = (input || {}) as Partial<StoreThemeSettings>;
  return {
    headerVariant: HEADER_VARIANTS.includes(raw.headerVariant as HeaderVariant)
      ? (raw.headerVariant as HeaderVariant)
      : DEFAULT_THEME_SETTINGS.headerVariant,
    footerVariant: FOOTER_VARIANTS.includes(raw.footerVariant as FooterVariant)
      ? (raw.footerVariant as FooterVariant)
      : DEFAULT_THEME_SETTINGS.footerVariant,
    shopLayout: SHOP_LAYOUTS.includes(raw.shopLayout as ShopLayout)
      ? (raw.shopLayout as ShopLayout)
      : DEFAULT_THEME_SETTINGS.shopLayout,
    productLayout: PRODUCT_LAYOUTS.includes(raw.productLayout as ProductLayout)
      ? (raw.productLayout as ProductLayout)
      : DEFAULT_THEME_SETTINGS.productLayout,
    productCardVariant: PRODUCT_CARD_VARIANTS.includes(raw.productCardVariant as ProductCardVariant)
      ? (raw.productCardVariant as ProductCardVariant)
      : DEFAULT_THEME_SETTINGS.productCardVariant,
    cardRadius: typeof raw.cardRadius === "string" && raw.cardRadius ? raw.cardRadius : DEFAULT_THEME_SETTINGS.cardRadius,
    buttonRadius:
      typeof raw.buttonRadius === "string" && raw.buttonRadius ? raw.buttonRadius : DEFAULT_THEME_SETTINGS.buttonRadius,
    palettePreset: raw.palettePreset,
  };
}

export function colorVariablesFromScheme(scheme: StoreColorScheme) {
  return [
    { variableName: "--primary-color", defaultValue: scheme.primary, label: "Primary Color" },
    { variableName: "--secondary-color", defaultValue: scheme.secondary, label: "Secondary Color" },
    { variableName: "--accent-color", defaultValue: scheme.accent, label: "Accent Color" },
    { variableName: "--background-color", defaultValue: scheme.background, label: "Background" },
    { variableName: "--text-color", defaultValue: scheme.text, label: "Text Color" },
  ];
}

export function layoutSectionsFromDefaults(sections: Array<Record<string, unknown>>) {
  return sections.map((s, index) => ({
    sectionId: String(s.id || s.type || `section-${index}`),
    sectionName: String(s.name || s.type || `Section ${index + 1}`),
    isRequired: Boolean(s.type === "hero" || s.type === "hero-slider" || s.type === "featured-products"),
  }));
}

export function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value ?? null)) as T;
}
