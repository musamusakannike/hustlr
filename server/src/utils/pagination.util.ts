import type { Request } from "express";

export type Pagination = {
  page: number;
  limit: number;
  skip: number;
};

export function getPagination(req: Request, defaultLimit = 20, maxLimit = 100): Pagination {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(maxLimit, Math.max(1, Number(req.query.limit) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
}

export function paginationMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
    hasNext: page * limit < total,
    hasPrev: page > 1,
  };
}

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
