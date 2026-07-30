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

          data.requisicion.conceptos.forEach(concepto => {
            concepto.meses = [
              // Para pruebas, forzamos haySuficiencia a true. 
              // Más adelante, aquí cruzarás el dato con tu consulta de presupuesto disponible.
              { nombre: 'Ene', importe: concepto.importeEnero, haySuficiencia: true },
              { nombre: 'Feb', importe: concepto.importeFebrero, haySuficiencia: true },
              { nombre: 'Mar', importe: concepto.importeMarzo, haySuficiencia: true },
              { nombre: 'Abr', importe: concepto.importeAbril, haySuficiencia: true },
              { nombre: 'May', importe: concepto.importeMayo, haySuficiencia: true },
              { nombre: 'Jun', importe: concepto.importeJunio, haySuficiencia: true },
              { nombre: 'Jul', importe: concepto.importeJulio, haySuficiencia: true },
              { nombre: 'Ago', importe: concepto.importeAgosto, haySuficiencia: true },
              { nombre: 'Sep', importe: concepto.importeSeptiembre, haySuficiencia: true },
              { nombre: 'Oct', importe: concepto.importeOctubre, haySuficiencia: true },
              { nombre: 'Nov', importe: concepto.importeNoviembre, haySuficiencia: true },
              { nombre: 'Dic', importe: concepto.importeDiciembre, haySuficiencia: true },
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