import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';
import { ApiResponse } from '../../../shared/models/api-response.model';
import { StatisticsOverview } from '../models/statistics.model';

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
}
