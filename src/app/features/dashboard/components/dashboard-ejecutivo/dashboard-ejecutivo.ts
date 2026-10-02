import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { Avisos } from '../avisos/avisos';
import { Auth } from '../../../../core/auth/services/auth';
import { ContextoGlobal } from '../../../../core/services/contexto-global';
import { Precompromiso } from '../../../precompromisos/services/precompromiso';
import { Permisos } from '../../../../core/auth/permisos';
import { Dashboard, DashboardKpisDTO } from '../../services/dashboard';

@Component({
  selector: 'app-dashboard-ejecutivo',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, Avisos],
  templateUrl: './dashboard-ejecutivo.html',
  styleUrl: './dashboard-ejecutivo.css',
})
export class DashboardEjecutivo {
  private authService = inject(Auth);
  private contextoGlobal = inject(ContextoGlobal);
  private dashboardService = inject(Dashboard);
  private precompromisoService = inject(Precompromiso);
  public permisos = inject(Permisos);

  // 1. CORRECCIÓN: Declaramos el usuario activo leyendo del AuthService
  usuarioActivo = computed(() => this.authService.usuarioAutenticado());

  // 2. CORRECCIÓN: Renombramos a 'cargando' para coincidir con el HTML
  cargando = signal<boolean>(true); 
  
  kpis = signal<DashboardKpisDTO>({ presupuestoGlobal: 0, enTramite: 0, disponibleNeto: 0 });
  todosLosPrecompromisos = signal<any[]>([]);
  
  tramitesPendientes = computed(() => {
    return this.todosLosPrecompromisos().filter(c => this.permisos.esPendienteParaMi(c.estatus));
  });

  constructor() {
    effect(() => {
      const ejercicio = this.contextoGlobal.ejercicioFiscal();
      const unidades = this.usuarioActivo()?.unidadesPermitidas || [];
      
      this.cargarMetricas(ejercicio, unidades);
      this.cargarBandeja(ejercicio);
    });
  }

  private cargarMetricas(ejercicio: number, unidades: number[]) {
    this.cargando.set(true);
    this.dashboardService.obtenerKpisEjecutivos(ejercicio, unidades).subscribe({
      next: (datos) => {
        this.kpis.set(datos);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al obtener KPIs:', err);
        this.cargando.set(false);
      }
    });
  }

  private cargarBandeja(ejercicio: number) {
    this.precompromisoService.consultarPorEjercicio(ejercicio).subscribe({
      next: (data) => this.todosLosPrecompromisos.set(data),
      error: (err) => console.error('Error al cargar bandeja:', err)
    });
  }
}