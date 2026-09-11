export interface AuditLog {
  id: string;
  club_id?: number | null;
  user_id?: number | null;
  action: string;
  entity_type?: string | null;
  entity_id?: string | null;
  metadata?: any;
  severity: 'info' | 'warning' | 'critical';
  created_at: Date;
}
