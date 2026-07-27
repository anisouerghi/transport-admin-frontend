import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';
import { ApiResponse, PageResult, SearchRequest } from '../../../shared/models/api-response.model';
import { SupportType, SupportTypeFilter, SupportTypeRequest } from '../models/support-type.model';

/**
 * Service HTTP pour /api/admin/support-types.
 * Toutes les reponses ApiResponse sont unwrappees via map(res => res.data).
 */
@Injectable({ providedIn: 'root' })
export class SupportTypesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_CONFIG.admin.supportTypes;

  /**
   * Recherche paginee serveur (POST /search).
   * @param page index 0-based
   * @param size taille de page
   * @param filter criteres code / label
   * @param sortBy champ de tri (code, label, id)
   */
  search(
    page: number,
    size: number,
    filter: SupportTypeFilter = {},
    sortBy?: string,
    sortDirection: 'ASC' | 'DESC' = 'ASC'
  ): Observable<PageResult<SupportType>> {
    const body: SearchRequest<SupportTypeFilter> = {
      filters: filter,
      pageable: { page, size, sortBy, sortDirection },
    };
    return this.http
      .post<ApiResponse<PageResult<SupportType>>>(`${this.baseUrl}/search`, body)
      .pipe(map((res) => res.data));
  }

  /** Liste complete — utile pour les selects (dropdown). */
  getAll(): Observable<SupportType[]> {
    return this.http
      .get<ApiResponse<SupportType[]>>(this.baseUrl)
      .pipe(map((res) => res.data ?? []));
  }

  getById(id: number): Observable<SupportType> {
    return this.http
      .get<ApiResponse<SupportType>>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  create(payload: SupportTypeRequest): Observable<SupportType> {
    return this.http
      .post<ApiResponse<SupportType>>(this.baseUrl, payload)
      .pipe(map((res) => res.data));
  }

  update(id: number, payload: SupportTypeRequest): Observable<SupportType> {
    return this.http
      .put<ApiResponse<SupportType>>(`${this.baseUrl}/${id}`, payload)
      .pipe(map((res) => res.data));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
