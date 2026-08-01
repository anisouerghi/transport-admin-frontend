export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'LOW', label: 'Faible' },
  { value: 'MEDIUM', label: 'Normale' },
  { value: 'HIGH', label: 'Élevée' },
  { value: 'CRITICAL', label: 'Critique' },
];

export interface TransportSupport {
  transportSupportId: number;
  uuid?: string;
  reference?: string;
  label?: string;
}

export interface Passenger {
  passengerId: number;
  name?: string;
  email?: string;
  phoneNumber?: string;
  emailVerified?: boolean;
  active?: boolean;
  /** True si aucune identité renseignée (voyageur anonyme). */
  anonymous?: boolean;
}

export interface Status {
  statusId: number;
  code: string;
  label: string;
  displayOrder?: number;
}

/** Pièce jointe d'un signalement. */
export interface ReportAttachment {
  attachmentId: number;
  uuid?: string;
  fileName: string;
  fileType?: string;
  fileSize?: number | null;
  reportId?: number;
  image?: boolean;
}

export interface Report {
  reportId: number;
  uuid?: string;
  reference?: string;
  creationDate?: string;
  description?: string;
  priority?: Priority;
  closureDate?: string;
  transportSupport?: TransportSupport | null;
  reportTypeCode?: string;
  reportTypeLabel?: string;
  passenger?: Passenger | null;
  status?: Status | null;
  attachments?: ReportAttachment[];
}

export interface ReportFilter {
  reference?: string;
  description?: string;
  priority?: string;
  reportTypeId?: number;
  statusId?: number;
  supportUuid?: string;
  supportReference?: string;
  creationDateFrom?: string;
  creationDateTo?: string;
  closureDateFrom?: string;
  closureDateTo?: string;
  reportType?: string;
  status?: string;
}

export interface ReportReplyRequest {
  message: string;
  /** Optionnel : déduit du JWT côté backend. */
  userId?: number;
  statusId?: number;
  sendEmail?: boolean;
  publish?: boolean;
  publicResponse?: boolean;
}

export interface ReportReply {
  replyId: number;
  message: string;
  replyDate: string;
  emailSent?: boolean;
  publicResponse?: boolean;
  publish?: boolean;
  reportId: number;
  userId: number;
}

export interface UpdatePriorityRequest {
  priority: Priority;
}
