import { Store, type IStore } from "../models/store.model";
import { WebsiteTemplate, type IWebsiteTemplate } from "../models/website-template.model";
import { TemplateSection } from "../models/template-section.model";
import { User } from "../models/user.model";
import { ApiError } from "../utils/api-error.util";
import { isValidSlug, slugify, uniqueSlug } from "../utils/slug.util";
import { isValidDomain, normalizeDomain, verifyCustomDomain } from "../utils/dns.util";
import { env } from "../config/env.config";
import { APP_DOMAIN } from "../config/constants.config";
import {
  getSellerPlan,
  getSellerStore,
  planAllowsCustomDomain,
  planAllowsTemplate,
  refreshStoreLiveStatus,
} from "./store-helper.service";
import {
  cloneJson,
  normalizeColorScheme,
  normalizeThemeSettings,
} from "../utils/storefront-theme.util";

export async function setupStore(
  sellerId: string,
  email: string,
  payload: Record<string, unknown>,
) {
  let store = await Store.findOne({ sellerId });
  if (!store) {
    const name = String(payload.name || "My Store");
    const requested = payload.slug ? String(payload.slug) : slugify(name);
    if (payload.slug && !isValidSlug(String(payload.slug))) {
      throw ApiError.badRequest("Slug may only contain lowercase letters, numbers, and hyphens");
    }
    const slug = await uniqueSlug(requested, async (s) => Boolean(await Store.exists({ slug: s })));
    store = await Store.create({
      sellerId,
      name,
      slug,
      contactEmail: email,
    });
  }

  const allowed = [
    "name",
    "description",
    "logo",
    "banner",
    "favicon",
    "socialLinks",
    "colorScheme",
    "templateId",
    "currency",
    "currencySymbol",
    "contactEmail",
    "contactPhone",
    "address",
    "metaTitle",
    "metaDescription",
    "shippingPolicy",
    "returnPolicy",
    "termsOfService",
    "privacyPolicy",
    "referralEnabled",
    "referrerRewardAmount",
    "refereeDiscountPercent",
    "refereeDiscountMaxAmount",
    "customSections",
    "themeSettings",
  ] as const;

  for (const key of allowed) {
    if (payload[key] !== undefined) {
      (store as unknown as Record<string, unknown>)[key] = payload[key];
    }
  }

  if (payload.slug && payload.slug !== store.slug) {
    const next = String(payload.slug);
    if (!isValidSlug(next)) {
      throw ApiError.badRequest("Slug may only contain lowercase letters, numbers, and hyphens");
    }
    const taken = await Store.exists({ slug: next, _id: { $ne: store._id } });
    if (taken) throw ApiError.conflict("This slug is already taken");
    store.slug = next;
  } else if (payload.name && !payload.slug && store.name === "My Store") {
    store.slug = await uniqueSlug(String(payload.name), async (s) =>
      Boolean(await Store.exists({ slug: s, _id: { $ne: store!._id } })),
    );
  }

  if (payload.templateId) {
    await setStoreTemplate(sellerId, String(payload.templateId), store);
  }

  await store.save();
  return store;
}

export async function getMyStore(sellerId: string) {
  return getSellerStore(sellerId);
}

export async function listEligibleTemplates(_sellerId: string, tier?: string) {
  const filter: Record<string, unknown> = { isActive: true };
  if (tier) filter.tier = tier;
  return WebsiteTemplate.find(filter).sort({ createdAt: -1 });
}

export async function listPublicTemplateSections() {
  return TemplateSection.find({ isActive: true }).sort({ name: 1 });
}

export function applyTemplateDefaults(store: IStore, template: IWebsiteTemplate): void {
  const scheme = normalizeColorScheme(template.defaultColorScheme);
  store.templateId = template._id;
  store.colorScheme = scheme;
  store.themeSettings = normalizeThemeSettings(template.themeSettings as unknown as Record<string, unknown>) as unknown as Record<string, unknown>;
  store.customSections = cloneJson(template.defaultSections || []);
}

export async function setStoreTemplate(
  sellerId: string,
  templateId: string,
  existing?: IStore | null,
  confirmReplace = false,
) {
  const store = existing ?? (await getSellerStore(sellerId));
  const template = await WebsiteTemplate.findById(templateId);
  if (!template || !template.isActive) throw ApiError.notFound("Template not found");
  const plan = await getSellerPlan(sellerId);
  if (!planAllowsTemplate(plan?.name ?? "free", template.tier)) {
    throw ApiError.forbidden("Your plan does not include this template");
  }

  const switching = String(store.templateId || "") !== String(template._id);
  const hasCustom = Array.isArray(store.customSections) && store.customSections.length > 0;
  if (switching && hasCustom && !confirmReplace) {
    throw ApiError.conflict(`Applying "${template.name}" will replace your current homepage, colors, and layout.`);
  }

  applyTemplateDefaults(store, template);
  if (!existing) await store.save();
  return store;
}

export async function setCustomDomain(sellerId: string, domain: string) {
  const store = await getSellerStore(sellerId);
  const plan = await getSellerPlan(sellerId);
  if (!planAllowsCustomDomain(plan?.name ?? "free")) {
    throw ApiError.forbidden("Custom domains require a Pro+ plan");
  }
  const normalized = normalizeDomain(domain);
  if (!isValidDomain(normalized)) throw ApiError.badRequest("Invalid domain");
  const taken = await Store.exists({ customDomain: normalized, _id: { $ne: store._id } });
  if (taken) throw ApiError.conflict("This domain is already in use");
  store.customDomain = normalized;
  store.customDomainVerified = false;
  await store.save();
  return {
    store,
    dns: {
      cname: { host: normalized, value: env.customDomainCnameTarget },
      aRecord: env.platformServerIp
        ? { host: normalized, value: env.platformServerIp }
        : null,
      note: `Add a CNAME pointing to ${env.customDomainCnameTarget}, or an A record to the platform IP.`,
    },
  };
}

export async function verifyDomain(sellerId: string) {
  const store = await getSellerStore(sellerId);
  if (!store.customDomain) throw ApiError.badRequest("No custom domain configured");
  const result = await verifyCustomDomain(store.customDomain);
  store.customDomainVerified = result.verified;
  await store.save();
  return { ...result, store };
}

export async function removeCustomDomain(sellerId: string) {
  const store = await getSellerStore(sellerId);
  store.customDomain = null;
  store.customDomainVerified = false;
  await store.save();
  return store;
}

export async function publicStoreInfo(store: IStore) {
  let templateSlug: string | undefined;
  if (store.templateId) {
    const tpl = await WebsiteTemplate.findById(store.templateId).select("slug").lean();
    templateSlug = tpl?.slug;
  }
  return {
    name: store.name,
    slug: store.slug,
    description: store.description,
    logo: store.logo,
    banner: store.banner,
    favicon: store.favicon,
    socialLinks: store.socialLinks,
    colorScheme: store.colorScheme,
    contactEmail: store.contactEmail,
    contactPhone: store.contactPhone,
    address: store.address,
    shippingPolicy: store.shippingPolicy,
    returnPolicy: store.returnPolicy,
    termsOfService: store.termsOfService,
    privacyPolicy: store.privacyPolicy,
    metaTitle: store.metaTitle || store.name,
    metaDescription: store.metaDescription || store.description,
    currency: store.currency,
    currencySymbol: store.currencySymbol,
    templateId: store.templateId,
    templateSlug,
    customSections: store.customSections || [],
    themeSettings: normalizeThemeSettings((store.themeSettings || {}) as Record<string, unknown>),
    url: `https://${store.slug}.${APP_DOMAIN}`,
    customDomain: store.customDomainVerified ? store.customDomain : null,
  };
}

export async function sellerPublic(sellerId: string) {
  return User.findById(sellerId).select("name email avatar");
}

export { refreshStoreLiveStatus };
