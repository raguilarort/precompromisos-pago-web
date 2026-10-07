import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = sessionStorage.getItem('accessToken');
  let peticion = req;

  // REGLA 1: Filtrar APIs externas. Si la petición NO va a nuestro backend,
  // la dejamos pasar intacta. Esto evita interceptar el 401 de Microsoft Graph.
  if (!req.url.includes(environment.apiUrl)) {
    return next(req);
  }

  // REGLA 2: Inyectamos el JWT de Spring Boot solo a nuestras rutas
  if (token) {
    peticion = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // 3. Dejamos que continúe y escuchamos la RESPUESTA (Nueva lógica)
  return next(peticion).pipe(
    catchError((error: HttpErrorResponse) => {
      // REGLA 3: Si el error viene de intentar iniciar sesión, dejamos que 
      // auth.ts maneje el error (por ejemplo, si el usuario está inactivo en BD).
      if (req.url.includes('/auth/login-microsoft')) {
        return throwError(() => error);
      }

      // REGLA 4: Cualquier otro 401/403 significa que nuestro 
      // JWT caducó mientras usábamos el sistema.
      if (error.status === 401 || error.status === 403) {
        console.warn('Sesión expirada por inactividad o acceso denegado. Redirigiendo...');
        sessionStorage.clear(); // O llama a tu authService.cerrarSesion()
        router.navigate(['/portal'], { queryParams: { session: 'expired' } }); 
      }
      return throwError(() => error);
    })
  );
};
