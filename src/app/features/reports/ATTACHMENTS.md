# Pièces jointes — Admin Frontend

Dans la fiche détail d'un signalement (`ReportDetailModalComponent`) :

- chargement via `GET /api/admin/signalements/{id}/attachments` (et champ `attachments` du détail) ;
- miniature image via `GET /api/admin/attachments/{id}/view` (blob + JWT) ;
- libellé PDF pour les documents ;
- actions **Voir** (nouvel onglet) et **Télécharger** (`…/download`) ;
- message **Aucune pièce jointe.** si la liste est vide.

Service : `ReportsService.getAttachments`, `viewAttachmentBlob`, `downloadAttachmentBlob`.
