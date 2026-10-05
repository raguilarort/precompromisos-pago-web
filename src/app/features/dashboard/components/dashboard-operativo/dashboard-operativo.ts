import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { Avisos } from '../avisos/avisos';
import { Auth } from '../../../../core/auth/services/auth';
import { ContextoGlobal } from '../../../../core/services/contexto-global';
import { Precompromiso } from '../../../precompromisos/services/precompromiso';
import { RouterModule } from '@angular/router';
import { Permisos } from '../../../../core/auth/permisos';

@Component({
  selector: 'app-dashboard-operativo',
  standalone: true,
  imports: [CommonModule, RouterModule, Avisos],
  templateUrl: './dashboard-operativo.html',
  styleUrl: './dashboard-operativo.css',
})
export class DashboardOperativo {
  private contextoGlobal = inject(ContextoGlobal);
  private precompromisoService = inject(Precompromiso);

  permisos = inject(Permisos);

  cargando = signal<boolean>(true);
  todosLosPrecompromisos = signal<any[]>([]);

  // Filtramos la lista completa para mostrar solo el área de trabajo activa del capturista
  misBorradoresYRechazados = computed(() => {
    return this.todosLosPrecompromisos().filter(c => 
      c.estatus === 'BORRADOR' || c.estatus === 'RECHAZADO'
    );
  });

  constructor() {
    effect(() => {
      const ejercicio = this.contextoGlobal.ejercicioFiscal();
      this.cargarMisTramites(ejercicio);
    });
  }

  private cargarMisTramites(ejercicio: number) {
    this.cargando.set(true);
    // El backend ya debería estar filtrando internamente por el token de sesión del usuario
    this.precompromisoService.consultarPorEjercicio(ejercicio).subscribe({
      next: (data) => {
        this.todosLosPrecompromisos.set(data);
        console.log("HOLA HOLA");
        console.log(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al obtener lista operativa:', err);
        this.cargando.set(false);
      }
    });
  }
}
