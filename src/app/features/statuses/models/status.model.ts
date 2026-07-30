/** Statut renvoyé par l’API /api/admin/status. */
export interface Status {
  statusId: number;
  code: string;
  label: string;
  displayOrder: number;
}

/** Payload create / update POST|PUT /api/admin/status. */
export interface StatusRequest {
  code: string;
  label: string;
  displayOrder: number;
}

/** Filtres de recherche appliqués côté client. */
export interface StatusFilter {
  code?: string;
  label?: string;
  displayOrder?: number | null;
}
