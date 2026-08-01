import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard de permission : data.permission ou data.permissions.
 */
export const permissionGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const required = route.data['permission'] as string | undefined;
  const anyOf = route.data['permissions'] as string[] | undefined;

  if (required && auth.hasPermission(required)) {
    return true;
  }
  if (anyOf?.length && auth.hasAnyPermission(...anyOf)) {
    return true;
  }
  if (!required && !anyOf?.length) {
    return true;
  }
  return router.createUrlTree(['/dashboard']);
};
