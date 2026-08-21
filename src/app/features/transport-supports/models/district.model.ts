/** District renvoye par l'API (GET /api/admin/districts). */
export interface District {
  districtId: number;
  codeDistrict: string;
  libelleDistrict: string;
  etat: number;
}
