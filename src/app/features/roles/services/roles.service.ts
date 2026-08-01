import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';
import { ApiResponse } from '../../../shared/models/api-response.model';
import { Permission, PermissionMatrix, Role, RoleRequest } from '../models/role.model';

@Injectable({ providedIn: 'root' })
export class RolesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_CONFIG.admin.roles;
  private readonly permissionsUrl = API_CONFIG.admin.permissions;

  getAll(): Observable<Role[]> {
    return this.http.get<ApiResponse<Role[]>>(this.baseUrl).pipe(map((res) => res.data ?? []));
  }

  getById(id: number): Observable<Role> {
    return this.http.get<ApiResponse<Role>>(`${this.baseUrl}/${id}`).pipe(map((res) => res.data));
  }

  create(payload: RoleRequest): Observable<Role> {
    return this.http.post<ApiResponse<Role>>(this.baseUrl, payload).pipe(map((res) => res.data));
  }

  update(id: number, payload: RoleRequest): Observable<Role> {
    return this.http.put<ApiResponse<Role>>(`${this.baseUrl}/${id}`, payload).pipe(map((res) => res.data));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getPermissions(): Observable<Permission[]> {
    return this.http
      .get<ApiResponse<Permission[]>>(this.permissionsUrl)
      .pipe(map((res) => res.data ?? []));
  }

  getPermissionMatrix(): Observable<PermissionMatrix> {
    return this.http
      .get<ApiResponse<PermissionMatrix>>(`${this.permissionsUrl}/matrix`)
      .pipe(map((res) => res.data));
  }
}
