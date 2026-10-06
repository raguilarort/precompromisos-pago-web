import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { Avisos } from '../avisos/avisos';
import { ContextoGlobal } from '../../../../core/services/contexto-global';
import { Precompromiso } from '../../../precompromisos/services/precompromiso';
import { RouterModule } from '@angular/router';
import { Permisos } from '../../../../core/auth/permisos';
import { SeguimientoOperativo } from '../../../precompromisos/components/seguimiento-operativo/seguimiento-operativo';

import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-dashboard-operativo',
  standalone: true,
  imports: [CommonModule, RouterModule, Avisos, SeguimientoOperativo],
  templateUrl: './dashboard-operativo.html',
  styleUrl: './dashboard-operativo.css',
})
export class DashboardOperativo {
  private contextoGlobal = inject(ContextoGlobal);
  private precompromisoService = inject(Precompromiso);

  permisos = inject(Permisos);

  cargando = signal<boolean>(true);
  todosLosPrecompromisos = signal<any[]>([]);
  tramiteSeleccionadoParaModal = signal<number | null>(null);

  // Filtramos la lista completa para mostrar solo el área de trabajo activa del capturista
  misRechazados = computed(() => {
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
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al obtener lista operativa:', err);
        this.cargando.set(false);
      }
    });
  }

  abrirModalMotivo(idPrecompromiso: number) {
    this.tramiteSeleccionadoParaModal.set(idPrecompromiso);
    const modalElement = document.getElementById('modalMotivoRechazo');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  cerrarModal() {
    const modalElement = document.getElementById('modalMotivoRechazo');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      modal?.hide();
    }
    // Retrasamos la limpieza de la señal para que la animación del modal termine sin parpadeos
    setTimeout(() => this.tramiteSeleccionadoParaModal.set(null), 300);
  }
}
