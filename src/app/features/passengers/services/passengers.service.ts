import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';
import { ApiResponse, PageResult, SearchRequest } from '../../../shared/models/api-response.model';
import { Passenger, PassengerFilter } from '../models/passenger.model';

/** Service HTTP pour /api/admin/passengers. */
@Injectable({ providedIn: 'root' })
export class PassengersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_CONFIG.admin.passengers;

  search(
    page: number,
    size: number,
    filter: PassengerFilter = {},
    sortBy = 'passengerId',
    sortDirection: 'ASC' | 'DESC' = 'DESC'
  ): Observable<PageResult<Passenger>> {
    const body: SearchRequest<PassengerFilter> = {
      filters: filter,
      pageable: { page, size, sortBy, sortDirection },
    };
    return this.http
      .post<ApiResponse<PageResult<Passenger>>>(`${this.baseUrl}/search`, body)
      .pipe(map((res) => res.data));
  }

  getById(id: number): Observable<Passenger> {
    return this.http
      .get<ApiResponse<Passenger>>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  activate(id: number): Observable<Passenger> {
    return this.http
      .patch<ApiResponse<Passenger>>(`${this.baseUrl}/${id}/activate`, {})
      .pipe(map((res) => res.data));
  }

  deactivate(id: number): Observable<Passenger> {
    return this.http
      .patch<ApiResponse<Passenger>>(`${this.baseUrl}/${id}/deactivate`, {})
      .pipe(map((res) => res.data));
  }
}
