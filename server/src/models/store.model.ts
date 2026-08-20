import mongoose, { Document, Schema } from "mongoose";
import { DEFAULT_CURRENCY, DEFAULT_CURRENCY_SYMBOL } from "../config/constants.config";

export interface ISocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  whatsappNumber?: string;
  tiktok?: string;
  youtube?: string;
}

export interface IColorScheme {
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
  text?: string;
}

export interface IStore extends Document {
  sellerId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  favicon?: string;
  socialLinks: ISocialLinks;
  colorScheme: IColorScheme;
  templateId?: mongoose.Types.ObjectId | null;
  currency: string;
  currencySymbol: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  isLive: boolean;
  liveOverride?: boolean | null;
  customDomain?: string | null;
  customDomainVerified: boolean;
  metaTitle?: string;
  metaDescription?: string;
  shippingPolicy?: string;
  returnPolicy?: string;
  termsOfService?: string;
  privacyPolicy?: string;
  referralEnabled: boolean;
  referrerRewardAmount: number;
  refereeDiscountPercent: number;
  refereeDiscountMaxAmount?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

const storeSchema = new Schema<IStore>(
  {
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
    logo: { type: String, default: "" },
    banner: { type: String, default: "" },
    favicon: { type: String, default: "" },
    socialLinks: {
      facebook: { type: String, default: "" },
      twitter: { type: String, default: "" },
      instagram: { type: String, default: "" },
      whatsappNumber: { type: String, default: "" },
      tiktok: { type: String, default: "" },
      youtube: { type: String, default: "" },
    },
    colorScheme: {
      primary: { type: String, default: "#800A1D" },
      secondary: { type: String, default: "#0A0E11" },
      accent: { type: String, default: "#FAD4D8" },
      background: { type: String, default: "#FFFFFF" },
      text: { type: String, default: "#0A0E11" },
    },
    templateId: { type: Schema.Types.ObjectId, ref: "WebsiteTemplate", default: null },
    currency: { type: String, default: DEFAULT_CURRENCY },
    currencySymbol: { type: String, default: DEFAULT_CURRENCY_SYMBOL },
    contactEmail: { type: String, default: "" },
    contactPhone: { type: String, default: "" },
    address: { type: String, default: "" },
    isLive: { type: Boolean, default: false, index: true },
    liveOverride: { type: Boolean, default: null },
    customDomain: { type: String, default: null, lowercase: true, trim: true },
    customDomainVerified: { type: Boolean, default: false },
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    shippingPolicy: { type: String, default: "" },
    returnPolicy: { type: String, default: "" },
    termsOfService: { type: String, default: "" },
    privacyPolicy: { type: String, default: "" },
    referralEnabled: { type: Boolean, default: false },
    referrerRewardAmount: { type: Number, default: 0 },
    refereeDiscountPercent: { type: Number, default: 0 },
    refereeDiscountMaxAmount: { type: Number, default: null },
  },
  { timestamps: true },
);

storeSchema.index({ customDomain: 1 }, { unique: true, sparse: true });

export const Store = mongoose.model<IStore>("Store", storeSchema);
