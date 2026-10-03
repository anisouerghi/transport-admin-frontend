/** Noms Material Symbols déjà affichés dans l'application. */
export const REPORT_TYPE_ICON_CHOICES = [
  'crisis_alert',
  'rate_review',
  'photo_camera',
  'tips_and_updates',
  'thumb_up',
  'contact_support',
  'shield',
] as const;

/** Mêmes icônes Material Symbols que l'accueil public. */
const REPORT_TYPE_ICONS: Record<string, string> = {
  URGENCE: 'crisis_alert',
  COMPLAINT: 'rate_review',
  INCIDENT: 'photo_camera',
  SUGGESTION: 'tips_and_updates',
  THANKS: 'thumb_up',
  OTHER: 'contact_support',
  ASSAULT: 'shield',
};

export function reportTypeIcon(code?: string | null): string {
  return REPORT_TYPE_ICONS[(code ?? '').trim().toUpperCase()] ?? 'info';
}
