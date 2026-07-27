import { Config } from '../../helpers/config';

/** Configuration centrale des endpoints API admin. */
export const API_CONFIG = {
  baseUrl: `${Config.API_LINK}/api`,
  admin: {
    users: `${Config.API_LINK}/api/admin/users`,
    supportTypes: `${Config.API_LINK}/api/admin/support-types`,
    reportTypes: `${Config.API_LINK}/api/admin/report-types`,
    transportSupports: `${Config.API_LINK}/api/admin/transport-supports`,
  },
} as const;
