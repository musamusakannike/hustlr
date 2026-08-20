export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
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
}
