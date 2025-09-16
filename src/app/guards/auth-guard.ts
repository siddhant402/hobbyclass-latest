import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  // Check if user is logged in and is admin
  if (authService.isLoggedIn && authService.isAdmin()) {
    return true;
  }

  // Redirect to login if not authenticated or not admin
  router.navigate(['/login']);
  return false;
};
