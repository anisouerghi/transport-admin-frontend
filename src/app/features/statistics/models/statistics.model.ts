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

/** Vue d'ensemble statistiques (squelette extensible). */
export interface StatisticsOverview {
  totalReports: number;
  totalSupports: number;
  totalUsers: number;
  totalPassengers: number;
  activePassengers: number;
  inactivePassengers: number;
}
