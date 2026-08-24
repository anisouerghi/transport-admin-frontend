import { Config } from '../../helpers/config';

/** Configuration centrale des endpoints API admin. */
export const API_CONFIG = {
  baseUrl: `${Config.API_LINK}/api`,
  auth: `${Config.API_LINK}/api/auth`,
  admin: {
    users: `${Config.API_LINK}/api/admin/users`,
    passengers: `${Config.API_LINK}/api/admin/passengers`,
    roles: `${Config.API_LINK}/api/admin/roles`,
    permissions: `${Config.API_LINK}/api/admin/permissions`,
    auditLogs: `${Config.API_LINK}/api/admin/audit-logs`,
    supportTypes: `${Config.API_LINK}/api/admin/support-types`,
    reclamationTypes: `${Config.API_LINK}/api/admin/type-reclamations`,
    reportTypes: `${Config.API_LINK}/api/admin/report-types`,
    transportSupports: `${Config.API_LINK}/api/admin/transport-supports`,
    signalements: `${Config.API_LINK}/api/admin/signalements`,
    reports: `${Config.API_LINK}/api/admin/reports`,
    statuses: `${Config.API_LINK}/api/admin/statuses`,
    status: `${Config.API_LINK}/api/admin/status`,
    statistics: `${Config.API_LINK}/api/admin/statistics`,
  },
} as const;
