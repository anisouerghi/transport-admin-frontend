import { HttpInterceptorFn } from '@angular/common/http';

/** Admin : force FR pour les libellés API (stabilité opérationnelle). */
export const acceptLanguageInterceptor: HttpInterceptorFn = (req, next) =>
  next(req.clone({ setHeaders: { 'Accept-Language': 'fr' } }));
