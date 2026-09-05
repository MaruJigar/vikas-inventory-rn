export interface AuditLogDto {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
}
