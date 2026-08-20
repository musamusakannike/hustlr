import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.config";
import { Store } from "../models/store.model";
import { Settings } from "../models/settings.model";
import { ApiError } from "../utils/api-error.util";
import { asyncHandler } from "../utils/async-handler.util";
import { normalizeDomain } from "../utils/dns.util";

function reservedSubdomains(): Set<string> {
  return new Set(["www", "api", "admin", "app", "mail", "cdn", "stores", ""]);
}

function extractSlugFromHost(hostHeader?: string): string | null {
  if (!hostHeader) return null;
  const host = hostHeader.split(":")[0].toLowerCase();
  const domains = [env.platformDomain, env.devPlatformDomain].filter(Boolean);
  for (const domain of domains) {
    if (host === domain || host === `www.${domain}`) return null;
    if (host.endsWith(`.${domain}`)) {
      const slug = host.slice(0, -(domain.length + 1));
      if (reservedSubdomains().has(slug) || slug.includes(".")) return null;
      return slug;
    }
  }
  return null;
}

export const resolveStore = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const headerSlug = (req.header("x-store-slug") || req.query.storeSlug) as string | undefined;
  const host = req.header("x-forwarded-host") || req.header("host");
  const slug = headerSlug?.toLowerCase() || extractSlugFromHost(host);
  const customHost = host ? normalizeDomain(host.split(":")[0]) : "";

  let store = slug ? await Store.findOne({ slug }) : null;
  if (!store && customHost) {
    store = await Store.findOne({ customDomain: customHost, customDomainVerified: true });
  }

  if (!store) throw ApiError.notFound("Store not found");

  const settings = await Settings.findOne();
  if (settings?.maintenanceMode) {
    throw ApiError.serviceUnavailable("This store is currently unavailable");
  }

  const live = store.liveOverride === true || (store.liveOverride !== false && store.isLive);
  if (!live) {
    throw ApiError.forbidden("This store is currently unavailable");
  }

  req.store = store;
  next();
});

export const resolveStoreOptional = asyncHandler(async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const headerSlug = (req.header("x-store-slug") || req.query.storeSlug) as string | undefined;
    if (headerSlug) {
      const store = await Store.findOne({ slug: headerSlug.toLowerCase() });
      if (store) req.store = store;
    }
  } catch {
    // ignore
  }
  next();
});
