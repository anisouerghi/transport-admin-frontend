/** Enveloppe générique renvoyée par l’API backend. */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  errorCode?: string;
  data: T;
}

/** Résultat paginé (backend PageResponse / frontend PageResult). */
export interface PageResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

/** Paramètres de pagination et tri. */
export interface PageRequest {
  page: number;
  size: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

/** Requête de recherche paginée. */
export interface SearchRequest<F> {
  filters?: F;
  pageable?: PageRequest;
}
