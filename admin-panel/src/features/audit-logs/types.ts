export interface AuditLogDto {
  id: string;
  actor_user_id: string | null;
  actor_role?: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata?: Record<string, any> | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
}

export interface AuditLogQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  actor_user_id?: string;
  action?: string;
  entity_type?: string;
  entity_id?: string;
  ip_address?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedAuditLogs {
  data: AuditLogDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
