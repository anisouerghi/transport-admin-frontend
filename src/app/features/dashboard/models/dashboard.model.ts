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
