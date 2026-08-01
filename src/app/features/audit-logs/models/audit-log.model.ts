/** Entrée du journal d'audit (GET /api/admin/audit-logs/{id}). */
export interface AuditLog {
  auditLogId: number;
  actionDate: string;
  userId?: number | null;
  username?: string | null;
  userFullName?: string | null;
  ipAddress?: string | null;
  actionType: AuditAction;
  module: AuditModule;
  entityName?: string | null;
  entityId?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  description?: string | null;
  userAgent?: string | null;
  browser?: string | null;
  operatingSystem?: string | null;
  result: AuditResult;
}

/** Filtres POST /search -> filters. */
export interface AuditLogFilter {
  user?: string;
  userId?: number;
  module?: AuditModule | '';
  actionType?: AuditAction | '';
  actionDateFrom?: string;
  actionDateTo?: string;
  result?: AuditResult | '';
  ipAddress?: string;
}

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'CONSULTATION'
  | 'EXPORT'
  | 'SEARCH'
  | 'REPLY'
  | 'STATUS_CHANGE'
  | 'PRIORITY_CHANGE'
  | 'EMAIL_SEND'
  | 'UPLOAD'
  | 'OTHER';

export type AuditModule =
  | 'DASHBOARD'
  | 'USERS'
  | 'SUPPORT_TYPES'
  | 'REPORT_TYPES'
  | 'TRANSPORT_SUPPORTS'
  | 'REPORTS'
  | 'REPLIES'
  | 'ATTACHMENTS'
  | 'STATUSES'
  | 'PASSENGERS'
  | 'STATISTICS'
  | 'AUTH'
  | 'SYSTEM'
  | 'OTHER';

export type AuditResult = 'SUCCESS' | 'FAILURE';

export const AUDIT_ACTIONS: AuditAction[] = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'LOGIN',
  'LOGOUT',
  'CONSULTATION',
  'EXPORT',
  'SEARCH',
  'REPLY',
  'STATUS_CHANGE',
  'PRIORITY_CHANGE',
  'EMAIL_SEND',
  'UPLOAD',
  'OTHER',
];

export const AUDIT_MODULES: AuditModule[] = [
  'DASHBOARD',
  'USERS',
  'SUPPORT_TYPES',
  'REPORT_TYPES',
  'TRANSPORT_SUPPORTS',
  'REPORTS',
  'REPLIES',
  'ATTACHMENTS',
  'STATUSES',
  'PASSENGERS',
  'STATISTICS',
  'AUTH',
  'SYSTEM',
  'OTHER',
];
