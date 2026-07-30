import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';
import { ApiResponse, PageResult } from '../../../shared/models/api-response.model';
import { Status, StatusFilter, StatusRequest } from '../models/status.model';

@Injectable({ providedIn: 'root' })
export class StatusesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_CONFIG.admin.status;

  getStatuses(): Observable<Status[]> {
    return this.http
      .get<ApiResponse<Status[]>>(this.baseUrl)
      .pipe(map((res) => res.data ?? []));
  }

  search(page: number, size: number, filter: StatusFilter = {}): Observable<PageResult<Status>> {
    return this.getStatuses().pipe(
      map((statuses) => {
        const filtered = this.applyFilter(statuses, filter);
        const totalElements = filtered.length;
        const totalPages = Math.max(1, Math.ceil(totalElements / size));
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

  getById(id: number): Observable<Status> {
    return this.http
      .get<ApiResponse<Status>>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  create(payload: StatusRequest): Observable<Status> {
    return this.http
      .post<ApiResponse<Status>>(this.baseUrl, payload)
      .pipe(map((res) => res.data));
  }

  update(id: number, payload: StatusRequest): Observable<Status> {
    return this.http
      .put<ApiResponse<Status>>(`${this.baseUrl}/${id}`, payload)
      .pipe(map((res) => res.data));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  private applyFilter(statuses: Status[], filter: StatusFilter): Status[] {
    const code = filter.code?.trim().toLowerCase();
    const label = filter.label?.trim().toLowerCase();
    return statuses.filter((status) => {
      if (code && !status.code.toLowerCase().includes(code)) {
        return false;
      }
      if (label && !status.label.toLowerCase().includes(label)) {
        return false;
      }
      if (filter.displayOrder !== undefined && filter.displayOrder !== null) {
        return status.displayOrder === filter.displayOrder;
      }
      return true;
    });
  }
}
