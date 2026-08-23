import Joi from "joi";

export const storeSetupSchema = Joi.object({
  name: Joi.string().min(2).max(80),
  slug: Joi.string().lowercase(),
  description: Joi.string().allow(""),
  logo: Joi.string().allow(""),
  banner: Joi.string().allow(""),
  favicon: Joi.string().allow(""),
  socialLinks: Joi.object({
    facebook: Joi.string().allow(""),
    twitter: Joi.string().allow(""),
    instagram: Joi.string().allow(""),
    whatsappNumber: Joi.string().allow(""),
    tiktok: Joi.string().allow(""),
    youtube: Joi.string().allow(""),
  }),
  colorScheme: Joi.object({
    primary: Joi.string(),
    secondary: Joi.string(),
    accent: Joi.string(),
    background: Joi.string(),
    text: Joi.string(),
  }),
  templateId: Joi.string().hex().length(24),
  currency: Joi.string(),
  currencySymbol: Joi.string(),
  contactEmail: Joi.string().email().allow(""),
  contactPhone: Joi.string().allow(""),
  address: Joi.string().allow(""),
  metaTitle: Joi.string().allow(""),
  metaDescription: Joi.string().allow(""),
  shippingPolicy: Joi.string().allow(""),
  returnPolicy: Joi.string().allow(""),
  termsOfService: Joi.string().allow(""),
  privacyPolicy: Joi.string().allow(""),
  referralEnabled: Joi.boolean(),
  referrerRewardAmount: Joi.number().min(0),
  refereeDiscountPercent: Joi.number().min(0).max(100),
  refereeDiscountMaxAmount: Joi.number().min(0).allow(null),
}).min(1);

export const templateSelectSchema = Joi.object({
  templateId: Joi.string().hex().length(24).required(),
});

export const customDomainSchema = Joi.object({
  domain: Joi.string().required(),
});
