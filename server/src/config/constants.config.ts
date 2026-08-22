export const APP_NAME = "Hustlr";
export const APP_SLUG = APP_NAME.toLowerCase();
export const APP_DOMAIN = "hustlr.shop";
export const APP_URL = `https://${APP_DOMAIN}`;
export const SUPPORT_EMAIL = `support@${APP_DOMAIN}`;
export const APP_TAGLINE =
  "Empowering African merchants and creators to build branded online stores.";

export const BRAND = {
  name: APP_NAME,
  slug: APP_SLUG,
  domain: APP_DOMAIN,
  url: APP_URL,
  supportEmail: SUPPORT_EMAIL,
  primaryColor: "#800A1D",
  primaryHover: "#660817",
  primaryLight: "#FAD4D8",
  textColor: "#0A0E11",
  background: "#FFFFFF",
  backgroundSoft: "#EFEFEF",
} as const;

export const SELLER_SESSION_COOKIE = `${APP_SLUG}_session`;
export const BUYER_SESSION_COOKIE = `${APP_SLUG}_buyer_session`;

export const ROLES = {
  SELLER: "seller",
  ADMIN: "admin",
  BUYER: "buyer",
} as const;

export const PLAN_NAMES = {
  FREE: "free",
  PRO: "pro",
  PRO_PLUS: "pro+",
} as const;

export const PLAN_SLUGS = {
  FREE: "free",
  PRO: "pro",
  PRO_PLUS: "pro-plus",
} as const;

export const OTP_EXPIRY_MINUTES = 10;
export const OTP_LENGTH = 6;

export const REFERRAL_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const REFERRAL_CODE_LENGTH = 8;

export const DEFAULT_CURRENCY = "NGN";
export const DEFAULT_CURRENCY_SYMBOL = "₦";
export const KOBO_MULTIPLIER = 100;

export const DEFAULT_ESCROW_HOURS = 48;
export const DEFAULT_MIN_WITHDRAWAL = 1000;
export const SUBSCRIPTION_GRACE_DAYS = 3;
export const SUBSCRIPTION_REMINDER_DAYS = 3;
export const STALE_CART_DAYS = 30;
export const NEW_ARRIVAL_DAYS = 30;
export const MAX_PRODUCT_IMAGES = 8;
export const BANK_CACHE_TTL_MS = 60 * 60 * 1000;

export const ORDER_NUMBER_PREFIX = APP_NAME.slice(0, 3).toUpperCase();
export const TICKET_NUMBER_PREFIX = "TKT";

export const USER_ROLES = ["seller", "admin"] as const;
export const BUYER_ROLES = ["buyer"] as const;
