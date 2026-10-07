import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { Router } from '@angular/router';
import * as bootstrap from 'bootstrap';
import { environment } from '../../../../environments/environment';

@Service()
export class SessionManager {
    private http = inject(HttpClient);
  private router = inject(Router);

  private timeoutAdvertencia: any;
  private timeoutExpiracion: any;
  
  // Señales para controlar la UI del Modal
  mostrarAlerta = signal<boolean>(false);
  minutosRestantes = signal<number>(5);

  iniciarMonitoreo(token: string) {
    this.detenerMonitoreo(); // Limpiar timers anteriores

    try {
      // 1. Decodificamos el payload del JWT
      const payload = JSON.parse(atob(token.split('.')[1]));
      // El 'exp' viene en segundos, lo pasamos a milisegundos
      const fechaExpiracion = payload.exp * 1000; 
      const tiempoRestanteMs = fechaExpiracion - Date.now();

      // Si ya expiró, no hacemos nada (el interceptor lo echará)
      if (tiempoRestanteMs <= 0) return;

      // 2. Calculamos cuándo mostrar la advertencia (5 minutos antes)
      const tiempoParaAdvertencia = tiempoRestanteMs - (5 * 60 * 1000);

      // 3. Programamos la aparición del Modal
      if (tiempoParaAdvertencia > 0) {
        this.timeoutAdvertencia = setTimeout(() => {
          this.abrirModalAdvertencia();
        }, tiempoParaAdvertencia);
      } else {
        // Si quedan menos de 5 minutos al iniciar sesión, mostrar de inmediato
        this.abrirModalAdvertencia();
      }

      // 4. Programamos el cierre de sesión forzado si el usuario ignoró el modal
      this.timeoutExpiracion = setTimeout(() => {
        this.cerrarModalAdvertencia();
        sessionStorage.clear();
        this.router.navigate(['/portal'], { queryParams: { session: 'expired' } });
      }, tiempoRestanteMs);

    } catch (e) {
      console.error('Error al leer el token JWT', e);
    }
  }

  detenerMonitoreo() {
    clearTimeout(this.timeoutAdvertencia);
    clearTimeout(this.timeoutExpiracion);
  }

  private abrirModalAdvertencia() {
    this.mostrarAlerta.set(true);
    const modalElement = document.getElementById('modalRenovarSesion');
    if (modalElement) {
      new bootstrap.Modal(modalElement).show();
    }
  }

  cerrarModalAdvertencia() {
    this.mostrarAlerta.set(false);
    const modalElement = document.getElementById('modalRenovarSesion');
    if (modalElement) {
      bootstrap.Modal.getInstance(modalElement)?.hide();
    }
  }

  renovarSesion() {
    // Llamamos al backend para obtener un nuevo token
    this.http.post<any>(`${environment.apiUrl}/auth/refresh`, {}).subscribe({
      next: (response) => {
        // Guardamos el nuevo token
        sessionStorage.setItem('accessToken', response.token);
        this.cerrarModalAdvertencia();
        // Reiniciamos el cronómetro con el nuevo token
        this.iniciarMonitoreo(response.token); 
      },
      error: () => {
        // Si falla la renovación, cerramos sesión
        this.cerrarModalAdvertencia();
        sessionStorage.clear();
        this.router.navigate(['/portal'], { queryParams: { session: 'expired' } });
      }
    });
  }
}
