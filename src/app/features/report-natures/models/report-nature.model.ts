/** Nature de signalement (GET /api/admin/natures). */
export interface ReportNature {
  reportNatureId: number;
  code: string;
  label: string;
  description?: string | null;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReportNatureRequest {
  code: string;
  label: string;
  description?: string;
}

export interface ReportNatureFilter {
  code?: string;
  label?: string;
  description?: string;
  active?: boolean | null;
}
