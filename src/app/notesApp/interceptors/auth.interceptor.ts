import { HttpErrorResponse, HttpInterceptor, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthServices } from "../services/auth";
import { catchError, switchMap, throwError } from "rxjs";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthServices);
  const token = authService.currentUserToken();

  let clonedReq = req;

  if (token) {
    clonedReq = req.clone({
      setHeaders: {
        // Usamos el estándar que Firestore REST acepta oficialmente sin activar CORS
        'Authorization': `Bearer ${token}`
      }
    });
  }
  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {

      // Si el servidor nos dice 401 (Tu token venció), intentamos el salvavidas automático
      if (error.status === 401 && localStorage.getItem('refreshTokenAuth')) {
        console.log('El token de 1 hora caducó. Renovando sesión en segundo plano...');

        // Ejecutamos la renovación automática
        return authService.refreshToken().pipe(
          switchMap((response) => {
            // Cuando Google nos da el nuevo token, clonamos la petición original de la nota
            // y la enviamos de nuevo con el nuevo token limpio
            const newRequest = req.clone({
              setParams: { auth: response.id_token }
            });
            return next(newRequest);
          }),
          catchError((refreshError) => {
            // Si incluso el Refresh Token falla (ej. el usuario cambió su clave desde otro lado),
            // lo deslogeamos por seguridad
            authService.logOutEmail();
            return throwError(() => refreshError);
          })
        );
      }

      // Si es cualquier otro error (como que no hay internet), lo dejamos pasar normal
      return throwError(() => error);
    })
  );
};
