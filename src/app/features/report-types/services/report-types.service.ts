import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';
import { ApiResponse, PageResult, SearchRequest } from '../../../shared/models/api-response.model';
import { ReportType, ReportTypeFilter, ReportTypeRequest } from '../models/report-type.model';

@Injectable({ providedIn: 'root' })
export class ReportTypesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_CONFIG.admin.reportTypes;

  search(
    page: number,
    size: number,
    filter: ReportTypeFilter = {},
    sortBy?: string,
    sortDirection: 'ASC' | 'DESC' = 'ASC'
  ): Observable<PageResult<ReportType>> {
    const body: SearchRequest<ReportTypeFilter> = {
      filters: filter,
      pageable: { page, size, sortBy, sortDirection },
    };
    return this.http
      .post<ApiResponse<PageResult<ReportType>>>(`${this.baseUrl}/search`, body)
      .pipe(map((res) => res.data));
  }

  getAll(): Observable<ReportType[]> {
    return this.http
      .get<ApiResponse<ReportType[]>>(this.baseUrl)
      .pipe(map((res) => res.data ?? []));
  }

  getActive(): Observable<ReportType[]> {
    return this.http
      .get<ApiResponse<ReportType[]>>(`${this.baseUrl}/active`)
      .pipe(map((res) => res.data ?? []));
  }

  getById(id: number): Observable<ReportType> {
    return this.http
      .get<ApiResponse<ReportType>>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  create(payload: ReportTypeRequest): Observable<ReportType> {
    return this.http
      .post<ApiResponse<ReportType>>(this.baseUrl, payload)
      .pipe(map((res) => res.data));
  }

  update(id: number, payload: ReportTypeRequest): Observable<ReportType> {
    return this.http
      .put<ApiResponse<ReportType>>(`${this.baseUrl}/${id}`, payload)
      .pipe(map((res) => res.data));
  }

  activate(id: number): Observable<ReportType> {
    return this.http
      .patch<ApiResponse<ReportType>>(`${this.baseUrl}/${id}/activate`, {})
      .pipe(map((res) => res.data));
  }

  deactivate(id: number): Observable<ReportType> {
    return this.http
      .patch<ApiResponse<ReportType>>(`${this.baseUrl}/${id}/deactivate`, {})
      .pipe(map((res) => res.data));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
