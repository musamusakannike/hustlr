export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PageMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedQuery {
  page?: number;
  limit?: number;
  search?: string;
}

/** Server list payloads use `{ items, meta }`. Flatten for UI tables. */
export function fromPaged<T>(raw: {
  items?: T[];
  meta?: Partial<PageMeta>;
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}): Paginated<T> {
  const meta = raw.meta ?? {};
  const items = raw.items ?? [];
  const page = meta.page ?? raw.page ?? 1;
  const limit = meta.limit ?? raw.limit ?? items.length || 20;
  const total = meta.total ?? raw.total ?? items.length;
  const totalPages = meta.totalPages ?? raw.totalPages ?? Math.max(1, Math.ceil(total / (limit || 1)));
  return { items, page, limit, total, totalPages };
}

export function withId<T extends { _id?: unknown; id?: string }>(doc: T): T & { id: string } {
  const id = doc.id || (doc._id != null ? String(doc._id) : "");
  return { ...doc, id };
}
