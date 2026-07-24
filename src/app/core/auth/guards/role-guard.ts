import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../auth';
import { RolSistema } from '../models/auth.model';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

   // HIDRATACIÓN SÍNCRONA: Si hubo un F5 y la Signal está vacía, la rellenamos del caché
  if (!authService.usuarioAutenticado()) {
    const sesionGuardada = sessionStorage.getItem('sesion_negocio');
    if (sesionGuardada) {
      authService.usuarioAutenticado.set(JSON.parse(sesionGuardada));
    }
  }

  // 1. Obtenemos el usuario de nuestra Signal reactiva
  const usuario = authService.usuarioAutenticado();

  // 2. Leemos los roles permitidos que configuraremos en el archivo de rutas
  // Si una ruta no define roles, asumimos que está bloqueada por seguridad (Deny by default)
  const rolesPermitidos = route.data['rolesPermitidos'] as RolSistema[];

  // Si no hay sesión de negocio cargada (ej. si recargó la página y MSAL apenas está validando)
  // lo redirigimos al portal principal para reiniciar el flujo.
  if (!usuario) {
    return router.createUrlTree(['/portal']);
  }

  // 3. Verificamos si el rol del usuario está dentro de los permitidos para esta ruta
  if (rolesPermitidos && rolesPermitidos.includes(usuario.rol)) {
    return true; // Acceso concedido
  }

  // 4. Si es un Consultor intentando entrar a /edit, se le niega el acceso
  console.warn(`[SEGURIDAD] Acceso denegado a la ruta ${state.url} para el rol ${RolSistema[usuario.rol]}`);
  return router.createUrlTree(['/unauthorized']);
};
