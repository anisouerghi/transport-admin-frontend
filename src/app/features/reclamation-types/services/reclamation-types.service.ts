import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';
import { ApiResponse } from '../../../shared/models/api-response.model';
import { ReclamationType, ReclamationTypeRequest } from '../models/reclamation-type.model';

@Injectable({ providedIn: 'root' })
export class ReclamationTypesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_CONFIG.admin.reclamationTypes;

  getAll(): Observable<ReclamationType[]> {
    return this.http
      .get<ApiResponse<ReclamationType[]>>(this.baseUrl)
      .pipe(map((response) => response.data ?? []));
  }

  getById(id: number): Observable<ReclamationType> {
    return this.http
      .get<ApiResponse<ReclamationType>>(`${this.baseUrl}/${id}`)
      .pipe(map((response) => response.data));
  }

  create(payload: ReclamationTypeRequest): Observable<ReclamationType> {
    return this.http
      .post<ApiResponse<ReclamationType>>(this.baseUrl, payload)
      .pipe(map((response) => response.data));
  }

  update(id: number, payload: ReclamationTypeRequest): Observable<ReclamationType> {
    return this.http
      .put<ApiResponse<ReclamationType>>(`${this.baseUrl}/${id}`, payload)
      .pipe(map((response) => response.data));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}