import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { AuthenticationResult, InteractionStatus, AccountInfo } from '@azure/msal-browser';
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
  // Inicia asumiendo que venimos de una redirección para proteger el parpadeo inicial
  mensajeCarga = signal<string | null>('Init...');

  // Señal computada: se recalcula sola cuando userName cambia
  userInitials = computed(() => {
    const nombreCompleto = this.userName().trim();
    if (!nombreCompleto) return 'U';
    
    const partes = nombreCompleto.split(' ');
    if (partes.length >= 2) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    }
    return nombreCompleto.substring(0, 2).toUpperCase();
  });

  iniciarSesion() {
    this.mensajeCarga.set('Redirigiendo a Microsoft Entra ID...');
    this.msalService.loginRedirect({
      scopes: ['user.read'],
      prompt: 'select_account' //Para que el usuario pueda seleccionar qué cuenta desea utilizar
    });
  }

  cerrarSesion() {
    const cuentaActiva = this.msalService.instance.getActiveAccount();

    if (cuentaActiva) {
      this.generarLogAuditoria('AUTH_LOGOUT', cuentaActiva);
    }
    
    this.msalService.logoutRedirect({
      postLogoutRedirectUri: window.location.origin
    });
  }

  procesarRespuestaLogin() {
    // 1. Escuchamos el estado interno de MSAL en tiempo real
    this.broadcastService.inProgress$.subscribe((status: InteractionStatus) => {
      // Si el estado no es 'None', significa que hay una redirección o validación en curso
      this.isAutenticando.set(status !== InteractionStatus.None);

      // Evaluamos en qué fase del flujo se encuentra MSAL
      if (status === InteractionStatus.HandleRedirect || status === InteractionStatus.Startup) {
        // El usuario viene de regreso con el token o la app está inicializando
        this.mensajeCarga.set('Validando credenciales...');
      } else if (status === InteractionStatus.None) {
        // No hay procesos pendientes, mostramos el botón
        this.mensajeCarga.set(null);
      }
    });

    // 2. Procesamos el token como lo veníamos haciendo
    this.msalService.handleRedirectObservable().subscribe({
      // Aceptamos tanto AuthenticationResult como null en la firma
      next: (resultado: AuthenticationResult | null) => {
        if (resultado !== null && resultado.account) {
          // Caso 1: Regresa de Microsoft Entra con un login exitoso
          this.msalService.instance.setActiveAccount(resultado.account);
          this.generarLogAuditoria('AUTH_LOGIN_SUCCESS', resultado.account);
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
      // Extraemos Nombre y Primer Apellido
      const nombre = perfil.givenName || '';
      // Si el surname trae varios apellidos, tomamos solo el primero
      const primerApellido = perfil.surname ? perfil.surname.split(' ')[0] : ''; 
      
      const nombreAjustado = `${nombre} ${primerApellido}`.trim() || perfil.displayName;
      this.userName.set(nombreAjustado);
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

  // Método ajustado para recibir el tipo de evento y la cuenta dinámicamente
  private generarLogAuditoria(tipoEvento: string, account: AccountInfo) {
    const auditEvent = {
      timestamp: new Date().toISOString(),
      eventType: tipoEvento,
      identityProvider: 'Microsoft Entra ID',
      accountName: account.username,
      tenantId: account.tenantId,
      authMethod: 'OAuth2_AuthorizationCodeFlow',
      clientInfo: navigator.userAgent
    };
    console.info(`[SECURITY LOG] ${tipoEvento}:`, JSON.stringify(auditEvent, null, 2));
  }
}