export type PaginationInput = {
  page?: number;
  limit?: number;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

export function normalizePagination(input: PaginationInput): { page: number; limit: number; skip: number } {
  const safePage = Number.isFinite(input.page) ? Math.max(1, Math.floor(input.page as number)) : DEFAULT_PAGE;
  const safeLimit = Number.isFinite(input.limit)
    ? Math.min(MAX_LIMIT, Math.max(1, Math.floor(input.limit as number)))
    : DEFAULT_LIMIT;

  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
  };
}

export function buildPaginationMeta(input: { page: number; limit: number; total: number }): PaginationMeta {
  const totalPages = input.total > 0 ? Math.ceil(input.total / input.limit) : 1;

  return {
    page: input.page,
    limit: input.limit,
    total: input.total,
    totalPages,
  };
}

export function normalizeSearchTerm(value?: string | null) {
  const trimmed = value?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : undefined;
}
