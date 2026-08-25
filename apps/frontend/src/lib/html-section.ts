export interface HtmlFieldSchema {
  key: string;
  label: string;
  type: "text" | "textarea" | "image" | "color" | "url" | "number" | "list";
}

const DANGEROUS_TAGS = /<\/?(script|iframe|object|embed|link|meta|base|form|input|textarea|button)[^>]*>/gi;
const EVENT_ATTRS = /\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
const JS_URL = /(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi;

export function sanitizeHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(DANGEROUS_TAGS, "")
    .replace(EVENT_ATTRS, "")
    .replace(JS_URL, '$1="#"')
    .replace(/<\/?html[^>]*>/gi, "")
    .replace(/<\/?head[^>]*>[\s\S]*?<\/head>/gi, "")
    .replace(/<\/?body[^>]*>/gi, "");
}

export function sanitizeCss(css: string): string {
  if (!css) return "";
  return css
    .replace(/@import[^;]+;/gi, "")
    .replace(/expression\s*\(|javascript\s*:/gi, "invalid")
    .replace(/behavior\s*:/gi, "invalid:");
}

export function scopeCss(css: string, scopeSelector: string): string {
  const clean = sanitizeCss(css);
  if (!clean.trim()) return "";
  return clean.replace(/(^|})\s*([^{}]+)\{/g, (_m, brace: string, selector: string) => {
    const scoped = selector
      .split(",")
      .map((part) => {
        const trimmed = part.trim();
        if (!trimmed || trimmed.startsWith("@")) return trimmed;
        if (trimmed === "from" || trimmed === "to" || trimmed.includes("%")) return trimmed;
        return `${scopeSelector} ${trimmed}`;
      })
      .join(", ");
    return `${brace} ${scoped} {`;
  });
}

export function extractFieldKeys(html: string): string[] {
  const keys = new Set<string>();
  const re = /\{\{\s*([a-zA-Z][\w.]*)\s*\}\}/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const key = match[1];
    if (
      key.startsWith("store.") ||
      ["title", "image", "price", "url", "name"].includes(key)
    ) {
      continue;
    }
    keys.add(key.split(".")[0]);
  }
  return [...keys];
}

export function inferFieldSchema(html: string): HtmlFieldSchema[] {
  return extractFieldKeys(html).map((key) => {
    const lower = key.toLowerCase();
    let type: HtmlFieldSchema["type"] = "text";
    if (lower.includes("image") || lower.includes("logo") || lower.includes("avatar")) type = "image";
    else if (lower.includes("color")) type = "color";
    else if (lower.includes("link") || lower.includes("url") || lower.includes("href")) type = "url";
    else if (lower.includes("subheading") || lower.includes("text") || lower.includes("copy") || lower.includes("narrative"))
      type = "textarea";
    const label = key.replace(/([A-Z])/g, " $1").replace(/[_-]/g, " ").replace(/^\w/, (c) => c.toUpperCase());
    return { key, label: label.trim(), type };
  });
}

function lookup(path: string, ctx: Record<string, unknown>): unknown {
  return path.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, ctx);
}

function interpolate(template: string, ctx: Record<string, unknown>): string {
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_m, path: string) => {
    const value = lookup(path, ctx);
    if (value == null) return "";
    return String(value);
  });
}

export interface HtmlRenderContext {
  data: Record<string, unknown>;
  store: { name: string; logo?: string; url?: string; slug?: string };
  products?: {
    featured?: Array<Record<string, unknown>>;
    new?: Array<Record<string, unknown>>;
    best?: Array<Record<string, unknown>>;
  };
  categories?: Array<Record<string, unknown>>;
}

export function compileHtmlSection(html: string, ctx: HtmlRenderContext): string {
  const safe = sanitizeHtml(html);
  const withEach = safe.replace(
    /\{\{#each\s+(products|categories)([^}]*)\}\}([\s\S]*?)\{\{\/each\}\}/g,
    (_m, collection: string, meta: string, inner: string) => {
      const source = (meta.match(/source\s*=\s*"([^"]+)"/) || [])[1] || "featured";
      const limit = Number((meta.match(/limit\s*=\s*"(\d+)"/) || [])[1] || 8);
      let items: Array<Record<string, unknown>> = [];
      if (collection === "categories") items = ctx.categories || [];
      else if (source === "new") items = ctx.products?.new || [];
      else if (source === "best") items = ctx.products?.best || [];
      else items = ctx.products?.featured || [];
      return items.slice(0, limit).map((item) => interpolate(inner, { ...item, store: ctx.store })).join("");
    },
  );
  return interpolate(withEach, { ...ctx.data, store: ctx.store });
}
