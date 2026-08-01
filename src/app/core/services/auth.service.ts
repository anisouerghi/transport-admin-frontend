import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { ApiResponse } from '../../shared/models/api-response.model';
import { AuthSession, LoginRequest } from '../models/auth.model';

const STORAGE_KEY = 'transport_admin_auth';

/**
 * Session admin : login JWT, permissions et menus dynamiques.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly sessionSignal = signal<AuthSession | null>(this.readStorage());

  readonly session = this.sessionSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.sessionSignal()?.token);
  readonly permissions = computed(() => this.sessionSignal()?.permissions ?? []);
  readonly menus = computed(() => this.sessionSignal()?.menus ?? []);
  readonly displayName = computed(() => this.sessionSignal()?.name || this.sessionSignal()?.username || '');

  login(payload: LoginRequest): Observable<AuthSession> {
    return this.http
      .post<ApiResponse<AuthSession>>(`${API_CONFIG.auth}/login`, payload)
      .pipe(
        map((res) => res.data),
        tap((session) => this.persist(session))
      );
  }

  refreshProfile(): Observable<AuthSession> {
    return this.http.get<ApiResponse<AuthSession>>(`${API_CONFIG.auth}/me`).pipe(
      map((res) => res.data),
      tap((profile) => {
        const current = this.sessionSignal();
        if (!current?.token) return;
        this.persist({ ...profile, token: current.token, tokenType: current.tokenType || 'Bearer' });
      })
    );
  }

  logout(navigate = true): void {
    localStorage.removeItem(STORAGE_KEY);
    this.sessionSignal.set(null);
    if (navigate) {
      void this.router.navigate(['/login']);
    }
  }

  getToken(): string | null {
    return this.sessionSignal()?.token ?? null;
  }

  hasPermission(code: string): boolean {
    return this.permissions().includes(code);
  }

  /** Vérifie module × action (convention CODE = MODULE_ACTION). */
  can(module: string, action: string): boolean {
    return this.hasPermission(`${module}_${action}`.toUpperCase());
  }

  hasAnyPermission(...codes: string[]): boolean {
    return codes.some((code) => this.hasPermission(code));
  }

  currentUserId(): number | null {
    return this.sessionSignal()?.userId ?? null;
  }

  private persist(session: AuthSession): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    this.sessionSignal.set(session);
  }

  private readStorage(): AuthSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as AuthSession;
      if (!parsed?.token) return null;
      return parsed;
    } catch {
      return null;
    }
  }
}
