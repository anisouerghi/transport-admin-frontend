export interface MenuItem {
  code: string;
  label: string;
  url: string;
  icon?: string | null;
  permission?: string | null;
}

export interface AuthSession {
  token: string;
  tokenType: string;
  userId: number;
  username: string;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
  menus: MenuItem[];
}

export interface LoginRequest {
  username: string;
  password: string;
}
