import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';
import { ApiResponse, PageResult, SearchRequest } from '../../../shared/models/api-response.model';
import {
  TransportSupport,
  TransportSupportFilter,
  TransportSupportRequest,
} from '../models/transport-support.model';

/**
 * Service HTTP pour /api/admin/transport-supports.
 * La generation QR est automatique a la creation (POST).
 */
@Injectable({ providedIn: 'root' })
export class TransportSupportsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_CONFIG.admin.transportSupports;

  /** Recherche paginee serveur (POST /search). */
  search(
    page: number,
    size: number,
    filter: TransportSupportFilter = {},
    sortBy?: string,
    sortDirection: 'ASC' | 'DESC' = 'ASC'
  ): Observable<PageResult<TransportSupport>> {
    const body: SearchRequest<TransportSupportFilter> = {
      filters: filter,
      pageable: { page, size, sortBy, sortDirection },
    };
    return this.http
      .post<ApiResponse<PageResult<TransportSupport>>>(`${this.baseUrl}/search`, body)
      .pipe(map((res) => res.data));
  }

  getById(id: number): Observable<TransportSupport> {
    return this.http
      .get<ApiResponse<TransportSupport>>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  /** Creation : le backend genere UUID + QR automatiquement. */
  create(payload: TransportSupportRequest): Observable<TransportSupport> {
    return this.http
      .post<ApiResponse<TransportSupport>>(this.baseUrl, payload)
      .pipe(map((res) => res.data));
  }

  update(id: number, payload: TransportSupportRequest): Observable<TransportSupport> {
    return this.http
      .put<ApiResponse<TransportSupport>>(`${this.baseUrl}/${id}`, payload)
      .pipe(map((res) => res.data));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /** Force la regeneration de l'image QR. */
  regenerateQr(id: number): Observable<TransportSupport> {
    return this.http
      .post<ApiResponse<TransportSupport>>(`${this.baseUrl}/${id}/generate-qr`, {})
      .pipe(map((res) => res.data));
  }

  /** URL directe de l'image PNG (pour balise &lt;img src&gt;). */
  getQrImageUrl(id: number): string {
    return `${this.baseUrl}/${id}/qr`;
  }
}
