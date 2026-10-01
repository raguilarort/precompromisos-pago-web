import { Component, Input, ElementRef, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

declare var bootstrap: any;

// Interfaz para tipar estrictamente lo que recibe el componente
export interface MesSuficiencia {
  nombre: string;
  importe: number;          // Lo que el usuario quiere gastar
  disponibleGrp: number;    // Saldo real en SAPFIN
  precomprometido: number;  // Saldo apartado en la bolsa alterna
  disponibleNeto: number;   // Calculado: GRP - Precomprometido
  haySuficiencia: boolean;  // Calculado: Neto >= Importe
}

@Component({
  selector: 'app-desglose-saldo',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './desglose-saldo.html',
  styleUrl: './desglose-saldo.css',
})
export class DesgloseSaldoComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) mes!: MesSuficiencia;
  
  private popoverInstance: any;
  private el = inject(ElementRef);
  private currencyPipe = new CurrencyPipe('es-MX'); // Ajusta a 'es-MX' si tu app está regionalizada

  ngAfterViewInit() {
    // Retraso de 100ms para asegurar que Angular ya pinto el HTML
    setTimeout(() => {
      const popoverTriggerEl = this.el.nativeElement.querySelector('[data-bs-toggle="popover"]');
      
      if (popoverTriggerEl && typeof bootstrap !== 'undefined') {
        this.popoverInstance = new bootstrap.Popover(popoverTriggerEl, {
          html: true,
          sanitize: false, 
          trigger: 'hover focus',
          content: () => this.generarContenidoPopover()
        });
      }
    }, 100);
  }

  ngOnDestroy() {
    // Destruimos la instancia para evitar fugas de memoria (memory leaks) al cambiar de página
    if (this.popoverInstance) {
      this.popoverInstance.dispose();
    }
  }

  /**
   * Genera el HTML que se inyectará dentro de la burbuja del Popover
   */
  private generarContenidoPopover(): string {
    const grpStr = this.currencyPipe.transform(this.mes.disponibleGrp, 'MXN') || '$0.00';
    const precompStr = this.currencyPipe.transform(this.mes.precomprometido, 'MXN') || '$0.00';
    const netoStr = this.currencyPipe.transform(this.mes.disponibleNeto, 'MXN') || '$0.00';

    return `
      <div class="small" style="min-width: 180px;">
        <div class="d-flex justify-content-between mb-1 text-muted">
          <span>Disponible (SAPFIN):</span>
          <span class="fw-bold">${grpStr}</span>
        </div>
        <div class="d-flex justify-content-between mb-1 text-danger border-bottom pb-1">
          <span>Precomprometido:</span>
          <span class="fw-bold">-${precompStr}</span>
        </div>
        <div class="d-flex justify-content-between text-success mt-1">
          <span class="fw-bold">Neto Disponible:</span>
          <span class="fw-bold">${netoStr}</span>
        </div>
      </div>
    `;
  }
}
