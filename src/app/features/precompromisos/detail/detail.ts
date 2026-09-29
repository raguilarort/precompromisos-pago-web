import { Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe, UpperCasePipe } from '@angular/common';
import { ESTATUS_PRECOMPROMISO } from '../../../shared/constants/precompromiso-estatus.constants';
import { Permisos } from '../../../core/auth/permisos';
import { Precompromiso } from '../services/precompromiso';
import { PrecompromisoDetailView } from '../models/precompromiso-detail.dto';
import { SeguimientoOperativo } from '../components/seguimiento-operativo/seguimiento-operativo';
import { ClavePresupuestaria } from '../../presupuesto/claves-presupuestarias/services/clave-presupuestaria';
import { ModalMotivoAccion, ModalMotivoResult } from '../components/modal-motivo-accion/modal-motivo-accion';

@Component({
  selector: 'app-detail',
  imports: [RouterLink, CurrencyPipe, UpperCasePipe, SeguimientoOperativo, ModalMotivoAccion],
  templateUrl: './detail.html',
  styleUrl: './detail.css',
})
export class Detail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private precompromisoService = inject(Precompromiso);
  private clavePresupuestariaService = inject(ClavePresupuestaria);

  @ViewChild('modalDinamico') modalDinamico!: ModalMotivoAccion;

  // 1. Exponemos la constante importada para que el HTML pueda leerla
  readonly ESTATUS = ESTATUS_PRECOMPROMISO;
  catalogoEstatus = signal<any[]>([]);

  // Guardamos el ID para inyectarlo en el componente de seguimiento
  idPrecompromiso = signal<number>(0);

  permisos = inject(Permisos);
  // Signal para almacenar los datos del precompromiso
  registro = signal<PrecompromisoDetailView | undefined>(undefined);
  // NUEVO: Señal para el botón de refresco
  // NUEVO: En lugar de un booleano, guardamos el índice del concepto que está cargando
  actualizandoConcepto = signal<number | null>(null);

   // NUEVO: Signals para manejar el estado de carga
  cargando = signal<boolean>(true);
  mensajeCarga = signal<string>('Inicializando...');
  mensajeError = signal<string | null>(null);
  mensajeAlerta = signal<string | null>(null);
  mensajeExito = signal<string | null>(null);

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.cargando.set(true);
      this.mensajeCarga.set('Consultando información del precompromiso...');

      this.idPrecompromiso.set(Number(idParam));

      this.precompromisoService.obtenerPorId(this.idPrecompromiso()).subscribe({
        next: (registro) => {
          console.log(registro);

          this.cargarRegistro(registro);

          this.cargando.set(false);
        },
        error: (err) => {
          console.error('Error al recuperar el precompromiso:', err);
          this.mostrarAlerta('Error al recuperar el precompromiso.', 'danger');
          this.cargando.set(false);
        }
      });
    } else {
      this.cargando.set(false);
    }
  }

  // 4. FUNCIÓN TRADUCTORA PARA EL HTML
  obtenerNombreEstatus(idEstatus: number): string {

    const entrada = Object.entries(this.ESTATUS).find(([llave, valor]) => valor === idEstatus);
    return entrada ? entrada[0] : 'DESCONOCIDO';
  }

  suficienciaPresupuestal = computed(() => {
    const data = this.registro();
    // Ajusta la ruta a 'data.conceptos' si usas la estructura plana que definimos previamente
    if (!data?.conceptos) return false;

    return data.conceptos.every((concepto: any) => 
      concepto.meses ? concepto.meses.every((mes: any) => mes.haySuficiencia !== false) : true
    );
  });

  refrescarSuficiencia(concepto: any, event: Event, index: number) {
    event.stopPropagation(); 
    
    const idClave = concepto.idClavePresupuestaria;

    if (!idClave) {
      this.mostrarAlerta('El concepto no tiene una clave presupuestaria asociada.', 'warning');
      return;
    }

    this.actualizandoConcepto.set(index);

    this.clavePresupuestariaService.consultarDisponibilidadPorId(idClave).subscribe({
      next: (saldosActualizados: any) => {
        console.log(saldosActualizados);
        
        // 1. Actualizamos nuestro arreglo de la vista ('meses')
        if (concepto.meses) {
          concepto.meses.forEach((mes: any) => {
            // El backend devuelve 'importeEnero', 'importeFebrero', etc.
            const nombrePropiedad = `disponible${mes.nombre}`; 
            
            // Asignamos el disponible real que trajo la base de datos
            mes.disponible = Number(saldosActualizados[nombrePropiedad]) || 0;
            
            // Evaluamos la regla de negocio para saber si el mes se pinta rojo o verde
            mes.haySuficiencia = mes.disponible >= mes.importe;
          });
        }
        
        // 2. Truco Reactivo: Clonamos el registro para forzar a Angular a re-evaluar la UI
        // Esto disparará automáticamente el computed 'suficienciaPresupuestal()'
        this.registro.set({ ...this.registro()! });
        
        this.actualizandoConcepto.set(null);
        this.mostrarAlerta(`Saldos del Concepto #${index + 1} actualizados.`, 'success');
      },
      error: (err) => {
        console.error(err);
        this.actualizandoConcepto.set(null);
        const msjError = err.error?.mensaje || 'Ocurrió un error al actualizar los saldos.';
        this.mostrarAlerta(msjError, 'danger');
      }
    });
  }

  cargarRegistro(registro: any) {
    let granTotal = 0;

    // Iteramos los conceptos para armar el arreglo 'meses' y calcular su total individual
    registro.conceptos.forEach((concepto: any) => {
      const claveProg = concepto.claveProgramatica;
      const claveUnidad = registro.unidad;
      const claveEstado = "09";
      const claveAmbito = "1";
      const clavePartida = concepto.partidaEspecifica;
      const claveFF = concepto.idFuenteFinanciamiento;

      concepto.clavePresupuestariaFormateada = `${claveProg}-${claveUnidad}-${claveEstado}-${claveAmbito}-${clavePartida}-${claveFF}`;

      const sumatoriaConcepto = 
        (concepto.importeEnero || 0) + (concepto.importeFebrero || 0) + 
        (concepto.importeMarzo || 0) + (concepto.importeAbril || 0) + 
        (concepto.importeMayo || 0) + (concepto.importeJunio || 0) + 
        (concepto.importeJulio || 0) + (concepto.importeAgosto || 0) + 
        (concepto.importeSeptiembre || 0) + (concepto.importeOctubre || 0) + 
        (concepto.importeNoviembre || 0) + (concepto.importeDiciembre || 0);

      concepto.importeTotal = sumatoriaConcepto;
      granTotal += sumatoriaConcepto;

      // Armamos el arreglo iterable para el HTML
      concepto.meses = [
        { nombre: 'Enero', importe: concepto.importeEnero || 0, disponible: 0, haySuficiencia: true },
        { nombre: 'Febrero', importe: concepto.importeFebrero || 0, disponible: 0, haySuficiencia: true },
        { nombre: 'Marzo', importe: concepto.importeMarzo || 0, disponible: 0, haySuficiencia: true },
        { nombre: 'Abril', importe: concepto.importeAbril || 0, disponible: 0, haySuficiencia: true },
        { nombre: 'Mayo', importe: concepto.importeMayo || 0, disponible: 0, haySuficiencia: true },
        { nombre: 'Junio', importe: concepto.importeJunio || 0, disponible: 0, haySuficiencia: true },
        { nombre: 'Julio', importe: concepto.importeJulio || 0, disponible: 0, haySuficiencia: true },
        { nombre: 'Agosto', importe: concepto.importeAgosto || 0, disponible: 0, haySuficiencia: true },
        { nombre: 'Septiembre', importe: concepto.importeSeptiembre || 0, disponible: 0, haySuficiencia: true },
        { nombre: 'Octubre', importe: concepto.importeOctubre || 0, disponible: 0, haySuficiencia: true },
        { nombre: 'Noviembre', importe: concepto.importeNoviembre || 0, disponible: 0, haySuficiencia: true },
        { nombre: 'Diciembre', importe: concepto.importeDiciembre || 0, disponible: 0, haySuficiencia: true },
      ];
    });

    // Asignamos el gran total al nivel padre (Requisición)
    registro.importeTotalRequisicion = granTotal;

    // Finalmente, guardamos el registro procesado en la señal
    this.registro.set(registro);
    
    // Disparamos la verificación de suficiencia de forma automática al cargar
    this.registro()?.conceptos.forEach((c: any, index: number) => {
        this.refrescarSuficiencia(c, new Event('load'), index);
    });
  }

  // ==========================================
  // WORKFLOW (MÁQUINA DE ESTADOS)
  // ==========================================

  darVistoBueno() {
    this.cargando.set(true);
    this.mensajeCarga.set('Aplicando Visto Bueno...');
    
    this.precompromisoService.darVistoBueno(this.idPrecompromiso()).subscribe({
      next: (res) => {
        this.mostrarAlerta(res.mensaje || 'Visto bueno aplicado', 'success');
        setTimeout(() => this.router.navigate(['/home/precompromisos/list']), 1500);
      },
      error: (err) => {
        this.cargando.set(false);
        this.mostrarAlerta(err.error?.mensaje || 'Error al aplicar visto bueno', 'danger');
      }
    });
  }

  autorizar() {
    this.cargando.set(true);
    this.mensajeCarga.set('Autorizando Presupuesto...');

    this.precompromisoService.autorizar(this.idPrecompromiso()).subscribe({
      next: (res) => {
        this.mostrarAlerta(res.mensaje || 'Precompromiso Autorizado', 'success');
        setTimeout(() => this.router.navigate(['/home/precompromisos/list']), 1500);
      },
      error: (err) => {
        this.cargando.set(false);
        this.mostrarAlerta(err.error?.mensaje || 'Error al autorizar precompromiso', 'danger');
      }
    });
  }

  rechazar(motivo: string) {
    // Ya no usamos prompt(); el motivo viene del modal
    console.log('Rechazado por:', motivo);
    this.cargando.set(true);
    this.mensajeCarga.set('Registrando rechazo...');
    
    this.precompromisoService.rechazar(this.idPrecompromiso(), motivo).subscribe({
      next: (data: any) => {
        this.mostrarAlerta(data.mensaje || 'Precompromiso rechazado exitosamente', 'success');
        setTimeout(() => this.router.navigate(['/home/precompromisos/list']), 1500);
      },
      error: (err: any) => {
        this.cargando.set(false);
        this.mostrarAlerta(err.error?.mensaje || 'Error al rechazar el precompromiso', 'danger');
      }
    });
  }

  cancelar(motivo: string) {
    // Conservamos tu confirm original
    const confirmacion = confirm('¿Está seguro de que desea cancelar este precompromiso autorizado? Esta acción no se puede deshacer.');

    if (confirmacion) {
      this.cargando.set(true);
      this.mensajeCarga.set('Cancelando precompromiso...');
      
      this.precompromisoService.cancelar(this.idPrecompromiso(), motivo).subscribe({
        next: (data: any) => {
          this.mostrarAlerta(data.mensaje || 'Precompromiso cancelado exitosamente', 'success');
          setTimeout(() => this.router.navigate(['/home/precompromisos/list']), 1500);
        },
        error: (err: any) => {
          this.cargando.set(false);
          this.mostrarAlerta(err.error?.mensaje || 'Error en el servidor.', 'danger');
        }
      });
    }
  }

  eliminar(motivo: string) {
    // Conservamos tu confirm original
    if (confirm('¿Está seguro de que desea eliminar este precompromiso de forma permanente? Esta acción no se puede deshacer.')) {
      this.cargando.set(true);
      this.mensajeCarga.set('Eliminando registro...');

      this.precompromisoService.eliminar(this.idPrecompromiso(), motivo).subscribe({
        next: (data: any) => {
          this.mostrarAlerta(data.mensaje || 'Precompromiso eliminado exitosamente', 'success');
          setTimeout(() => this.router.navigate(['/home/precompromisos/list']), 1500);
        },
        error: (err: any) => {
          this.cargando.set(false);
          this.mostrarAlerta(err.error?.mensaje || 'Error en el servidor.', 'danger');
        }
      });
    }
  }

  procesarAccionModal(evento: ModalMotivoResult) {
    if (evento.accion === 'RECHAZAR') {
      this.rechazar(evento.motivo);
    } else if (evento.accion === 'CANCELAR') {
      this.cancelar(evento.motivo);
    } else if (evento.accion === 'ELIMINAR') {
      this.eliminar(evento.motivo); 
    }
  }

  mostrarAlerta(mensaje: string, tipo: 'success'|'danger'|'warning') {
    const signalMap = {
      success: this.mensajeExito,
      danger: this.mensajeError,
      warning: this.mensajeAlerta
    };

    const targetSignal = signalMap[tipo];
    
    targetSignal.set(mensaje);
    setTimeout(() => targetSignal.set(null), 4000);
  }
}