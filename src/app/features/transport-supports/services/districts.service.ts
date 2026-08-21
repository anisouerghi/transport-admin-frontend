import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';
import { ApiResponse } from '../../../shared/models/api-response.model';
import { District } from '../models/district.model';

@Injectable({ providedIn: 'root' })
export class DistrictsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_CONFIG.admin.districts;

  getAll(): Observable<District[]> {
    return this.http
      .get<ApiResponse<District[]>>(this.baseUrl)
      .pipe(map((res) => res.data ?? []));
  }
}
