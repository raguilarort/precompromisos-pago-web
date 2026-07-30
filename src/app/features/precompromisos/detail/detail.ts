import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe, UpperCasePipe } from '@angular/common';
import { Permisos } from '../../../core/auth/permisos';
import { PrecompromisoService } from '../services/precompromisos/precompromisos';
import { Precompromiso } from '../models/precompromiso.model';

@Component({
  selector: 'app-detail',
  imports: [RouterLink, CurrencyPipe, DatePipe, UpperCasePipe],
  templateUrl: './detail.html',
  styleUrl: './detail.css',
})
export class Detail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private precompromisoService = inject(PrecompromisoService);

  permisos = inject(Permisos);
  // Signal para almacenar los datos del precompromiso
  registro = signal<Precompromiso | undefined>(undefined);
  // NUEVO: Señal para el botón de refresco
  actualizandoPresupuesto = signal<boolean>(false);

   // NUEVO: Signals para manejar el estado de carga
  cargando = signal<boolean>(true);
  mensajeCarga = signal<string>('Inicializando...');

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      // Iniciamos el estado de carga
      this.cargando.set(true);
      this.mensajeCarga.set('Consultando información del precompromiso...');

      // Simulamos la latencia de la base de datos (ej. 800ms)
      setTimeout(() => {
        // Convertimos el ID de la ruta (string) a número para buscarlo
        const data = this.precompromisoService.obtenerPorId(Number(idParam));

        if (data && !data.historial) {
          data.historial = [
            { estatus: 'Capturado', fecha: '2026-07-28T09:15:00', usuario: 'Usuario Sistema' }
          ];

          // 3. MAPEO PARA LA VISTA: Convertimos las propiedades planas en el arreglo "meses"
          data.requisicion.conceptos.forEach(concepto => {
            concepto.meses = [
              // Para pruebas, forzamos haySuficiencia a true. 
              // Más adelante, aquí cruzarás el dato con tu consulta de presupuesto disponible.
              // Agregamos el nombre completo y una propiedad 'disponible' simulada para evaluar colores
              { nombre: 'Enero', importe: concepto.importeEnero, disponible: 0, haySuficiencia: true },
              { nombre: 'Febrero', importe: concepto.importeFebrero, disponible: 0, haySuficiencia: true },
              { nombre: 'Marzo', importe: concepto.importeMarzo, disponible: 0, haySuficiencia: true },
              { nombre: 'Abril', importe: concepto.importeAbril, disponible: 0, haySuficiencia: true },
              { nombre: 'Mayo', importe: concepto.importeMayo, disponible: 0, haySuficiencia: true },
              { nombre: 'Junio', importe: concepto.importeJunio, disponible: 0, haySuficiencia: true },
              { nombre: 'Julio', importe: concepto.importeJulio, disponible: 0, haySuficiencia: true },
              { nombre: 'Agosto', importe: concepto.importeAgosto, disponible: 0, haySuficiencia: true },
              { nombre: 'Septiembre', importe: concepto.importeSeptiembre, disponible: 0, haySuficiencia: true },
              { nombre: 'Octubre', importe: concepto.importeOctubre, disponible: 0, haySuficiencia: true },
              { nombre: 'Noviembre', importe: concepto.importeNoviembre, disponible: 0, haySuficiencia: true },
              { nombre: 'Diciembre', importe: concepto.importeDiciembre, disponible: 0, haySuficiencia: true },
            ];
          });
        }
        

        this.registro.set(data);

        // Finalizamos la carga
        this.cargando.set(false);
      }, 800);
    } else {
      this.cargando.set(false);
    }
  }

  suficienciaPresupuestal = computed(() => {
    const data = this.registro();
    if (!data?.requisicion?.conceptos) return false;

    return data.requisicion.conceptos.every(concepto => 
      concepto.meses ? concepto.meses.every(mes => mes.haySuficiencia !== false) : true
    );
  });

  refrescarSuficiencia(concepto: any, event: Event) {
    // Evitamos que el clic en el botón expanda/colapse el acordeón
    event.stopPropagation(); 
    
    this.actualizandoPresupuesto.set(true);

    // Simulamos la llamada a la API que consulta el saldo real
    setTimeout(() => {
      // Aquí iría tu servicio: this.presupuestoService.consultarDisponible(concepto.idCvePresupuestaria)
      if (concepto.meses) {
        concepto.meses.forEach((mes: any) => {
          // Simulamos que el presupuesto disponible bajó o se actualizó
          mes.disponible = Math.floor(Math.random() * 60000) + 10000; 
          // Re-evaluamos la bandera
          mes.haySuficiencia = mes.disponible >= mes.importe;
        });
      }
      
      // Forzamos la actualización de la señal principal para que Angular detecte el cambio profundo
      this.registro.set({ ...this.registro()! });
      
      this.actualizandoPresupuesto.set(false);
    }, 600);
  }

  // ==========================================
  // WORKFLOW (MÁQUINA DE ESTADOS)
  // ==========================================

  darVistoBueno() {
    console.log('Emitiendo Visto Bueno...');
    this.router.navigate(['/home/precompromisos/list']);
  }

  autorizar() {
    console.log('Autorizando precompromiso...');
    this.router.navigate(['/home/precompromisos/list']);
  }

  rechazar() {
    const motivo = prompt('Por favor, ingrese el motivo del rechazo:');
    if (motivo) {
      console.log('Rechazado por:', motivo);
      this.router.navigate(['/home/precompromisos/list']);
    }
  }

  cancelar() {
    const confirmacion = confirm('¿Está seguro que desea CANCELAR este folio autorizado?');
    if (confirmacion) {
      console.log('Cancelando folio...');
      this.router.navigate(['/home/precompromisos/list']);
    }
  }

  eliminar() {
    const confirmacion = confirm('¿Eliminar definitivamente este registro?');
    if (confirmacion) {
      console.log('Registro eliminado.');
      this.router.navigate(['/home/precompromisos/list']);
    }
  }
}