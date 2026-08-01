import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';
import { ApiResponse, PageResult, SearchRequest } from '../../../shared/models/api-response.model';
import { Report, ReportFilter, ReportReply, ReportReplyRequest, Status } from '../models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_CONFIG.admin.signalements;
  private readonly replyUrl = API_CONFIG.admin.reports;
  private readonly statusesUrl = API_CONFIG.admin.statuses;

  /**
   * Recherche paginée serveur via POST /search.
   */
  getReports(page: number, size: number, filter: ReportFilter = {}): Observable<PageResult<Report>> {
    const filters = Object.entries(filter).reduce((acc, [key, value]) => {
      if (value === undefined || value === null || value === '') {
        return acc;
      }
      return { ...acc, [key]: value };
    }, {} as ReportFilter);

    const body: SearchRequest<ReportFilter> = {
      filters,
      pageable: {
        page,
        size,
        sortBy: 'creationDate',
        sortDirection: 'DESC',
      },
    };
    return this.http
      .post<ApiResponse<PageResult<Report>>>(`${this.baseUrl}/search`, body)
      .pipe(map((res) => res.data));
  }

  getReportById(id: number): Observable<Report> {
    return this.http.get<ApiResponse<Report>>(`${this.baseUrl}/${id}`).pipe(map((r) => r.data));
  }

  getReplies(reportId: number): Observable<ReportReply[]> {
    return this.http
      .get<ApiResponse<ReportReply[]>>(`${this.replyUrl}/${reportId}/replies`)
      .pipe(map((res) => res.data ?? []));
  }

  createReply(reportId: number, payload: ReportReplyRequest): Observable<ReportReply> {
    return this.http
      .post<ApiResponse<ReportReply>>(`${this.replyUrl}/${reportId}/replies`, payload)
      .pipe(map((r) => r.data));
  }

  getStatuses(): Observable<Status[]> {
    return this.http.get<ApiResponse<Status[]>>(this.statusesUrl).pipe(map((res) => res.data ?? []));
  }

  updatePriority(reportId: number, priority: string): Observable<Report> {
    return this.http
      .patch<ApiResponse<Report>>(`${this.baseUrl}/${reportId}/priority`, { priority })
      .pipe(map((r) => r.data));
  }
}
