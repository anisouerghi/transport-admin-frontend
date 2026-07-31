# Pièces jointes — Admin Frontend

Dans la fiche détail d'un signalement (`ReportDetailModalComponent`) :

- chargement via `GET /api/admin/signalements/{id}/attachments` (et/ou champ `attachments` du détail) ;
- miniature pour les images (`…/attachments/{id}/view`) ;
- libellé PDF pour les documents ;
- actions **Voir** (inline) et **Télécharger** ;
- message **Aucune pièce jointe.** si la liste est vide.

Service : `ReportsService.getAttachments`, `attachmentViewUrl`, `attachmentDownloadUrl`.
