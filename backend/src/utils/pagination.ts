import { PaginationQuery } from '../types';

export interface ParsedPagination {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export function parsePagination(
  query: PaginationQuery,
  defaultSortBy = 'createdAt'
): ParsedPagination {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '10', 10)));
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy || defaultSortBy;
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

  return { page, limit, skip, sortBy, sortOrder };
}

export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
