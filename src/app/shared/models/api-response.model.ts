/** Enveloppe générique renvoyée par l’API backend. */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

/** Résultat paginé côté frontend (pagination client tant que le backend ne page pas). */
export interface PageResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}
