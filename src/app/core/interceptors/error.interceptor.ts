import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

/** Intercepteur global : normalisation des erreurs HTTP + redirection 401. */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService);
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/api/auth/login')) {
        auth.logout(false);
        void router.navigate(['/login']);
        notifications.error('Session expirée. Veuillez vous reconnecter.');
        return throwError(() => error);
      }
      if (req.url.includes('/api/auth/login')) {
        return throwError(() => error);
      }
      if (error.status === 403) {
        notifications.error('Accès refusé : permission insuffisante.');
        return throwError(() => error);
      }
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
