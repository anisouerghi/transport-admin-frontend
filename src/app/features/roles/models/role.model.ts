export interface Permission {
  permissionId: number;
  code: string;
  label: string;
  description?: string | null;
  moduleCode: string;
  moduleLabel: string;
  actionCode: string;
  active: boolean;
}

export interface Role {
  roleId: number;
  code: string;
  label: string;
  description?: string | null;
  active: boolean;
  permissions: Permission[];
}

export interface RoleRequest {
  code: string;
  label: string;
  description?: string;
  active?: boolean;
  permissionIds: number[];
}

export interface PermissionMatrix {
  actions: string[];
  modules: PermissionMatrixModule[];
}

export interface PermissionMatrixModule {
  moduleCode: string;
  moduleLabel: string;
  permissions: Record<string, PermissionMatrixCell | undefined>;
}

export interface PermissionMatrixCell {
  permissionId: number;
  code: string;
  label: string;
  active: boolean;
}
