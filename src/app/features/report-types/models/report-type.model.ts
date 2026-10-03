/** Type de signalement renvoye par l'API (GET /api/admin/report-types). */
export interface ReportType {
  reportTypeId: number;
  code: string;
  label: string;
  labelFr?: string | null;
  labelAr?: string | null;
  labelEn?: string | null;
  description?: string | null;
  priority?: number | null;
  /** Nom Material Symbols, ex. crisis_alert. */
  icon?: string | null;
  active: boolean;
}

/** Payload create / update (POST|PUT). */
export interface ReportTypeRequest {
  code: string;
  label: string;
  labelAr?: string;
  labelEn?: string;
  description?: string;
  priority: number;
  icon?: string;
}

/** Filtres envoyes dans POST /search -> filters. */
export interface ReportTypeFilter {
  code?: string;
  label?: string;
  description?: string;
  active?: boolean | null;
}
