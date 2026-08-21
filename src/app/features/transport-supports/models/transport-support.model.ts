/**
 * Support de transport renvoye par l'API admin.
 * Les champs QR (uuid, qrCodeUrl, qrCodePath, qrStatus...) sont en lecture seule.
 */
export interface TransportSupport {
  transportSupportId: number;
  /** UUID public encode dans le QR. */
  uuid: string;
  reference: string;
  label: string;
  /** URL publique : {baseUrl}/report/{uuid} */
  qrCodeUrl?: string;
  qrCodePath?: string;
  qrDateCreation?: string;
  qrDateImpression?: string;
  qrStatus?: string;
  supportStatus: string;
  districtId: number;
  districtCode: string;
  districtLabel: string;
  supportTypeId: number;
  supportTypeCode: string;
  supportTypeLabel: string;
  createdAt?: string;
  updatedAt?: string;
  /** A renvoyer lors d'un PUT (optimistic lock). */
  version?: number;
}

/**
 * Payload create / update.
 * Ne jamais envoyer uuid / qrCodeUrl / qrCodePath / qrStatus / qrDateCreation.
 */
export interface TransportSupportRequest {
  reference: string;
  label: string;
  supportStatus?: string;
  supportTypeId: number;
  districtId: number;
  version?: number;
}

/** Filtres pour POST /search. */
export interface TransportSupportFilter {
  reference?: string;
  label?: string;
  uuid?: string;
  qrStatus?: string;
  supportStatus?: string;
  supportTypeId?: number | null;
  districtId?: number | null;
}

/** Valeurs possibles de supportStatus (alignées sur l'enum backend). */
export const SUPPORT_STATUSES = ['ACTIVE', 'INACTIVE', 'MAINTENANCE'] as const;

/** Valeurs possibles de qrStatus (alignées sur l'enum backend). */
export const QR_STATUSES = ['GENERATED', 'PRINTED', 'ACTIVE', 'DISABLED'] as const;
