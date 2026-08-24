import type { CookieOptions, Response } from "express";
import { BUYER_SESSION_COOKIE, SELLER_SESSION_COOKIE } from "../config/constants.config";
import { env } from "../config/env.config";

function baseCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

export function setSellerSessionCookie(res: Response, token: string): void {
  const options = baseCookieOptions();
  if (env.cookieDomain) options.domain = env.cookieDomain;
  res.cookie(SELLER_SESSION_COOKIE, token, options);
}

export function setBuyerSessionCookie(res: Response, token: string): void {
  const options = baseCookieOptions();
  res.cookie(BUYER_SESSION_COOKIE, token, options);
}

export function clearSellerSessionCookie(res: Response): void {
  const options = baseCookieOptions();
  if (env.cookieDomain) options.domain = env.cookieDomain;
  res.clearCookie(SELLER_SESSION_COOKIE, options);
}

export function clearBuyerSessionCookie(res: Response): void {
  res.clearCookie(BUYER_SESSION_COOKIE, baseCookieOptions());
}
