import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

export const authGuard: CanActivateFn = (route, state) => {
  const msalService = inject(MsalService);
  const router = inject(Router);

  // Verificamos si Microsoft tiene al menos una cuenta guardada en el caché del navegador
  if (msalService.instance.getAllAccounts().length > 0) {
    return true; // Permite el acceso a la ruta
  }

  // Si no hay sesión, cancela la navegación y lo redirige al portal
  return router.createUrlTree(['/portal']);
};