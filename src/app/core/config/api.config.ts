import { Config } from '../../helpers/config';

/** Configuration centrale des endpoints API admin. */
export const API_CONFIG = {
  baseUrl: `${Config.API_LINK}/api`,
  auth: `${Config.API_LINK}/api/auth`,
  admin: {
    users: `${Config.API_LINK}/api/admin/users`,
    roles: `${Config.API_LINK}/api/admin/roles`,
    permissions: `${Config.API_LINK}/api/admin/permissions`,
    supportTypes: `${Config.API_LINK}/api/admin/support-types`,
    districts: `${Config.API_LINK}/api/admin/districts`,
    reportTypes: `${Config.API_LINK}/api/admin/report-types`,
    natures: `${Config.API_LINK}/api/admin/natures`,
    transportSupports: `${Config.API_LINK}/api/admin/transport-supports`,
    signalements: `${Config.API_LINK}/api/admin/signalements`,
    reports: `${Config.API_LINK}/api/admin/reports`,
    statuses: `${Config.API_LINK}/api/admin/status`,
    auditLogs: `${Config.API_LINK}/api/admin/audit-logs`,
    passengers: `${Config.API_LINK}/api/admin/passengers`,
    statistics: `${Config.API_LINK}/api/admin/statistics`,
  },
} as const;
