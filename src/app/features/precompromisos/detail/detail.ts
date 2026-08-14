import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe, UpperCasePipe } from '@angular/common';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { ESTATUS_PRECOMPROMISO } from '../../../shared/constants/precompromiso-estatus.constants';
import { Permisos } from '../../../core/auth/permisos';
import { PrecompromisoService } from '../services/precompromisos/precompromisos';
import { Precompromiso } from '../models/precompromiso.model';
import { Estatus } from '../../admin/catalogos/estatus/services/estatus';

@Component({
  selector: 'app-detail',
  imports: [RouterLink, CurrencyPipe, DatePipe, UpperCasePipe, ReactiveFormsModule],
  templateUrl: './detail.html',
  styleUrl: './detail.css',
})
export class Detail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private precompromisoService = inject(PrecompromisoService);
  private estatusService = inject(Estatus);

  // 1. Exponemos la constante importada para que el HTML pueda leerla
  readonly ESTATUS = ESTATUS_PRECOMPROMISO;

  catalogoEstatus = signal<any[]>([]);

  permisos = inject(Permisos);
  // Signal para almacenar los datos del precompromiso
  registro = signal<Precompromiso | undefined>(undefined);
  // NUEVO: Señal para el botón de refresco
  // NUEVO: En lugar de un booleano, guardamos el índice del concepto que está cargando
  actualizandoConcepto = signal<number | null>(null);

   // NUEVO: Signals para manejar el estado de carga
  cargando = signal<boolean>(true);
  mensajeCarga = signal<string>('Inicializando...');

  // 3. CONTROL REACTIVO PARA EL RECHAZO
  // Exigimos que sea obligatorio y tenga al menos 15 caracteres de longitud
  motivoRechazo = new FormControl('', [
    Validators.required, 
    Validators.minLength(15)
  ]);

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
              { nombre: 'Enero', importe: concepto.importeEnero, disponible: 0, haySuficiencia: false },
              { nombre: 'Febrero', importe: concepto.importeFebrero, disponible: 0, haySuficiencia: false },
              { nombre: 'Marzo', importe: concepto.importeMarzo, disponible: 0, haySuficiencia: false },
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

        

      }, 800);
    } else {
    }   

    this.estatusService.getCatalogoEstatus().subscribe(data => this.catalogoEstatus.set(data)); 
    
    this.cargando.set(false);
  }

  // 4. FUNCIÓN TRADUCTORA PARA EL HTML
  obtenerNombreEstatus(idEstatus: number): string {
    const estatus = this.catalogoEstatus().find(e => e.id === idEstatus);
    return estatus ? estatus.descripcion : 'DESCONOCIDO';
  }

  suficienciaPresupuestal = computed(() => {
    const data = this.registro();
    if (!data?.requisicion?.conceptos) return false;

    return data.requisicion.conceptos.every(concepto => 
      concepto.meses ? concepto.meses.every(mes => mes.haySuficiencia !== false) : true
    );
  });

  refrescarSuficiencia(concepto: any, event: Event, index: number) {
    event.stopPropagation(); 
    
    // Indicamos específicamente qué concepto (por su posición) inicia la carga
    this.actualizandoConcepto.set(index);

    setTimeout(() => {
      if (concepto.meses) {
        concepto.meses.forEach((mes: any) => {
          mes.disponible = Math.floor(Math.random() * 60000) + 10000; 
          mes.haySuficiencia = mes.disponible >= mes.importe;
        });
      }
      
      this.registro.set({ ...this.registro()! });
      
      // Limpiamos la señal al terminar
      this.actualizandoConcepto.set(null);
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

  // 4. MÉTODOS PARA EL MODAL DE RECHAZO
  abrirModalRechazo() {
    // Limpiamos controles y errores previos cada vez que se abre el modal
    this.motivoRechazo.reset();
  }

  confirmarRechazo() {
    if (this.motivoRechazo.invalid) {
      // Forzamos que se muestren los errores visuales si el usuario intenta saltar la validación
      this.motivoRechazo.markAsTouched();
      return;
    }

    const motivo = this.motivoRechazo.value;
    console.log('Precompromiso rechazado. Motivo capturado:', motivo);
    
    // Aquí conectarás con tu servicio: this.precompromisoService.rechazar(id, motivo).subscribe(...)
    
    // IMPORTANTE: Como usamos el atributo 'data-bs-dismiss' de Bootstrap en el HTML 
    // para cerrar el modal automáticamente si es válido, aquí solo hacemos la redirección.
    this.router.navigate(['/home/precompromisos/list']);
  }
}