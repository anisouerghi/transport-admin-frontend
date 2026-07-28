import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';
import { ApiResponse, PageResult } from '../../../shared/models/api-response.model';
import { Report, ReportFilter } from '../models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_CONFIG.admin.signalements;

  /**
   * Liste paginée + filtres (backend currently returns full list, so filter/pagination client-side).
   */
  getReports(page: number, size: number, filter: ReportFilter = {}): Observable<PageResult<Report>> {
    return this.http.get<ApiResponse<Report[]>>(this.baseUrl).pipe(
      map((res) => {
        const items = res.data ?? [];
        const filtered = this.applyFilter(items, filter);
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

  getReportById(id: number): Observable<Report> {
    return this.http.get<ApiResponse<Report>>(`${this.baseUrl}/${id}`).pipe(map((r) => r.data));
  }

  private applyFilter(items: Report[], filter: ReportFilter): Report[] {
    const reference = filter.reference?.trim().toLowerCase();
    const reportType = filter.reportType?.trim().toLowerCase();
    const priority = filter.priority?.trim().toLowerCase();
    const status = filter.status?.trim().toLowerCase();

    return items.filter((it) => {
      if (reference && !(it.reference ?? '').toLowerCase().includes(reference)) {
        return false;
      }
      if (reportType && !(it.reportTypeLabel ?? '').toLowerCase().includes(reportType)) {
        return false;
      }
      if (priority && !(it.priority ?? '').toLowerCase().includes(priority)) {
        return false;
      }
      if (status && !(it.status?.label ?? '').toLowerCase().includes(status)) {
        return false;
      }
      return true;
    });
  }
}
