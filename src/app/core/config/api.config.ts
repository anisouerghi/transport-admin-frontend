import { environment } from '../../../environments/environment';

function api(path: string): string {
  return `${environment.apiBaseUrl}${path}`;
}

/** Configuration centrale des endpoints API admin (selon environment). */
export const API_CONFIG = {
  baseUrl: api('/api'),
  auth: api('/api/auth'),
  admin: {
    users: api('/api/admin/users'),
    roles: api('/api/admin/roles'),
    permissions: api('/api/admin/permissions'),
    supportTypes: api('/api/admin/support-types'),
    districts: api('/api/admin/districts'),
    reportTypes: api('/api/admin/report-types'),
    natures: api('/api/admin/natures'),
    transportSupports: api('/api/admin/transport-supports'),
    signalements: api('/api/admin/signalements'),
    reports: api('/api/admin/reports'),
    statuses: api('/api/admin/status'),
    auditLogs: api('/api/admin/audit-logs'),
    passengers: api('/api/admin/passengers'),
    statistics: api('/api/admin/statistics'),
  },
} as const;
