export interface ReclamationType {
  reclamationTypeId: number;
  code: string;
  label: string;
}

export interface ReclamationTypeRequest {
  code: string;
  label: string;
}