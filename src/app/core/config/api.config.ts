import { Config } from '../../helpers/config';

/** Configuration centrale des endpoints API admin. */
export const API_CONFIG = {
  baseUrl: `${Config.API_LINK}/api`,
  admin: {
    users: `${Config.API_LINK}/api/admin/users`,
  },
} as const;
