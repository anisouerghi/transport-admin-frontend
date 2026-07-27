/** Type de signalement renvoye par l'API (GET /api/admin/report-types). */
export interface ReportType {
  reportTypeId: number;
  code: string;
  label: string;
  description?: string | null;
  active: boolean;
}

/** Payload create / update (POST|PUT). */
export interface ReportTypeRequest {
  code: string;
  label: string;
  description?: string;
}

/** Filtres envoyes dans POST /search -> filters. */
export interface ReportTypeFilter {
  code?: string;
  label?: string;
  description?: string;
  active?: boolean | null;
}
