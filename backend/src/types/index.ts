import { Role } from '@prisma/client';
import { Request } from 'express';

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TaskFilterQuery extends PaginationQuery {
  dateFrom?: string;
  dateTo?: string;
  category?: string;
  status?: string;
}

export interface IssueFilterQuery extends PaginationQuery {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  severity?: string;
}

export interface FeedbackFilterQuery extends PaginationQuery {
  dateFrom?: string;
  dateTo?: string;
  type?: string;
}

export interface NoteFilterQuery extends PaginationQuery {
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  tags?: string;
}

export interface ReportQuery {
  dateFrom: string;
  dateTo: string;
  categories: string;
  format?: 'json' | 'pdf' | 'csv';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Array<{ field: string; message: string }>;
}
