/** Perception voyageur de la réponse. Les taux de niveau portent sur les avis reçus. */
export interface SatisfactionSummary {
  eligibleClosedReports: number;
  evaluationsReceived: number;
  participationRate: number;
  satisfiedCount: number;
  satisfiedRate: number;
  partialCount: number;
  partialRate: number;
  dissatisfiedCount: number;
  dissatisfiedRate: number;
}

export interface SatisfactionComment {
  reference: string;
  reportTypeLabel?: string | null;
  supportLabel?: string | null;
  level: string;
  comment: string;
  createdAt?: string;
}

export interface SatisfactionFilter {
  from?: string;
  to?: string;
  reportTypeId?: number;
  transportSupportId?: number;
}

export type ReportAnalysisGrouping =
  | 'NONE'
  | 'REPORT_TYPE'
  | 'SUPPORT_TYPE'
  | 'SUPPORT'
  | 'SUPPORT_TYPE_THEN_SUPPORT'
  | 'REPORT_TYPE_THEN_SUPPORT_TYPE'
  | 'SUPPORT_TYPE_THEN_REPORT_TYPE';

export interface ReportAnalysisRequest {
  title?: string;
  subtitle?: string;
  from?: string;
  to?: string;
  reportTypeId?: number;
  supportTypeId?: number;
  transportSupportId?: number;
  grouping?: ReportAnalysisGrouping;
}

export interface ReportAnalysisOption {
  id: number;
  label: string;
}

export interface ReportAnalysisOptions {
  reportTypes: ReportAnalysisOption[];
  supportTypes: ReportAnalysisOption[];
}

export interface ReportAnalysisRow {
  kind: 'GROUP' | 'SUBTOTAL' | 'TOTAL' | string;
  label: string;
  count: number;
  rate: number;
  lastReportAt?: string;
}

export interface ReportAnalysisResult {
  title: string;
  subtitle?: string;
  periodLabel: string;
  reportTypeLabel: string;
  supportTypeLabel: string;
  supportLabel: string;
  grouping: string;
  groupingLabel: string;
  totalReports: number;
  groupCount: number;
  detailTruncated: boolean;
  detailLimit: number;
  generatedAt: string;
  rows: ReportAnalysisRow[];
}

/** Vue d'ensemble statistiques (squelette extensible). */
export interface StatisticsOverview {
  totalReports: number;
  totalSupports: number;
  totalUsers: number;
  totalPassengers: number;
  activePassengers: number;
  inactivePassengers: number;
}
