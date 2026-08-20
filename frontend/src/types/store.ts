export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  whatsappNumber?: string;
  tiktok?: string;
  youtube?: string;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface Store {
  id: string;
  sellerId: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  banner: string;
  favicon: string;
  socialLinks: SocialLinks;
  colorScheme: ColorScheme;
  templateId: string | null;
  currency: string;
  currencySymbol: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  isLive: boolean;
  customDomain: string | null;
  customDomainVerified: boolean;
  metaTitle: string;
  metaDescription: string;
  shippingPolicy: string;
  returnPolicy: string;
  termsOfService: string;
  privacyPolicy: string;
  createdAt: string;
  updatedAt: string;
}

/** Partial update payload — mirrors PUT /store/setup (save-progress wizard). */
export type StoreSetupInput = Partial<
  Pick<
    Store,
    | "name"
    | "slug"
    | "description"
    | "logo"
    | "banner"
    | "favicon"
    | "socialLinks"
    | "colorScheme"
    | "contactEmail"
    | "contactPhone"
    | "address"
    | "metaTitle"
    | "metaDescription"
    | "shippingPolicy"
    | "returnPolicy"
    | "termsOfService"
    | "privacyPolicy"
  >
>;

export interface SlugCheckResult {
  slug: string;
  available: boolean;
  suggestion?: string;
}

export interface UploadResult {
  url: string;
}
