import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { Avisos } from '../avisos/avisos';
import { Auth } from '../../../../core/auth/services/auth';
import { ContextoGlobal } from '../../../../core/services/contexto-global';
import { Precompromiso } from '../../../precompromisos/services/precompromiso';
import { Permisos } from '../../../../core/auth/permisos';
import { RouterModule } from '@angular/router';
import { ESTATUS_PRECOMPROMISO } from '../../../../shared/constants/precompromiso-estatus.constants';

@Component({
  selector: 'app-dashboard-ejecutivo',
  standalone: true,
  imports: [CommonModule, RouterModule, Avisos],
  templateUrl: './dashboard-ejecutivo.html',
  styleUrl: './dashboard-ejecutivo.css',
})
export class DashboardEjecutivo {
  readonly ESTATUS = ESTATUS_PRECOMPROMISO;
  private authService = inject(Auth);
  private contextoGlobal = inject(ContextoGlobal);
  private precompromisoService = inject(Precompromiso);
  public permisos = inject(Permisos);

  usuarioActivo = computed(() => this.authService.usuarioAutenticado());
  cargando = signal<boolean>(true); 
  
  // Lista raw de precompromisos de ese ejercicio para sus unidades
  todosLosPrecompromisos = signal<any[]>([]);
  
  // 1. Tareas pendientes del usuario activo
  tramitesPendientes = computed(() => {
    return this.todosLosPrecompromisos().filter(c => this.permisos.esPendienteParaMi(c.estatus));
  });

  // 2. Trámites globales aprobados este mes (Productividad)
  tramitesAprobados = computed(() => {
    const mesActual = new Date().getMonth();
    return this.todosLosPrecompromisos().filter(c => {
      // Suponiendo que el objeto tiene fechaAprobacion o fechaCreacion
      const fecha = c.fechaAprobacion ? new Date(c.fechaAprobacion) : null;
      return c.estatus === 'APROBADO' && fecha?.getMonth() === mesActual;
    }).length;
  });

  // 3. Trámites rechazados o en corrección (Cuellos de botella)
  tramitesRechazados = computed(() => {
    return this.todosLosPrecompromisos().filter(c => c.estatus === 'RECHAZADO' || c.estatus === 'CANCELADO').length;
  });

  constructor() {
    effect(() => {
      const ejercicio = this.contextoGlobal.ejercicioFiscal();
      this.cargarBandeja(ejercicio);
    });
  }

  obtenerNombreEstatus(idEstatus: number): string {

    const entrada = Object.entries(this.ESTATUS).find(([llave, valor]) => valor === idEstatus);
    return entrada ? entrada[0] : 'DESCONOCIDO';
  }

  private cargarBandeja(ejercicio: number) {
    this.cargando.set(true);
    // El backend debe filtrar internamente por las unidades del usuario usando su token
    this.precompromisoService.consultarPorEjercicio(ejercicio).subscribe({
      next: (data) => {
        this.todosLosPrecompromisos.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar datos operativos:', err);
        this.cargando.set(false);
      }
    });
  }
}