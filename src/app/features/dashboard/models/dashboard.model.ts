/** Nombre de signalements par type (GET /api/admin/dashboard/reports-by-type). */
export interface ReportTypeCount {
  reportTypeId: number;
  code: string;
  label: string;
  count: number;
}

/** Nombre de signalements par statut (GET /api/admin/dashboard/reports-by-status). */
export interface ReportStatusCount {
  statusId: number;
  code: string;
  label: string;
  count: number;
}

/** Nombre de signalements par type de support (GET /api/admin/dashboard/reports-by-support-type). */
export interface ReportSupportTypeCount {
  /** Absent pour les signalements sans support (code NO_SUPPORT). */
  supportTypeId?: number;
  code: string;
  label: string;
  count: number;
}

/** Répartition des signalements par authentification (GET /api/admin/dashboard/reports-by-authentication). */
export interface ReportAuthenticationCount {
  total: number;
  authenticated: number;
  anonymous: number;
}
