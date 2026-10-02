import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SituacionPresupuestalAnualPorClaveDTO } from '../models/situacion-presupuestal-anual-clave.dto';
import { ReportesPresupuestales } from '../services/reportes-presupuestales';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-situacion-presupuestal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './situacion-presupuestal.html',
  styleUrl: './situacion-presupuestal.css',
})
export class SituacionPresupuestal implements OnInit {
  private reportesPresupuestalesService = inject(ReportesPresupuestales);

  ejercicio = signal<number>(new Date().getFullYear());
  cargando = signal<boolean>(true);
  error = signal<string | null>(null);
  datosRaw = signal<SituacionPresupuestalAnualPorClaveDTO[]>([]);
  
  textoBusqueda = signal<string>('');
  tabActiva = signal<'GRP' | 'PRECOMP' | 'NETO'>('NETO');
  
  meses = [
    { id: 'Enero', nombre: 'Ene' }, { id: 'Febrero', nombre: 'Feb' }, { id: 'Marzo', nombre: 'Mar' },
    { id: 'Abril', nombre: 'Abr' }, { id: 'Mayo', nombre: 'May' }, { id: 'Junio', nombre: 'Jun' },
    { id: 'Julio', nombre: 'Jul' }, { id: 'Agosto', nombre: 'Ago' }, { id: 'Septiembre', nombre: 'Sep' },
    { id: 'Octubre', nombre: 'Oct' }, { id: 'Noviembre', nombre: 'Nov' }, { id: 'Diciembre', nombre: 'Dic' }
  ];

  datosFiltrados = computed(() => {
    const busqueda = this.textoBusqueda().toLowerCase().trim();
    if (!busqueda) return this.datosRaw();

    return this.datosRaw().filter(item => {
      const cadena = `${item.clavePresupuestariaFormateada} ${item.descUnidad} ${item.descPrograma} ${item.descPartida} ${item.descFuente}`.toLowerCase();
      return cadena.includes(busqueda);
    });
  });

  kpiTotalDisponibleSAPFIN = computed(() => this.datosFiltrados().reduce((acc, row) => acc + (row.totalDisponibleSAPFIN || 0), 0));
  kpiTotalPrecomprometido = computed(() => this.datosFiltrados().reduce((acc, row) => acc + (row.totalPrecomprometido || 0), 0));
  kpiTotalDisponibleNeto = computed(() => this.datosFiltrados().reduce((acc, row) => acc + (row.totalDisponibleNeto || 0), 0));

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando.set(true);
    this.error.set(null);
    
    this.reportesPresupuestalesService.obtenerReporteSituacionPresupuestalAnual(this.ejercicio()).subscribe({
      next: (res: SituacionPresupuestalAnualPorClaveDTO[]) => {
        this.datosRaw.set(res);
        this.cargando.set(false);
      },
      error: (err: any) => {
        console.error(err);
        // Atrapamos el mensaje estructurado de la excepción que hicimos en Java
        this.error.set(err.error?.mensaje || 'Ocurrió un error al cargar el reporte.');
        this.cargando.set(false);
      }
    });
  }

  obtenerMontoCelda(fila: any, mesId: string): number {
    if (this.tabActiva() === 'GRP') return fila[`disponibleSAPFIN${mesId}`];
    if (this.tabActiva() === 'PRECOMP') return fila[`precomprometido${mesId}`];
    return fila[`disponibleNeto${mesId}`] ?? fila[`disponibleNeto${mesId}`] ?? 0;
  }

  obtenerTotalFila(fila: SituacionPresupuestalAnualPorClaveDTO): number {
    if (this.tabActiva() === 'GRP') return fila.totalDisponibleSAPFIN;
    if (this.tabActiva() === 'PRECOMP') return fila.totalPrecomprometido;
    return fila.totalDisponibleNeto ?? fila.totalDisponibleNeto ?? 0;
  }

  exportarExcel() {
    if (!this.datosFiltrados() || this.datosFiltrados().length === 0) {
      return; 
    }

    const prefijo = this.tabActiva() === 'GRP' ? 'Disponible' :
                    this.tabActiva() === 'PRECOMP' ? 'Precomprometido' : 'Neto';

    const datosExcel = this.datosFiltrados().map(fila => {
      const filaExportar: any = {
        'Clave Presupuestaria': fila.clavePresupuestariaFormateada,
        'Unidad Ejecutora': fila.descUnidad,
        'Programa': fila.descPrograma,
        'Partida': fila.descPartida,
        'Fuente de Financiamiento': fila.descFuente,
        'Total Anual': this.obtenerTotalFila(fila)
      };

      this.meses.forEach(mes => {
        filaExportar[`${mes.id} (${prefijo})`] = this.obtenerMontoCelda(fila, mes.id);
      });

      return filaExportar;
    });

    const hojaDeCalculo = XLSX.utils.json_to_sheet(datosExcel);
    const libroDeTrabajo = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeCalculo, 'Situacion_Presupuestal');

    // --- GENERACIÓN DE LA ESTAMPA DE TIEMPO (Formato: YYYYMMDD_HHMM) ---
    const ahora = new Date();
    const estampaTiempo = ahora.getFullYear().toString() +
                          (ahora.getMonth() + 1).toString().padStart(2, '0') +
                          ahora.getDate().toString().padStart(2, '0') + '_' +
                          ahora.getHours().toString().padStart(2, '0') +
                          ahora.getMinutes().toString().padStart(2, '0');

    // Construcción del nombre: Ej. 20261001_1753_Situacion_Presupuestal_2026_Neto.xlsx
    const nombreArchivo = `${estampaTiempo}_Situacion_Presupuestal_${this.ejercicio()}_${prefijo}.xlsx`;
    
    XLSX.writeFile(libroDeTrabajo, nombreArchivo);
  }
}
