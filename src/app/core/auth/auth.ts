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
          this.cargarDatosCuentaInstitucional();
          
          // Aquí ejecutamos la validación de la cuenta
          this.validarCuentaInstitucionalAutorizada(resultado.account.username);
        } else {
          // El usuario recargó la página (F5) o abrió una pestaña nueva
          this.restaurarSesionActiva();
        }
      },
      error: (error) => console.error('Error interno de MSAL:', error)
    });
  }

  // NUEVO MÉTODO: Reconstruye las Signals desde el caché local
  private restaurarSesionActiva() {
    let cuentaActiva = this.msalService.instance.getActiveAccount();
    const cuentas = this.msalService.instance.getAllAccounts();

    // Si MSAL perdió la cuenta activa en memoria, la recuperamos del listado de cuentas en caché
    if (!cuentaActiva && cuentas.length > 0) {
      cuentaActiva = cuentas[0];
      this.msalService.instance.setActiveAccount(cuentaActiva);
    }

    // Si logramos recuperar una cuenta, hidratamos la interfaz
    if (cuentaActiva) {
      // 1. Renderizado Inmediato: Usamos el nombre que viene encriptado en el token de sesión
      // Esto evita el parpadeo de "Usuario" a lo que tarda en responder Microsoft Graph.
      if (cuentaActiva.name) {
        this.userName.set(cuentaActiva.name);
      } else if (cuentaActiva.username) {
        this.userName.set(cuentaActiva.username);
      }

      // 2. Renderizado Secundario: Disparamos la petición a Graph de todos modos 
      // para obtener la fotografía (que no viene en el token) y afinar los apellidos.
      this.cargarDatosCuentaInstitucional();

      // Bloqueamos al usuario que presiona F5 si le quitaron los permisos
      this.validarCuentaInstitucionalAutorizada(cuentaActiva.username);
    }
  }

  // Agrega este método dentro de tu clase Auth
  private validarCuentaInstitucionalAutorizada(email: string) {
    this.mensajeCarga.set('Verificando permisos de acceso...');
    
    // SIMULACIÓN: Aquí irá tu llamada HTTP real:
    // return this.http.get<boolean>(`${environment.apiUrl}/usuarios/validar?email=${email}`);
    
    // Por ahora, simulamos que responde "true" o "false" de forma aleatoria para que lo pruebes:
    const esValido = false; // Cambia esto a false para probar la pantalla de error
    
    import('rxjs').then(({ of, delay }) => {
      of(esValido).pipe(delay(500)).subscribe(autorizado => {
        if (autorizado) {
          this.router.navigate(['/home']);
        } else {
          this.router.navigate(['/unauthorized']);
        }
      });
    });
  }

  private cargarDatosCuentaInstitucional() {
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