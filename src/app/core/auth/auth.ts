import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { AuthenticationResult, InteractionStatus } from '@azure/msal-browser';
import { catchError, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private msalService = inject(MsalService);
  private broadcastService = inject(MsalBroadcastService); // Inyectamos el servicio
  private http = inject(HttpClient);
  private router = inject(Router);

  // Señales reactivas para actualizar el Navbar
  userName = signal<string>('Usuario');
  userPhoto = signal<string | null>(null);

  // Nueva señal para controlar la UI. Inicia en true para enmascarar el tiempo de carga inicial.
  isAutenticando = signal<boolean>(true);

  iniciarSesion() {
    this.msalService.loginRedirect({
      scopes: ['user.read'],
      prompt: 'select_account' //Para que el usuario pueda seleccionar qué cuenta desea utilizar
    });
  }

  cerrarSesion() {
    this.msalService.logoutRedirect({
      postLogoutRedirectUri: window.location.origin
    });
  }

  procesarRespuestaLogin() {
    // 1. Escuchamos el estado interno de MSAL en tiempo real
    this.broadcastService.inProgress$.subscribe((status: InteractionStatus) => {
      // Si el estado no es 'None', significa que hay una redirección o validación en curso
      this.isAutenticando.set(status !== InteractionStatus.None);
    });

    // 2. Procesamos el token como lo veníamos haciendo
    this.msalService.handleRedirectObservable().subscribe({
      // Aceptamos tanto AuthenticationResult como null en la firma
      next: (resultado: AuthenticationResult | null) => {
        if (resultado !== null && resultado.account) {
          // Caso 1: Regresa de Microsoft Entra con un login exitoso
          this.msalService.instance.setActiveAccount(resultado.account);
          this.generarLogAuditoria(resultado);
          this.cargarPerfilUsuario();
          
          // ¡Aquí ejecutamos la redirección real al home!
          this.router.navigate(['/home']);
        } else {
          // Caso 2: El usuario recargó la página (F5) y ya tenía sesión activa en caché
          const cuentas = this.msalService.instance.getAllAccounts();
          if (!this.msalService.instance.getActiveAccount() && cuentas.length > 0) {
            // Mantenemos la sesión activa en memoria si ya estaba logueado
            this.msalService.instance.setActiveAccount(cuentas[0]);
            this.cargarPerfilUsuario();
          }

          // NOTA IMPORTANTE: Hemos eliminado el bloque "this.router.navigate(['/home'])" 
          // que estaba aquí. De esta forma, si el usuario entra a /portal, se queda 
          // en el portal hasta que presione el botón explícitamente.
        }
      },
      error: (error) => console.error('Error interno de MSAL:', error)
    });
  }

  private cargarPerfilUsuario() {
    this.http.get('https://graph.microsoft.com/v1.0/me').subscribe((perfil: any) => {
      this.userName.set(perfil.displayName || perfil.givenName);
    });

    this.http.get('https://graph.microsoft.com/v1.0/me/photo/$value', { responseType: 'blob' })
      .pipe(
        map(blob => URL.createObjectURL(blob)),
        catchError(() => of(null))
      )
      .subscribe(fotoUrl => {
        if (fotoUrl) this.userPhoto.set(fotoUrl);
      });
  }

  private generarLogAuditoria(resultado: AuthenticationResult) {
    const auditEvent = {
      timestamp: new Date().toISOString(),
      eventType: 'AUTH_SUCCESS',
      identityProvider: 'Microsoft Entra ID',
      accountName: resultado.account.username,
      tenantId: resultado.account.tenantId,
      authMethod: 'OAuth2_AuthorizationCodeFlow',
      clientInfo: navigator.userAgent
    };
    console.info('[SECURITY LOG] Autenticación Exitosa:', JSON.stringify(auditEvent, null, 2));
  }
}