export function storeHref(slug: string, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (typeof window === "undefined") return `/store/${slug}${normalized}`;
  const host = window.location.hostname.toLowerCase();
  if (host === `${slug}.lvh.me` || host.startsWith(`${slug}.`)) {
    return normalized;
  }
  return `/store/${slug}${normalized}`;
}
