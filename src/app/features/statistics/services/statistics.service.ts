import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';
import { ApiResponse, PageResult } from '../../../shared/models/api-response.model';
import {
  ReportAnalysisOption,
  ReportAnalysisOptions,
  ReportAnalysisRequest,
  ReportAnalysisResult,
  SatisfactionComment,
  SatisfactionFilter,
  SatisfactionSummary,
  StatisticsOverview,
} from '../models/statistics.model';

/** Service HTTP pour /api/admin/statistics. */
@Injectable({ providedIn: 'root' })
export class StatisticsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_CONFIG.admin.statistics;

  getOverview(): Observable<StatisticsOverview> {
    return this.http
      .get<ApiResponse<StatisticsOverview>>(`${this.baseUrl}/overview`)
      .pipe(map((res) => res.data));
  }

  getSatisfaction(filter: SatisfactionFilter = {}): Observable<SatisfactionSummary> {
    return this.http
      .get<ApiResponse<SatisfactionSummary>>(`${this.baseUrl}/satisfaction`, { params: this.params(filter) })
      .pipe(map((res) => res.data));
  }

  getSatisfactionComments(filter: SatisfactionFilter = {}, page = 0): Observable<PageResult<SatisfactionComment>> {
    return this.http
      .get<ApiResponse<PageResult<SatisfactionComment>>>(`${this.baseUrl}/satisfaction/comments`, {
        params: { ...this.params(filter), page, size: 20 },
      })
      .pipe(map((res) => res.data));
  }

  private params(filter: SatisfactionFilter): Record<string, string | number> {
    const params: Record<string, string | number> = {};
    if (filter.from) {
      params['from'] = filter.from;
    }
    if (filter.to) {
      params['to'] = filter.to;
    }
    if (filter.reportTypeId) {
      params['reportTypeId'] = filter.reportTypeId;
    }
    if (filter.transportSupportId) {
      params['transportSupportId'] = filter.transportSupportId;
    }
    return params;
  }

  analysisOptions(): Observable<ReportAnalysisOptions> {
    return this.http
      .get<ApiResponse<ReportAnalysisOptions>>(`${this.baseUrl}/analysis/options`)
      .pipe(map((res) => res.data));
  }

  analysisSupports(supportTypeId?: number, q?: string): Observable<ReportAnalysisOption[]> {
    const params: Record<string, string | number> = {};
    if (supportTypeId) {
      params['supportTypeId'] = supportTypeId;
    }
    if (q) {
      params['q'] = q;
    }
    return this.http
      .get<ApiResponse<ReportAnalysisOption[]>>(`${this.baseUrl}/analysis/supports`, { params })
      .pipe(map((res) => res.data ?? []));
  }

  analyze(request: ReportAnalysisRequest): Observable<ReportAnalysisResult> {
    return this.http
      .post<ApiResponse<ReportAnalysisResult>>(`${this.baseUrl}/analysis`, request)
      .pipe(map((res) => res.data));
  }

  exportAnalysis(request: ReportAnalysisRequest, format: 'pdf' | 'excel'): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.baseUrl}/analysis/${format}`, request, {
      observe: 'response',
      responseType: 'blob',
    });
  }
}
