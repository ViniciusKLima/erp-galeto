import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  while (!auth.ready()) {
    await new Promise((resolve) => setTimeout(resolve, 25));
  }

  if (auth.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree(['/login']);
};

export const adminGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  while (!auth.ready()) {
    await new Promise((resolve) => setTimeout(resolve, 25));
  }

  if (auth.isAdmin()) {
    return true;
  }
  return router.createUrlTree(['/dashboard']);
};
