/** Voyageur (déclarant). */
export interface Passenger {
  passengerId: number;
  name: string | null;
  email: string | null;
  phoneNumber: string | null;
  emailVerified: boolean;
  active: boolean;
}

/** Filtres de recherche voyageurs. */
export interface PassengerFilter {
  name?: string;
  email?: string;
  phoneNumber?: string;
  /** null = tous, true = actifs, false = désactivés */
  active?: boolean | null;
}
