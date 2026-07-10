import { Injectable, inject, signal } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { HttpClient } from '@angular/common/http';
import { AuthenticationResult } from '@azure/msal-browser';
import { Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private msalService = inject(MsalService);
  private http = inject(HttpClient);
  private router = inject(Router);

  // Señales reactivas para actualizar el Navbar
  userName = signal<string>('Usuario');
  userPhoto = signal<string | null>(null);

  iniciarSesion() {
    this.msalService.loginRedirect({
      scopes: ['user.read']
    });
  }

  cerrarSesion() {
    this.msalService.logoutRedirect({
      postLogoutRedirectUri: window.location.origin
    });
  }

  procesarRespuestaLogin() {
    this.msalService.handleRedirectObservable().subscribe({
      // 1. Aceptamos tanto AuthenticationResult como null en la firma
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
          const cuentaActiva = this.msalService.instance.getActiveAccount();
          if (!cuentaActiva && this.msalService.instance.getAllAccounts().length > 0) {
            this.msalService.instance.setActiveAccount(this.msalService.instance.getAllAccounts()[0]);
            this.cargarPerfilUsuario();
            
            // Lo enviamos al home si está intentando acceder a la raíz teniendo sesión
            if (this.router.url === '/portal' || this.router.url === '/') {
              this.router.navigate(['/home']);
            }
          }
        }
      },
      error: (error) => console.error('Error en autenticación:', error)
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