import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Precompromiso } from '../../services/precompromiso';
import { SeguimientoOperativoDTO } from '../../models/seguimiento-operativo.dto';

@Component({
  selector: 'app-seguimiento-operativo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seguimiento-operativo.html',
  styleUrl: './seguimiento-operativo.css',
})
export class SeguimientoOperativo implements OnInit {
  @Input() idPrecompromiso!: number;
  
  // 'timeline' para vistas completas (Edición/Detalle), 'popover' para listados
  @Input() vista: 'timeline' | 'popover' = 'timeline'; 

  private precompromisoService = inject(Precompromiso);

  historial = signal<SeguimientoOperativoDTO[]>([]);
  cargando = signal<boolean>(true);
  error = signal<boolean>(false);

  get historialFiltrado() {
    if (this.vista === 'popover') {
      // Retorna solo el movimiento más reciente
      return this.historial().length > 0 ? [this.historial().filter(h => 
        h.tipoMovimiento === 'REGISTRO_INICIAL' || 
        h.tipoMovimiento === 'CAMBIO_ESTATUS'
      )[0]] : [];
    }
    // En modo 'timeline' (edición/detalle) retorna todo
    return this.historial();
  }

  ngOnInit(): void {
    if (this.idPrecompromiso) {
      this.cargarHistorial();
    }
  }

  cargarHistorial() {
    this.cargando.set(true);
    this.precompromisoService.obtenerSeguimiento(this.idPrecompromiso).subscribe({
      next: (data) => {
        console.log(data);
        this.historial.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar seguimiento:', err);
        this.error.set(true);
        this.cargando.set(false);
      }
    });
  }

  obtenerClaseEstatus(estatusDescripcion: string): string {
    const estatus = estatusDescripcion.toUpperCase();
    if (estatus.includes('CAPTURAD')) return 'bg-estatus-capturado';
    if (estatus.includes('REVISAD')) return 'bg-estatus-revisado';
    if (estatus.includes('AUTORIZAD') || estatus.includes('COMPROMETID')) return 'bg-estatus-autorizado';
    if (estatus.includes('CANCELAD')) return 'bg-estatus-cancelado';
    return 'bg-estatus-default';
  }

  
}
