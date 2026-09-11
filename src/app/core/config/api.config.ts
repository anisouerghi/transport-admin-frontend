let apiBaseUrl = '';

function api(path: string): string {
  return `${apiBaseUrl}${path}`;
}

export type AdminApiConfig = {
  baseUrl: string;
  auth: string;
  admin: {
    users: string;
    roles: string;
    permissions: string;
    supportTypes: string;
    districts: string;
    reportTypes: string;
    transportSupports: string;
    signalements: string;
    reports: string;
    statuses: string;
    auditLogs: string;
    passengers: string;
    statistics: string;
  };
};

function buildApiConfig(): AdminApiConfig {
  return {
    baseUrl: api('/api'),
    auth: api('/api/auth'),
    admin: {
      users: api('/api/admin/users'),
      roles: api('/api/admin/roles'),
      permissions: api('/api/admin/permissions'),
      supportTypes: api('/api/admin/support-types'),
      districts: api('/api/admin/districts'),
      reportTypes: api('/api/admin/report-types'),
      transportSupports: api('/api/admin/transport-supports'),
      signalements: api('/api/admin/signalements'),
      reports: api('/api/admin/reports'),
      statuses: api('/api/admin/status'),
      auditLogs: api('/api/admin/audit-logs'),
      passengers: api('/api/admin/passengers'),
      statistics: api('/api/admin/statistics'),
    },
  };
}

/** Configuration centrale des endpoints API admin (apiBaseUrl charge depuis config.json). */
export const API_CONFIG: AdminApiConfig = buildApiConfig();

export function initializeApiConfig(baseUrl: string): void {
  apiBaseUrl = baseUrl;
  const built = buildApiConfig();
  API_CONFIG.baseUrl = built.baseUrl;
  API_CONFIG.auth = built.auth;
  Object.assign(API_CONFIG.admin, built.admin);
}
