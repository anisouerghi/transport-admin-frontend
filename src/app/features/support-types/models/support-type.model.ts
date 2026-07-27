/** Type de support renvoye par l'API (GET /api/admin/support-types). */
export interface SupportType {
  /** Identifiant technique. */
  supportTypeId: number;
  /** Code metier unique (ex. BUS). */
  code: string;
  /** Libelle affiche. */
  label: string;
}

/** Payload create / update (POST|PUT). */
export interface SupportTypeRequest {
  code: string;
  label: string;
}

/** Filtres envoyes dans POST /search -> filters. */
export interface SupportTypeFilter {
  code?: string;
  label?: string;
}
