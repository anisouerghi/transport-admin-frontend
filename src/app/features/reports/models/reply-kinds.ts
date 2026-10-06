/** Types de message acceptés sur POST /api/admin/reports/{id}/replies. */
export const AGENT_REPLY_TYPE = {
  response: 'RESPONSE',
  complementRequest: 'COMPLEMENT_REQUEST',
  internalNote: 'INTERNAL_NOTE',
} as const;

export type AgentReplyType = (typeof AGENT_REPLY_TYPE)[keyof typeof AGENT_REPLY_TYPE];

export const AGENT_REPLY_TYPE_OPTIONS: { value: AgentReplyType; label: string }[] = [
  { value: AGENT_REPLY_TYPE.response, label: 'Réponse' },
  { value: AGENT_REPLY_TYPE.complementRequest, label: 'Demande de complément' },
  { value: AGENT_REPLY_TYPE.internalNote, label: 'Note interne' },
];

export function replyTypeLabel(replyType: string | null | undefined): string {
  switch ((replyType ?? '').toUpperCase()) {
    case AGENT_REPLY_TYPE.complementRequest:
      return 'Demande de complément';
    case 'COMPLEMENT_RESPONSE':
      return 'Réponse au complément';
    case AGENT_REPLY_TYPE.internalNote:
      return 'Note interne';
    default:
      return 'Réponse';
  }
}

export function replyAuthorLabel(authorType: string | null | undefined): string {
  switch ((authorType ?? '').toUpperCase()) {
    case 'PASSENGER':
      return 'Voyageur';
    case 'SYSTEM':
      return 'Système';
    default:
      return 'Agent';
  }
}
