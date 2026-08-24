import { NextResponse, type NextRequest } from "next/server";

const PLATFORM_DOMAIN = (
  process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "hustlr.shop"
).toLowerCase();
const DEV_DOMAIN = (process.env.NEXT_PUBLIC_DEV_DOMAIN ?? "lvh.me").toLowerCase();
const TRANSPORT_MODE = process.env.NEXT_PUBLIC_TRANSPORT ?? "api";
const SELLER_SESSION_COOKIE = "hustlr_session";

/** Subdomains that always route to the platform app, never a store. */
const RESERVED_SUBDOMAINS = new Set([
  "www",
  "app",
  "api",
  "admin",
  "dashboard",
  "auth",
]);

/**
 * Edge proxy (Next.js 16 replacement for middleware):
 * 1. Rewrites `{store-slug}.{platform|dev domain}/*` to `/store/{slug}/*`
 *    so tenants share one deployment (architecture decision 1).
 * 2. Coarse auth guard for `/dashboard` in API mode (cookie presence only —
 *    the backend remains the authoritative authorizer).
 *    Mock mode skips the guard: sessions are client-simulated and the
 *    dashboard layout guard handles redirection.
 */
export function proxy(request: NextRequest) {
  const host = (
    request.headers.get("host") ?? ""
  )
    .split(":")[0]
    .toLowerCase();
  const { pathname, search } = request.nextUrl;

  // ── Dashboard guard (API mode only) ──────────────────────────
  if (TRANSPORT_MODE === "api" && pathname.startsWith("/dashboard")) {
    const session = request.cookies.get(SELLER_SESSION_COOKIE);
    if (!session?.value) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── Storefront subdomain rewrite ─────────────────────────────
  const platformRoot = host.endsWith(`.${PLATFORM_DOMAIN}`)
    ? PLATFORM_DOMAIN
    : host.endsWith(`.${DEV_DOMAIN}`)
      ? DEV_DOMAIN
      : null;

  if (platformRoot) {
    const subdomain = host.slice(0, host.length - platformRoot.length - 1);
    const isSingleLabel =
      subdomain.length > 0 && !subdomain.includes(".") && !subdomain.includes(":");

    if (
      isSingleLabel &&
      !RESERVED_SUBDOMAINS.has(subdomain) &&
      !pathname.startsWith("/store/")
    ) {
      return NextResponse.rewrite(
        new URL(`/store/${subdomain}${pathname}${search}`, request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|gif|ico|txt|xml|js|css)$).*)"],
};
