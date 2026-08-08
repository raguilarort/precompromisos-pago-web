import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Recuperamos el token de donde lo estés guardando al hacer Login
  // (Normalmente sessionStorage o localStorage)
  const token = sessionStorage.getItem('accessToken');

  // 2. Si existe el token, clonamos la petición e inyectamos el header
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    // 3. Dejamos que la petición clonada continúe su camino
    return next(authReq);
  }

  // Si no hay token (ej. en la petición de login inicial), pasa la petición original intacta
  return next(req);
};
