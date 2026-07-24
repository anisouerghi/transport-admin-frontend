import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

/** Intercepteur global : normalisation et affichage des erreurs HTTP. */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const message = extractMessage(error);
      notifications.error(message);
      return throwError(() => error);
    })
  );
};

function extractMessage(error: HttpErrorResponse): string {
  const body = error.error;
  if (typeof body === 'string' && body.trim()) {
    return body;
  }
  if (body?.message) {
    return body.message;
  }
  if (body?.error) {
    return typeof body.error === 'string' ? body.error : 'Une erreur est survenue';
  }
  if (error.status === 0) {
    return 'Impossible de joindre le serveur. Vérifiez que l’API est démarrée.';
  }
  return error.message || `Erreur HTTP ${error.status}`;
}
