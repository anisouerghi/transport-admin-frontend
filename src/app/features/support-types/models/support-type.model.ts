/** Type de support renvoye par l'API (GET /api/admin/support-types). */
export interface SupportType {
  /** Identifiant technique. */
  supportTypeId: number;
  /** Code metier unique (ex. BUS). */
  code: string;
  /** Libelle affiche (localise). */
  label: string;
  labelFr?: string | null;
  labelAr?: string | null;
  labelEn?: string | null;
}

/** Payload create / update (POST|PUT). */
export interface SupportTypeRequest {
  code: string;
  label: string;
  labelAr?: string;
  labelEn?: string;
}

/** Filtres envoyes dans POST /search -> filters. */
export interface SupportTypeFilter {
  code?: string;
  label?: string;
}
