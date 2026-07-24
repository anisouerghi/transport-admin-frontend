import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';
import { ApiResponse, PageResult } from '../../../shared/models/api-response.model';
import { User, UserFilter, UserRequest } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_CONFIG.admin.users;

  /**
   * Liste paginée + filtres.
   * Le backend renvoie actuellement la liste complète : pagination et filtres sont appliqués côté client.
   */
  getUsers(page: number, size: number, filter: UserFilter = {}): Observable<PageResult<User>> {
    return this.http.get<ApiResponse<User[]>>(this.baseUrl).pipe(
      map((res) => {
        const filtered = this.applyFilter(res.data ?? [], filter);
        const totalElements = filtered.length;
        const totalPages = Math.max(1, Math.ceil(totalElements / size) || 1);
        const safePage = Math.min(Math.max(page, 0), totalPages - 1);
        const start = safePage * size;
        return {
          content: filtered.slice(start, start + size),
          totalElements,
          totalPages,
          page: safePage,
          size,
        };
      })
    );
  }

  getUserById(id: number): Observable<User> {
    return this.http
      .get<ApiResponse<User>>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  createUser(user: UserRequest): Observable<User> {
    return this.http
      .post<ApiResponse<User>>(this.baseUrl, user)
      .pipe(map((res) => res.data));
  }

  updateUser(id: number, user: UserRequest): Observable<User> {
    return this.http
      .put<ApiResponse<User>>(`${this.baseUrl}/${id}`, user)
      .pipe(map((res) => res.data));
  }

  activateUser(id: number): Observable<User> {
    return this.http
      .patch<ApiResponse<User>>(`${this.baseUrl}/${id}/activate`, {})
      .pipe(map((res) => res.data));
  }

  deactivateUser(id: number): Observable<User> {
    return this.http
      .patch<ApiResponse<User>>(`${this.baseUrl}/${id}/deactivate`, {})
      .pipe(map((res) => res.data));
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  private applyFilter(users: User[], filter: UserFilter): User[] {
    const username = filter.username?.trim().toLowerCase();
    const name = filter.name?.trim().toLowerCase();
    const email = filter.email?.trim().toLowerCase();

    return users.filter((u) => {
      if (username && !u.username.toLowerCase().includes(username)) {
        return false;
      }
      if (name && !u.name.toLowerCase().includes(name)) {
        return false;
      }
      if (email && !u.email.toLowerCase().includes(email)) {
        return false;
      }
      if (filter.active === true || filter.active === false) {
        if (u.active !== filter.active) {
          return false;
        }
      }
      return true;
    });
  }
}
