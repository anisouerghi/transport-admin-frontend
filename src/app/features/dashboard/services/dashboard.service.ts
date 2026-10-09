import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';
import { ApiResponse } from '../../../shared/models/api-response.model';
import { ReportStatusCount, ReportTypeCount } from '../models/dashboard.model';

/** Service HTTP pour /api/admin/dashboard. */
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_CONFIG.admin.dashboard;

  /** Nombre de signalements par type. */
  getReportsByType(): Observable<ReportTypeCount[]> {
    return this.http
      .get<ApiResponse<ReportTypeCount[]>>(`${this.baseUrl}/reports-by-type`)
      .pipe(map((res) => res.data ?? []));
  }

  /** Nombre de signalements par statut. */
  getReportsByStatus(): Observable<ReportStatusCount[]> {
    return this.http
      .get<ApiResponse<ReportStatusCount[]>>(`${this.baseUrl}/reports-by-status`)
      .pipe(map((res) => res.data ?? []));
  }
}
