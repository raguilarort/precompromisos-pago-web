// 1. Cambiamos la importación superior para usar provideBrowserGlobalErrorListeners
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { routes } from './app.routes';
import { environment } from '../environments/environment.development';

import { 
  MsalService, 
  MsalGuard, 
  MsalInterceptor, 
  MsalBroadcastService, 
  MSAL_INSTANCE, 
  MSAL_INTERCEPTOR_CONFIG, 
  MsalInterceptorConfiguration 
} from '@azure/msal-angular';
import { PublicClientApplication, InteractionType, LogLevel } from '@azure/msal-browser';

// 1. Configuración principal de la instancia MSAL
export function MSALInstanceFactory(): PublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: environment.msalConfig.clientId, 
      authority: environment.msalConfig.authority,
      redirectUri: environment.msalConfig.redirectUri,
    },
    cache: {
      cacheLocation: 'sessionStorage',
    },
    system: {
      loggerOptions: {
        loggerCallback: () => {},
        logLevel: LogLevel.Warning,
        piiLoggingEnabled: false
      }
    }
  });
}

// 2. Interceptor: inyecta el token automáticamente en peticiones a Microsoft Graph u otras APIs
export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>();
  protectedResourceMap.set('https://graph.microsoft.com/v1.0/me', ['user.read']);
  
  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap
  };
}

// 3. Registro Global de Proveedores
export const appConfig: ApplicationConfig = {
  providers: [
    // ¡Restauramos tu configuración original sin Zone.js!
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    
    // Proveedores obligatorios de MSAL
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    },
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService
  ]
};