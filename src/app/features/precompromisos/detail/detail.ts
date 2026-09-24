import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe, UpperCasePipe } from '@angular/common';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { ESTATUS_PRECOMPROMISO } from '../../../shared/constants/precompromiso-estatus.constants';
import { Estatus } from '../../admin/catalogos/estatus/services/estatus';
import { Permisos } from '../../../core/auth/permisos';
import { Precompromiso } from '../services/precompromiso';
import { PrecompromisoDetailDTO, PrecompromisoDetailView } from '../models/precompromiso-detail.dto';
import { SeguimientoOperativo } from '../components/seguimiento-operativo/seguimiento-operativo';
import { ClavePresupuestaria } from '../../presupuesto/claves-presupuestarias/services/clave-presupuestaria';



@Component({
  selector: 'app-detail',
  imports: [RouterLink, CurrencyPipe, UpperCasePipe, ReactiveFormsModule, SeguimientoOperativo],
  templateUrl: './detail.html',
  styleUrl: './detail.css',
})
export class Detail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private precompromisoService = inject(Precompromiso);
  private estatusService = inject(Estatus);
  private clavePresupuestariaService = inject(ClavePresupuestaria);

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

  // 3. CONTROL REACTIVO PARA EL RECHAZO
  // Exigimos que sea obligatorio y tenga al menos 15 caracteres de longitud
  motivoRechazo = new FormControl('', [
    Validators.required, 
    Validators.minLength(15)
  ]);

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
    }   
    
    this.cargando.set(false);
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

    console.log(idClave);

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
        const msjError = err.error?.mensaje || 'Ocurrió un error al intentar actualizar los saldos.';
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