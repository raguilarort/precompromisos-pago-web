import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { Avisos } from '../avisos/avisos';
import { Auth } from '../../../../core/auth/services/auth';
import { ContextoGlobal } from '../../../../core/services/contexto-global';
import { Precompromiso } from '../../../precompromisos/services/precompromiso';
import { Permisos } from '../../../../core/auth/permisos';
import { RouterModule } from '@angular/router';
import { ESTATUS_PRECOMPROMISO } from '../../../../shared/constants/precompromiso-estatus.constants';
import { Dashboard } from '../../services/dashboard';

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
  private dashboardService = inject(Dashboard);
  public permisos = inject(Permisos);

  usuarioActivo = computed(() => this.authService.usuarioAutenticado());
  cargando = signal<boolean>(true); 
  
  // Lista raw de precompromisos de ese ejercicio para sus unidades
  todosLosPrecompromisos = signal<any[]>([]);
  actividadReciente = signal<any[]>([]);

  constructor() {
    effect(() => {
      const ejercicio = this.contextoGlobal.ejercicioFiscal();
      
      this.cargarBandeja(ejercicio);
      this.cargarActividadReciente(ejercicio); // Nueva llamada
    });
  }
  
  // 1. Tareas pendientes del usuario activo
  // 1. Naranja (Pendientes)
  tramitesPendientes = computed(() => {
    return this.todosLosPrecompromisos().filter(c => this.permisos.esPendienteParaMi(c.estatus));
  });

  // 2. Verde (Aprobados del mes)
  tramitesAprobados = computed(() => {
    const mesActual = new Date().getMonth();

    return this.todosLosPrecompromisos().filter(c => {
      if (c.idEstatus !== ESTATUS_PRECOMPROMISO.AUTORIZADO) return false;
      const fechaRaw = c.fechaAprobacion || c.fechaCreacion || c.fechaRegistro;
      if (!fechaRaw) return true; 
      return new Date(fechaRaw).getMonth() === mesActual;
    }).length;
  });

  // 3. Amarillo (Rechazados)
  tramitesRechazados = computed(() => {
    return this.todosLosPrecompromisos().filter(c => c.estatus?.toUpperCase() === 'RECHAZADO').length;
  });

  // 4. Rojo (Cancelados)
  tramitesCancelados = computed(() => {
    return this.todosLosPrecompromisos().filter(c => c.estatus?.toUpperCase() === 'CANCELADO').length;
  });

  // 5. Gris (Eliminados)
  tramitesEliminados = computed(() => {
    return this.todosLosPrecompromisos().filter(c => c.estatus?.toUpperCase() === 'ELIMINADO').length;
  });

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

  private cargarActividadReciente(ejercicio: number) {
    this.dashboardService.obtenerActividadReciente(ejercicio).subscribe({
      next: (datos) => {
        console.log("consolelog");
        console.log(datos);
        this.actividadReciente.set(datos)
      },
      error: (err) => console.error('Error al cargar la actividad reciente:', err)
    });
  }
}