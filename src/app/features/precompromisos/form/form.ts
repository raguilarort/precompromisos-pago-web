import { Component, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { PrecompromisoService } from '../services/precompromisos/precompromisos';
import { Precompromiso } from '../models/precompromiso.model';
import { FiltrarCatalogoPipe } from '../../../shared/pipes/filtrar-catalogo-pipe';

import { Estatus } from '../../admin/catalogos/estatus/services/estatus';
import { UnidadEjecutora } from '../../admin/catalogos/unidades-ejecutoras/services/unidad-ejecutora';
import { TipoAdquisicion } from '../../admin/catalogos/tipos/adquisiciones/services/tipo-adquisicion';
import { TipoRequerimiento } from '../../admin/catalogos/tipos/requerimientos/services/tipo-requerimiento';
import { ClaveProgramatica } from '../../admin/catalogos/claves-programaticas/services/clave-programatica';
import { Partida } from '../../admin/catalogos/partidas/services/partida';
import { FuenteFinanciamiento } from '../../admin/catalogos/fuentes-financiamiento/services/fuente-financiamiento';
import { ClavePresupuestaria } from '../../presupuesto/claves-presupuestarias/services/clave-presupuestaria';

import { FiltroCombinacionEUPPFFDTO } from '../../presupuesto/claves-presupuestarias/model/filtro-clave-presupuestaria.dto';

@Component({
  selector: 'app-form',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, NgSelectModule, FiltrarCatalogoPipe, NgxMaskDirective],
  providers: [provideNgxMask()],
  templateUrl: './form.html',
  styleUrl: './form.css',
})
export class Form implements OnInit {
  private fb = inject(FormBuilder);
  private precompromisoService = inject(PrecompromisoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  //#region Inyección de servicios de catálogos
  private estatusService = inject(Estatus);
  private unidadEjecutoraService = inject(UnidadEjecutora);
  private tipoContratacionService = inject(TipoAdquisicion);
  private tipoRequerimientoService = inject(TipoRequerimiento);
  private claveProgramaticaService = inject(ClaveProgramatica);
  private partidaService = inject(Partida);
  private fuenteService = inject(FuenteFinanciamiento);
  private clavePresupuestariaService = inject(ClavePresupuestaria);
  //#endregion

  esEdicion = false;
  idPrecompromiso?: number;
  activeTab = 'generales'; // Control del formulario dividido

  // NUEVO: Signals para manejar el estado de carga
  cargando = signal<boolean>(true);
  mensajeAlerta = signal<string | null>(null);
  mensajeExito = signal<string | null>(null);

  //#region Signals para los catálogos
  catalogoEstatus = signal<any[]>([]);
  catalogoUnidadesEjecutoras = signal<any[]>([]);
  catalogoTiposContratacion = signal<any[]>([]);
  catalogoTiposRequerimiento = signal<any[]>([]);
  catalogoPartidasEspecificas = signal<any[]>([]);
  catalogoFuentes = signal<any[]>([]);
  catalogoClavesProgramaticas = signal<any[]>([]); //Depende de la Unidad Seleccionada
  //#endregion
  

  formulario = this.fb.group({
    ejercicio: [{ value: 2026, disabled: true }, [Validators.required, Validators.min(2000)]], // Siempre bloqueado
    unidad: [null as any, [Validators.required, Validators.min(1)]],
    consecutivo: [null],
    folio: [{ value: 'AUTO-GENERADO', disabled: true }],
    estatus: [{ value: 1, disabled: true }, Validators.required], // ID 1 = Capturado. Siempre bloqueado.
    requisicion: this.fb.group({
      numeroRequisicion: ['', Validators.required],
      tipoContratacion: [null as any, Validators.required],
      tipoRequerimiento: [null as any, Validators.required],
      importeTotalRequisicion: [{ value: 0, disabled: true }]
    }),
    conceptos: this.fb.array([])
  });

  get conceptosFormArray() {
    return this.formulario.get('conceptos') as FormArray;
  }

  ngOnInit() {
    this.cargando.set(true);

    const idParam = this.route.snapshot.paramMap.get('id');
    console.log("A punto de cargar catálogos");
    this.cargarCatalogosGlobales();

    this.configurarListenerUnidad();

    if (idParam) {
      this.esEdicion = true;
      this.idPrecompromiso = Number(idParam);
      
      //QUITAR CUANDO SE TENGA EL SERVICIO PARA CONSULTAR UN PRECOMPROMISOS POR ID
      const registro = this.precompromisoService.obtenerPorId(this.idPrecompromiso);
      if (registro) {
        this.cargarDatosFormulario(registro);
      }

      /*DESCOMENTAR CUANDO SE TENGA EL SERVICIO PARA CONSULTAR UN PRECOMPROMISO POR ID
      // Llamada real para obtener los datos de la BD
      this.precompromisoService.obtenerPorId(this.idPrecompromiso).subscribe({
        next: (registro) => {
          this.cargarDatosFormulario(registro);
        },
        error: (err) => {
          this.mostrarAlerta('Error al recuperar el precompromiso', 'danger');
        }
      });*/
    } else {
      // MODO REGISTRO
      this.evaluarReglaUnidadEjecutora();
      this.agregarConcepto();
    }

    this.cargando.set(false);
  }

  // ==========================================
  // CONSUMO DE APIS: CATÁLOGOS
  // ==========================================

  cargarCatalogosGlobales() {
    this.unidadEjecutoraService.getCatalogoUnidadesEjecutoras().subscribe(data => {
      const unidadesTransformadas = data.map(unidad => ({
        ...unidad, // Conservamos todas las propiedades originales (ambito, iniciales, etc)
        // 2. Creamos la nueva propiedad concatenada
        textoVisible: `${unidad.unidadEjecutora} - ${unidad.nombreCorto}` 
      }));

      // 3. Guardamos el arreglo transformado en la señal
      this.catalogoUnidadesEjecutoras.set(unidadesTransformadas);

      if (!this.esEdicion) {
        this.evaluarReglaUnidadEjecutora();
      }
    });

    this.estatusService.getCatalogoEstatus().subscribe(data => this.catalogoEstatus.set(data));
    
    this.tipoContratacionService.getCatalogoTiposAdquisiciones().subscribe(data => this.catalogoTiposContratacion.set(data));
    
    this.tipoRequerimientoService.getCatalogoTiposRequerimientos().subscribe(data => this.catalogoTiposRequerimiento.set(data));
  }

  cargarClavesProgramaticasDisponibles(ejercicio: number, unidad: string) {
    this.claveProgramaticaService.getClavesProgramaticas(ejercicio, unidad).subscribe({
      next: (data) => {
        // 1. Transformamos los datos para crear la propiedad concatenada
        const clavesTransformadas = data.map(clave => ({
          ...clave,
          textoVisibleOpcion: `${clave.claveProgramatica} - ${clave.descripcion}`
        })); 
        
        // 2. Actualizamos la señal
        this.catalogoClavesProgramaticas.set(clavesTransformadas);
      },
      error: (err) => {
        // 3. Manejo de errores
        console.error('Error al obtener claves programáticas:', err);
        this.mostrarAlerta('No se pudieron cargar las claves programáticas disponibles.', 'danger');
        this.catalogoClavesProgramaticas.set([]); // Limpiamos el catálogo por seguridad
      }
    });
  }

  cargarPartidasEspecificasDisponibles(ejercicio: number, unidad: string, idClaveProgramatica: number) {
    this.partidaService.getCatalogoPartidasEspecificasPorCveProg(ejercicio, unidad, idClaveProgramatica).subscribe({
      next: (data) => {
        // 1. Transformamos los datos para crear la propiedad concatenada
        const partidasTransformadas = data.map(partida => ({
          ...partida,
          textoVisibleOpcion: `${partida.partida} - ${partida.descripcion}`,
          idClave: idClaveProgramatica // INYECCIÓN: Clave para que el Pipe filtrarCatalogo funcione por fila
        })); 
        
        // ACUMULACIÓN: Sumamos las partidas nuevas a las que ya estaban en memoria (por si hay múltiples conceptos)
        this.catalogoPartidasEspecificas.update(actuales => {
          const fusionadas = [...actuales, ...partidasTransformadas];
          // Eliminamos posibles duplicados usando el idPartida
          return Array.from(new Map(fusionadas.map(p => [p.idPartida, p])).values());
        });
      },
      error: (err) => {
        // 3. Manejo de errores
        console.error('Error al obtener las partidas específicas del Clasificador por Objeto del Gasto:', err);
        this.mostrarAlerta('No se pudieron cargar las partidas.', 'danger');
        this.catalogoPartidasEspecificas.set([]); // Limpiamos el catálogo por seguridad
      }
    });
  }

  // NUEVO MÉTODO: Carga de Fuentes con los 4 parámetros del backend
  cargarFuentesFinanciamientoDisponibles(ejercicio: number, unidad: string, idCveProg: number, idPartida: number) {
    // IMPORTANTE: Ajusta el formato según cómo tu servicio de Angular reciba el objeto filtro o parámetros individuales
    const filtro = { ejercicio, unidad, idCveProg, idPartida };
    
    this.fuenteService.consultarFuentesFinanciamiento(filtro).subscribe({
      next: (data) => {
        const fuentesTransformadas = data.map(fuente => ({
          ...fuente,
          textoVisibleOpcion: `${fuente.idFuenteFinanciamiento} - ${fuente.descripcion}`,
          idPartida: idPartida // INYECCIÓN: Clave para que el Pipe filtrarCatalogo funcione por fila
        })); 
        
        // ACUMULACIÓN
        this.catalogoFuentes.update(actuales => {
          const fusionadas = [...actuales, ...fuentesTransformadas];
          // Ajusta el "f.id" según la llave primaria de tu fuente
          return Array.from(new Map(fusionadas.map(f => [f.id, f])).values());
        });
      },
      error: (err) => {
        console.error('Error al obtener fuentes de financiamiento:', err);
        this.mostrarAlerta('No se pudieron cargar las fuentes de financiamiento.', 'danger');
      }
    });
  }

  configurarListenerUnidad() {
    // Al cambiar la unidad, cargamos las claves programáticas reales permitidas
    this.formulario.get('unidad')?.valueChanges.subscribe(idUnidad => {
      if (idUnidad) {
        const ejercicio = this.formulario.get('ejercicio')?.value;

        if (ejercicio) {
          this.cargarClavesProgramaticasDisponibles(ejercicio, idUnidad);

          // Si el usuario cambia la unidad, las claves seleccionadas en los conceptos ya no son válidas
          if (!this.esEdicion) {
            this.conceptosFormArray.clear();
            this.agregarConcepto();
          }
        } else {
          console.error("Error: No se encuentra el ejercicio.");
        }
      }
    });
  }

  evaluarReglaUnidadEjecutora() {
    // Regla: Si el usuario solo tiene acceso a 1 unidad, seleccionarla y bloquearla
    if (this.catalogoUnidadesEjecutoras().length === 1) {
      const unicaUnidad = this.catalogoUnidadesEjecutoras()[0].id || this.catalogoUnidadesEjecutoras()[0].clave; // Ajusta según tu DTO
      this.formulario.get('unidad')?.setValue(unicaUnidad);
      this.formulario.get('unidad')?.disable();
    }
  }

  // Crea la sub-estructura de controles para un concepto nuevo con sus 12 meses
  crearConceptoFormGroup(datosPrevios?: any): FormGroup {
    const vieneConClave = !!datosPrevios?.claveProgramatica;

    const grupo = this.fb.group({
      descripcion: [datosPrevios?.descripcion || '', Validators.required],
      // Control clave oculto: Indica si el candado está cerrado (true) o abierto (false)
      combinacionValidada: [vieneConClave],
      // NUEVO: Control en memoria (sin representación HTML)
      idCvePresupuestaria: [datosPrevios?.idCvePresupuestaria || null], 
      claveProgramatica: [{ value: datosPrevios?.claveProgramatica || null, disabled: vieneConClave }, Validators.required],
      partidaEspecifica: [{ value: datosPrevios?.partidaEspecifica || null, disabled: !vieneConClave && !datosPrevios?.claveProgramatica }, Validators.required],
      fuenteFinanciamiento: [{ value: datosPrevios?.fuenteFinanciamiento || null, disabled: !vieneConClave && !datosPrevios?.partidaEspecifica }, Validators.required],     
      
      // 2. Controles ocultos o de solo lectura para almacenar el saldo disponible
      disponibleEnero: [datosPrevios?.disponibleEnero || 0],
      disponibleFebrero: [datosPrevios?.disponibleFebrero || 0],
      disponibleMarzo: [datosPrevios?.disponibleMarzo || 0],
      disponibleAbril: [datosPrevios?.disponibleAbril || 0],
      disponibleMayo: [datosPrevios?.disponibleMayo || 0],
      disponibleJunio: [datosPrevios?.disponibleJunio || 0],
      disponibleJulio: [datosPrevios?.disponibleJulio || 0],
      disponibleAgosto: [datosPrevios?.disponibleAgosto || 0],
      disponibleSeptiembre: [datosPrevios?.disponibleSeptiembre || 0],
      disponibleOctubre: [datosPrevios?.disponibleOctubre || 0],
      disponibleNoviembre: [datosPrevios?.disponibleNoviembre || 0],
      disponibleDiciembre: [datosPrevios?.disponibleDiciembre || 0],
      
      importeEnero: [{ value: datosPrevios?.importeEnero || 0, disabled: true }, [Validators.required, Validators.min(0), this.validarDisponibilidad('Enero')]],
      importeFebrero: [{ value: datosPrevios?.importeFebrero || 0, disabled: true }, [Validators.required, Validators.min(0), this.validarDisponibilidad('Febrero')]],
      importeMarzo: [{ value: datosPrevios?.importeMarzo || 0, disabled: true }, [Validators.required, Validators.min(0), this.validarDisponibilidad('Marzo')]],
      importeAbril: [{ value: datosPrevios?.importeAbril || 0, disabled: true }, [Validators.required, Validators.min(0), this.validarDisponibilidad('Abril')]],
      importeMayo: [{ value: datosPrevios?.importeMayo || 0, disabled: true }, [Validators.required, Validators.min(0), this.validarDisponibilidad('Mayo')]],
      importeJunio: [{ value: datosPrevios?.importeJunio || 0, disabled: true }, [Validators.required, Validators.min(0), this.validarDisponibilidad('Junio')]],
      importeJulio: [{ value: datosPrevios?.importeJulio || 0, disabled: true }, [Validators.required, Validators.min(0), this.validarDisponibilidad('Julio')]],
      importeAgosto: [{ value: datosPrevios?.importeAgosto || 0, disabled: true }, [Validators.required, Validators.min(0), this.validarDisponibilidad('Agosto')]],
      importeSeptiembre: [{ value: datosPrevios?.importeSeptiembre || 0, disabled: true }, [Validators.required, Validators.min(0), this.validarDisponibilidad('Septiembre')]],
      importeOctubre: [{ value: datosPrevios?.importeOctubre || 0, disabled: true }, [Validators.required, Validators.min(0), this.validarDisponibilidad('Octubre')]],
      importeNoviembre: [{ value: datosPrevios?.importeNoviembre || 0, disabled: true }, [Validators.required, Validators.min(0), this.validarDisponibilidad('Noviembre')]],
      importeDiciembre: [{ value: datosPrevios?.importeDiciembre || 0, disabled: true }, [Validators.required, Validators.min(0), this.validarDisponibilidad('Diciembre')]],
      importeTotal: [{ value: datosPrevios?.importeTotal || 0, disabled: true }]
    });

    // Escucha cambios en Clave Programática
    // Lógica en cascada (Solo aplica cuando la combinación NO está validada)
    grupo.get('claveProgramatica')?.valueChanges.subscribe(idClave => {
      if (grupo.get('combinacionValidada')?.value) return; // Si está bloqueado, no hacer nada

      const controlPartida = grupo.get('partidaEspecifica');
      const controlFuente = grupo.get('fuenteFinanciamiento');
      
      // Reseteamos los hijos al cambiar el padre
      // EmitEvent: false evita que se disparen reacciones en cadena innecesarias
      controlPartida?.setValue(null, { emitEvent: false });
      controlFuente?.setValue(null, { emitEvent: false });
      controlFuente?.disable({ emitEvent: false });

      if (idClave) {
        controlPartida?.enable({ emitEvent: false });

        const ejercicio = this.formulario.get('ejercicio')?.value;
        const unidad = this.formulario.get('unidad')?.value;

        if (ejercicio && unidad) {
          // Disparamos la carga de Partidas
          this.cargarPartidasEspecificasDisponibles(ejercicio, unidad, idClave);
        }
      } else {
        controlPartida?.disable({ emitEvent: false });
      }
    });


    // Escucha cambios en Partida Presupuestal
    grupo.get('partidaEspecifica')?.valueChanges.subscribe(idPartida => {
      if (grupo.get('combinacionValidada')?.value) return;
      
      const controlFuente = grupo.get('fuenteFinanciamiento');
      controlFuente?.setValue(null, { emitEvent: false });

      if (idPartida) {
        controlFuente?.enable({ emitEvent: false });

        const ejercicio = this.formulario.get('ejercicio')?.value;
        const unidad = this.formulario.get('unidad')?.value;
        const idClave = grupo.get('claveProgramatica')?.value;

        if (ejercicio && unidad && idClave) {
          // NUEVO: Disparamos la carga de Fuentes de Financiamiento desde el backend
          this.cargarFuentesFinanciamientoDisponibles(ejercicio, unidad, idClave, idPartida);
        }
      } else {
        controlFuente?.disable({ emitEvent: false });
      }
    });

    // Escucha cambios en los meses de este concepto específico para recalcular totales
    grupo.valueChanges.subscribe(() => this.calcularTotales());

    // Si es edición y ya venía con datos, habilitamos los meses según el saldo
    if (vieneConClave) {
      this.evaluarEstadoMeses(grupo);
    }

    return grupo;
  }

  // ==========================================
  // EL "CANDADO": VERIFICAR Y DESBLOQUEAR
  // ==========================================
  verificarCombinacion(index: number) {
    const ejercicio = this.formulario.get('ejercicio')?.value;
    const unidadId = this.formulario.get('unidad')?.value;

    const concepto = this.conceptosFormArray.at(index) as FormGroup;
    const rawValues = concepto.getRawValue();

    // Medida de seguridad
    if (!rawValues.claveProgramatica || !rawValues.partidaEspecifica || !rawValues.fuenteFinanciamiento) {
      this.mostrarAlerta('Debe seleccionar la combinación completa antes de verificar.', 'danger');
      return;
    }

    const filtroCombinacion: FiltroCombinacionEUPPFFDTO = {
      ejercicio: Number(ejercicio),
      unidad: String(unidadId),
      idCveProg: Number(rawValues.claveProgramatica),
      idPartida: Number(rawValues.partidaEspecifica),
      idFuenteFin: Number(rawValues.fuenteFinanciamiento)
    };

    this.clavePresupuestariaService.consultarDisponibilidad(filtroCombinacion).subscribe({
      next: (saldosReales) => {
        // 1. Inyectamos los saldos y el idCvePresupuestaria real provenientes de Oracle
        concepto.patchValue(saldosReales);
        
        // 2. CERRAMOS EL CANDADO
        concepto.get('combinacionValidada')?.setValue(true);
        concepto.get('claveProgramatica')?.disable({ emitEvent: false });
        concepto.get('partidaEspecifica')?.disable({ emitEvent: false });
        concepto.get('fuenteFinanciamiento')?.disable({ emitEvent: false });

        // 3. Habilitamos los inputs de meses según el saldo
        this.evaluarEstadoMeses(concepto);
        
        this.mostrarAlerta('Combinación validada correctamente. Ya puede capturar los importes.', 'success');
      },
      error: (err) => {
        // Aprovechamos la arquitectura de excepciones que creamos en Spring Boot
        const msjError = err.error?.mensaje || 'Combinación presupuestal no válida o no registrada.';
        this.mostrarAlerta(msjError, 'danger');
      }
    });
  }

  desbloquearCombinacion(index: number) {
    const concepto = this.conceptosFormArray.at(index) as FormGroup;
    
    // 1. ABRIMOS EL CANDADO
    concepto.get('combinacionValidada')?.setValue(false);
    
    // 2. Habilitamos los selectores
    concepto.get('claveProgramatica')?.enable({ emitEvent: false });
    concepto.get('partidaEspecifica')?.enable({ emitEvent: false });
    concepto.get('fuenteFinanciamiento')?.enable({ emitEvent: false });

    // 3. Reseteamos los saldos y los importes a 0, y los bloqueamos
    const reseteo = {
      disponibleEnero: 0, importeEnero: 0,
      disponibleFebrero: 0, importeFebrero: 0,
      disponibleMarzo: 0, importeMarzo: 0,
      disponibleAbril: 0, importeAbril: 0,
      disponibleMayo: 0, importeMayo: 0,
      disponibleJunio: 0, importeJunio: 0,
      disponibleJulio: 0, importeJulio: 0,
      disponibleAgosto: 0, importeAgosto: 0,
      disponibleSeptiembre: 0, importeSeptiembre: 0,
      disponibleOctubre: 0, importeOctubre: 0,
      disponibleNoviembre: 0, importeNoviembre: 0,
      disponibleDiciembre: 0, importeDiciembre: 0,
      importeTotal: 0
    };
    
    concepto.patchValue(reseteo, { emitEvent: false });
    
    // Forzamos el bloqueo visual de los inputs
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    meses.forEach(mes => {
      concepto.get(`importe${mes}`)?.disable({ emitEvent: false });
    });
    
    this.calcularTotales();
  }


  // ==========================================
  // OPERACIONES ESTÁNDAR
  // ==========================================
  agregarConcepto() {
    this.conceptosFormArray.push(this.crearConceptoFormGroup());
  }

  eliminarConcepto(index: number) {
    if (this.conceptosFormArray.length > 1) {
      this.conceptosFormArray.removeAt(index);
      this.calcularTotales();
    }
  }

  calcularTotales() {
    let granTotal = 0;

    this.conceptosFormArray.controls.forEach((control) => {
      const g = control as FormGroup;
      const t = Number(g.get('importeEnero')?.value || 0) +
                Number(g.get('importeFebrero')?.value || 0) +
                Number(g.get('importeMarzo')?.value || 0) +
                Number(g.get('importeAbril')?.value || 0) +
                Number(g.get('importeMayo')?.value || 0) +
                Number(g.get('importeJunio')?.value || 0) +
                Number(g.get('importeJulio')?.value || 0) +
                Number(g.get('importeAgosto')?.value || 0) +
                Number(g.get('importeSeptiembre')?.value || 0) +
                Number(g.get('importeOctubre')?.value || 0) +
                Number(g.get('importeNoviembre')?.value || 0) +
                Number(g.get('importeDiciembre')?.value || 0);
      
      // Actualizamos el total individual sin disparar bucles infinitos de eventos
      g.get('importeTotal')?.setValue(t, { emitEvent: false });
      granTotal += t;
    });

    // Actualizamos el total general de la requisición
    this.formulario.get('requisicion.importeTotalRequisicion')?.setValue(granTotal, { emitEvent: false });
  }

  // ==========================================
  // HIDRATACIÓN EN MODO EDICIÓN
  // ==========================================
  cargarDatosFormulario(registro: any) {
    this.formulario.patchValue({
      ejercicio: registro.ejercicio,
      unidad: registro.unidad,
      consecutivo: registro.consecutivo,
      folio: registro.folio,
      estatus: registro.estatus
    });

    this.formulario.get('unidad')?.disable();
    this.formulario.get('requisicion')?.patchValue(registro.requisicion);
    this.conceptosFormArray.clear();

    // 1. Pre-cargamos la Clave Programática general de la Unidad (Para que el ng-select tenga texto)
    this.cargarClavesProgramaticasDisponibles(registro.ejercicio, registro.unidad);

    registro.requisicion.conceptos.forEach((concepto: any) => {
      
      // 2. Pre-cargamos los catálogos en cascada que usa este concepto guardado 
      // (Para que el ng-select pueda cruzar el ID con el Texto y no quede en blanco)
      if (concepto.claveProgramatica) {
        this.cargarPartidasEspecificasDisponibles(registro.ejercicio, registro.unidad, concepto.claveProgramatica);
      }
      
      if (concepto.claveProgramatica && concepto.partidaEspecifica) {
        this.cargarFuentesFinanciamientoDisponibles(registro.ejercicio, registro.unidad, concepto.claveProgramatica, concepto.partidaEspecifica);
      }

      const fg = this.crearConceptoFormGroup(concepto);
      this.conceptosFormArray.push(fg);
    });

    this.calcularTotales();
  }

  // ==========================================
  // REFRESCO DE SALDOS EN TIEMPO REAL
  // ==========================================
  refrescarSaldos(index: number) {
    const concepto = this.conceptosFormArray.at(index) as FormGroup;

    const idCvePresupuestaria = concepto.get('idCvePresupuestaria')?.value;
    
    if (!idCvePresupuestaria) {
       this.verificarCombinacion(index);
       return;
    }

    this.clavePresupuestariaService.consultarDisponibilidadPorId(idCvePresupuestaria).subscribe({
      next: (saldosActualizados) => {
        // 1. Actualizamos únicamente los montos invisibles de disponibilidad
        concepto.patchValue(saldosActualizados);

        // 2. Evaluamos si algún mes se quedó sin fondos para bloquearlo
        this.evaluarEstadoMeses(concepto);
        
        this.mostrarAlerta('Saldos actualizados al momento.', 'success');
      },
      error: (err) => {
        const msjError = err.error?.mensaje || 'Ocurrió un error al intentar actualizar los saldos.';
        this.mostrarAlerta(msjError, 'danger');
      }
    });
  }

  evaluarEstadoMeses(concepto: FormGroup) {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    meses.forEach(mes => {
      // Obtenemos el saldo disponible de ese mes
      const disponible = concepto.get(`disponible${mes}`)?.value || 0;
      const controlImporte = concepto.get(`importe${mes}`);

      if (disponible === 0 || disponible < 0) {
        // Si es 0, lo bloqueamos y nos aseguramos de que su valor sea 0
        controlImporte?.setValue(0, { emitEvent: false });
        controlImporte?.disable({ emitEvent: false });
      } else {
        // Si hay saldo positivo, lo habilitamos
        controlImporte?.enable({ emitEvent: false });
      }
      
      // Forzamos la validación visual
      controlImporte?.updateValueAndValidity({ emitEvent: false });
    });
  }

  guardar() {
    if (this.formulario.valid) {
      const rawValues = this.formulario.getRawValue(); // Obtiene incluso valores deshabilitados
      
      const objetoGuardar: Precompromiso = {
        id: this.esEdicion ? this.idPrecompromiso! : 0,
        ejercicio: Number(rawValues.ejercicio),
        unidad: Number(rawValues.unidad),
        consecutivo: Number(rawValues.consecutivo || 1),
        folio: this.esEdicion ? rawValues.folio! : `${rawValues.ejercicio?.toString().substring(2)}-10${rawValues.unidad}091PRE000${Math.floor(Math.random()*90)+10}`,
        estatus: rawValues.estatus as any,
        activo: true,
        requisicion: {
          numeroRequisicion: rawValues.requisicion.numeroRequisicion!,
          tipoContratacion: rawValues.requisicion.tipoContratacion as any,
          tipoRequerimiento: rawValues.requisicion.tipoRequerimiento as any,
          importeTotalRequisicion: rawValues.requisicion.importeTotalRequisicion!,
          conceptos: rawValues.conceptos.map((c: any) => ({ ...c, importeTotal: c.importeTotal! }))
        }
      };

      /*DESCOMENTAR CUANDO SE TENGA LISTO EL SERVICIO PARA GUARDA PRECOMPROMISOS
      // CONSUMO REAL DEL ENDPOINT DE GUARDADO
      this.precompromisoService.guardar(objetoGuardar).subscribe({
        next: (res) => {
          this.mostrarAlerta(res.mensaje || 'Precompromiso guardado exitosamente', 'success');
          setTimeout(() => this.router.navigate(['/home/precompromisos/list']), 1500);
        },
        error: (err) => {
          this.mostrarAlerta(err.error?.error || 'Error al intentar guardar el precompromiso', 'danger');
        }
      });
      */

      this.precompromisoService.guardar(objetoGuardar);
      this.router.navigate(['/home/precompromisos/list']);
    } else {
      this.formulario.markAllAsTouched();
      this.mostrarAlerta('Existen errores o combinaciones sin validar en el formulario.', 'danger');
    }
  }

  // Validador personalizado para evaluar el tope presupuestal
  validarDisponibilidad(mes: string) {
    return (control: AbstractControl) => {
      if (!control.parent) return null;
      // Buscamos el valor disponible que el backend nos entregó para este mes
      const disponible = control.parent.get(`disponible${mes}`)?.value || 0;
      return control.value > disponible ? { excedePresupuesto: true } : null;
    };
  }

  // Método para interceptar el teclado
  bloquearCaracteresInvalidos(event: KeyboardEvent) {
    // Permitir teclas de navegación y borrado (BackSpace, Tab, Flechas, Suprimir, Enter)
    const teclasControl = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Delete', 'Enter'];
    if (teclasControl.includes(event.key)) return;

    // Permitir atajos de teclado (Ctrl+C, Ctrl+V, etc.)
    if (event.ctrlKey || event.metaKey) return;

    // Validar que la tecla presionada sea un número del 0 al 9 o el punto decimal
    const esNumeroOPunto = /^[0-9.]$/.test(event.key);

    if (!esNumeroOPunto) {
      event.preventDefault(); // Detiene la pulsación de la tecla
      
      this.mostrarAlerta('Solo se aceptan cifras mayores que cero', 'danger');
      
      // Ocultamos el mensaje después de 3.5 segundos
      setTimeout(() => this.mensajeAlerta.set(null), 3000);
    }
  }

  mostrarAlerta(mensaje: string, tipo: 'success'|'danger') {
    if (tipo === 'success') {
      this.mensajeExito.set(mensaje);
      setTimeout(() => this.mensajeExito.set(null), 3000);
    } else {
      this.mensajeAlerta.set(mensaje);
      setTimeout(() => this.mensajeAlerta.set(null), 3000);
    }
  }
}
