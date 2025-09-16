import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';

export const mentorGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  // Check if user is logged in and is mentor
  if (authService.isLoggedIn && authService.currentUser?.role === 'mentor') {
    return true;
  }

  // Redirect to login if not authenticated or not mentor
  router.navigate(['/login']);
  return false;
};
