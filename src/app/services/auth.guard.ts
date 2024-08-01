import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { BsaService } from './bsa.service';

export const AuthGuard: CanActivateFn = () => {
  const bsaService = inject(BsaService);
  const router = inject(Router);
  
  if (bsaService.isAuthenticated()) {
    return true;
  } else {
    router.navigate(['/login']); // Navigate to the login page or any other page
    return false;
  }
};
