import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';
import { ApiResponse, PageResult, SearchRequest } from '../../../shared/models/api-response.model';
import { AuditLog, AuditLogFilter } from '../models/audit-log.model';

/**
 * Service HTTP pour /api/admin/audit-logs.
 */
@Injectable({ providedIn: 'root' })
export class AuditLogsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_CONFIG.admin.auditLogs;

  search(
    page: number,
    size: number,
    filter: AuditLogFilter = {},
    sortBy = 'actionDate',
    sortDirection: 'ASC' | 'DESC' = 'DESC'
  ): Observable<PageResult<AuditLog>> {
    const body: SearchRequest<AuditLogFilter> = {
      filters: filter,
      pageable: { page, size, sortBy, sortDirection },
    };
    return this.http
      .post<ApiResponse<PageResult<AuditLog>>>(`${this.baseUrl}/search`, body)
      .pipe(map((res) => res.data));
  }

  getById(id: number): Observable<AuditLog> {
    return this.http
      .get<ApiResponse<AuditLog>>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.data));
  }
}
