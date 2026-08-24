import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';
import { ApiResponse, PageResult, SearchRequest } from '../../../shared/models/api-response.model';
import { ReportNature, ReportNatureFilter, ReportNatureRequest } from '../models/report-nature.model';

@Injectable({ providedIn: 'root' })
export class ReportNaturesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_CONFIG.admin.natures;

  search(
    page: number,
    size: number,
    filter: ReportNatureFilter = {},
    sortBy?: string,
    sortDirection: 'ASC' | 'DESC' = 'ASC'
  ): Observable<PageResult<ReportNature>> {
    const body: SearchRequest<ReportNatureFilter> = {
      filters: filter,
      pageable: { page, size, sortBy, sortDirection },
    };
    return this.http
      .post<ApiResponse<PageResult<ReportNature>>>(`${this.baseUrl}/search`, body)
      .pipe(map((res) => res.data));
  }

  getAll(): Observable<ReportNature[]> {
    return this.http
      .get<ApiResponse<ReportNature[]>>(this.baseUrl)
      .pipe(map((res) => res.data ?? []));
  }

  getActive(): Observable<ReportNature[]> {
    return this.http
      .get<ApiResponse<ReportNature[]>>(`${this.baseUrl}/active`)
      .pipe(map((res) => res.data ?? []));
  }

  create(payload: ReportNatureRequest): Observable<ReportNature> {
    return this.http
      .post<ApiResponse<ReportNature>>(this.baseUrl, payload)
      .pipe(map((res) => res.data));
  }

  update(id: number, payload: ReportNatureRequest): Observable<ReportNature> {
    return this.http
      .put<ApiResponse<ReportNature>>(`${this.baseUrl}/${id}`, payload)
      .pipe(map((res) => res.data));
  }

  activate(id: number): Observable<ReportNature> {
    return this.http
      .patch<ApiResponse<ReportNature>>(`${this.baseUrl}/${id}/activate`, {})
      .pipe(map((res) => res.data));
  }

  deactivate(id: number): Observable<ReportNature> {
    return this.http
      .patch<ApiResponse<ReportNature>>(`${this.baseUrl}/${id}/deactivate`, {})
      .pipe(map((res) => res.data));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
