/** Utilisateur renvoyé par GET /api/admin/users. */
export interface User {
  userId: number;
  uuid: string;
  username: string;
  name: string;
  email: string;
  active: boolean;
  createdDate?: string;
  roles?: string[];
}

/** Payload create / update POST|PUT /api/admin/users. */
export interface UserRequest {
  username: string;
  name: string;
  email: string;
  password?: string;
  roleIds?: number[];
}

/** Filtres de recherche multicritère (appliqués côté client pour l’instant). */
export interface UserFilter {
  username?: string;
  name?: string;
  email?: string;
  active?: boolean | null;
}

export interface RoleOption {
  roleId: number;
  code: string;
  label: string;
}
