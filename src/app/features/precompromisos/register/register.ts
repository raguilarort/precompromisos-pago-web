import { Component, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select'; // <-- Importación necesaria
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { PrecompromisoService } from '../services/precompromisos/precompromisos';
import { Precompromiso } from '../models/precompromiso.model';
import { FiltrarCatalogoPipe } from '../../../shared/pipes/filtrar-catalogo-pipe'; // Ajusta la ruta si es necesario

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, NgSelectModule, FiltrarCatalogoPipe, NgxMaskDirective],
  providers: [provideNgxMask()],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit {
  private fb = inject(FormBuilder);
  private precompromisoService = inject(PrecompromisoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  esEdicion = false;
  idCompromiso?: number;
  activeTab = 'generales'; // Control del formulario dividido

  mensajeAlerta = signal<string | null>(null);

  //BORRAR AL HACER LA INTEGRACIÓN CON EL SERVICIO
  // 1. Catálogos simulados (En el futuro, esto vendrá de tu backend)
  catalogoClaves = [
    { id: 15009, descripcion: '04R01-09-40-01 M01-ACTIVIDADES Y SERVICIOS DE APOYO ADMINISTRATIVO' },
    { id: 15010, descripcion: '04R01-09-40-02 M01-ACTIVIDADES Y SERVICIOS DE APOYO ADMINISTRATIVO' },
    { id: 15012, descripcion: '04R01-09-41-01 M02-MODERNIZACIÓN Y GOBIERNO DIGITAL' }
  ];

  catalogoPartidas = [
    { id: 57, idClave: 15009, descripcion: '21101 Materiales y utiles de oficina' },
    { id: 86, idClave: 15010, descripcion: '24601 Material electrico y electronico' },
    { id: 63, idClave: 15010, descripcion: '21401 Materiales y utiles consumibles para el procesamiento en equipos y bienes informaticos' },
    { id: 200, idClave: 15012, descripcion: '51101 - Muebles de oficina' }
  ];

  catalogoFuentes = [
    { id: 1, idPartida: 57, descripcion: 'Recursos Financieros' },
    { id: 3, idPartida: 57, descripcion: 'Aprovechamientos' },
    { id: 1, idPartida: 86, descripcion: 'Recursos Financieros' },
    { id: 3, idPartida: 86, descripcion: 'Aprovechamientos' },
    { id: 1, idPartida: 63, descripcion: 'Recursos Financieros' },
    { id: 1, idPartida: 200, descripcion: 'Recursos Financieros' },
    { id: 3, idPartida: 200, descripcion: 'Aprovechamientos' }
  ];
  //BORRAR AL HACER LA INTEGRACIÓN CON EL SERVICIO

  formulario = this.fb.group({
    ejercicio: [2026, [Validators.required, Validators.min(2000)]],
    unidad: [1, [Validators.required, Validators.min(1)]],
    consecutivo: [null],
    folio: [{ value: 'AUTO-GENERADO', disabled: true }],
    estatus: ['Capturado', Validators.required],
    requisicion: this.fb.group({
      numeroRequisicion: ['', Validators.required],
      tipoContratacion: ['Adjudicación Directa', Validators.required],
      tipo: ['Bien', Validators.required],
      importeTotalRequisicion: [{ value: 0, disabled: true }]
    }),
    conceptos: this.fb.array([]) // Array de conceptos dinámicos
  });

  get conceptosFormArray() {
    return this.formulario.get('conceptos') as FormArray;
  }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.esEdicion = true;
      this.idCompromiso = Number(idParam);
      const registro = this.precompromisoService.obtenerPorId(this.idCompromiso);
      if (registro) {
        this.cargarDatosFormulario(registro);
      }
    } else {
      this.agregarConcepto(); // Inicializa con un renglón vacío si es creación
    }
  }

  // Crea la sub-estructura de controles para un concepto nuevo con sus 12 meses
  crearConceptoFormGroup(datosPrevios?: any): FormGroup {
    const grupo = this.fb.group({
      descripcion: [datosPrevios?.descripcion || '', Validators.required],
      // 1. Los 3 nuevos campos en lugar del idCvePresupuestaria
      // 1. Inicializamos con el valor previo si existe, si no, null
      claveProgramatica: [datosPrevios?.claveProgramatica || null, Validators.required],
      // 2. Si trae claveProgramatica previa, la partida nace habilitada
      partidaPresupuestal: [{ 
        value: datosPrevios?.partidaPresupuestal || null, 
        disabled: !datosPrevios?.claveProgramatica 
      }, Validators.required],
      // 3. Si trae partida previa, la fuente nace habilitada
      fuenteFinanciamiento: [{ 
        value: datosPrevios?.fuenteFinanciamiento || null, 
        disabled: !datosPrevios?.partidaPresupuestal 
      }, Validators.required],     
      
      // 2. Controles ocultos o de solo lectura para almacenar el saldo disponible
      disponibleEnero: [0],
      disponibleFebrero: [0],
      disponibleMarzo: [0],
      disponibleAbril: [0],
      disponibleMayo: [0],
      disponibleJunio: [0],
      disponibleJulio: [0],
      disponibleAgosto: [0],
      disponibleSeptiembre: [0],
      disponibleOctubre: [0],
      disponibleNoviembre: [0],
      disponibleDiciembre: [0],
      
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
      importeTotal: [{ value: 0, disabled: true }]
    });

    // Escucha cambios en Clave Programática
    grupo.get('claveProgramatica')?.valueChanges.subscribe(idClave => {
      const controlPartida = grupo.get('partidaPresupuestal');
      const controlFuente = grupo.get('fuenteFinanciamiento');
      
      // Reseteamos los hijos al cambiar el padre
      // EmitEvent: false evita que se disparen reacciones en cadena innecesarias
      controlPartida?.setValue(null, { emitEvent: false });
      controlFuente?.setValue(null, { emitEvent: false });
      controlFuente?.disable({ emitEvent: false });

      if (idClave) {
        controlPartida?.enable({ emitEvent: false });
        // Aquí podrías llamar al backend: this.catalogosService.obtenerPartidas(idClave).subscribe(...)
      } else {
        controlPartida?.disable({ emitEvent: false });
      }
    });

    // Escucha cambios en Partida Presupuestal
    grupo.get('partidaPresupuestal')?.valueChanges.subscribe(idPartida => {
      const controlFuente = grupo.get('fuenteFinanciamiento');
      controlFuente?.setValue(null, { emitEvent: false });

      if (idPartida) {
        controlFuente?.enable({ emitEvent: false });
      } else {
        controlFuente?.disable({ emitEvent: false });
      }
    });

    // Escucha cambios en los meses de este concepto específico para recalcular totales
    grupo.valueChanges.subscribe(() => this.calcularTotales());

    // LÓGICA DE CASCADA (Puntos 4, 5 y 6)
    grupo.get('claveProgramatica')?.valueChanges.subscribe(valor => {
      if (valor) {
        // Habilitamos la partida y llamamos al backend simulado
        grupo.get('partidaPresupuestal')?.enable();
        // Aquí iría tu: this.catalogosService.obtenerPartidas(valor).subscribe(...)
      } else {
        grupo.get('partidaPresupuestal')?.disable();
        grupo.get('fuenteFinanciamiento')?.disable();
      }
    });

    return grupo;
  }

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

  cargarDatosFormulario(registro: Precompromiso) {
    this.formulario.patchValue({
      ejercicio: registro.ejercicio,
      unidad: registro.unidad,
      consecutivo: registro.consecutivo as any,
      folio: registro.folio,
      estatus: registro.estatus
    });

    this.formulario.get('requisicion')?.patchValue(registro.requisicion);

    // Limpiamos e hidratamos el FormArray dinámicamente
    this.conceptosFormArray.clear();

    registro.requisicion.conceptos.forEach((concepto) => {
      const fg = this.crearConceptoFormGroup();

      fg.patchValue(concepto);

      this.conceptosFormArray.push(fg);
    });

    this.calcularTotales();
  }

  refrescarSaldos(index: number) {
    const concepto = this.conceptosFormArray.at(index) as FormGroup;
    
    const idClave = concepto.get('claveProgramatica')?.value;
    const idPartida = concepto.get('partidaPresupuestal')?.value;
    const idFuente = concepto.get('fuenteFinanciamiento')?.value;

    // Medida de seguridad: No buscar si la clave presupuestaria está incompleta
    if (!idClave || !idPartida || !idFuente) return;

    // SIMULACIÓN DE LLAMADA AL BACKEND
    // Nota: Cuando implementes el servicio real hacia tu base de datos MariaDB, 
    // asegúrate de que el módulo en la capa de consulta esté optimizado y libre 
    // de sentencias con loggers de strings pesados para evitar que la UI se trabe durante esta validación.
    
    import('rxjs').then(({ of, delay }) => {
      // Generamos saldos aleatorios para la simulación
      const saldosActualizados = {
        disponibleEnero: Math.floor(Math.random() * 15000),
        disponibleFebrero: 0, // Simulamos un mes en cero
        disponibleMarzo: -500, // Simulamos un mes en negativo
        disponibleAbril: Math.floor(Math.random() * 15000),
        disponibleMayo: Math.floor(Math.random() * 15000),
        disponibleJunio: Math.floor(Math.random() * 15000),
        disponibleJulio: Math.floor(Math.random() * 15000),
        disponibleAgosto: Math.floor(Math.random() * 15000),
        disponibleSeptiembre: Math.floor(Math.random() * 15000),
        disponibleOctubre: Math.floor(Math.random() * 15000),
        disponibleNoviembre: Math.floor(Math.random() * 15000),
        disponibleDiciembre: Math.floor(Math.random() * 15000)
      };

      of(saldosActualizados).pipe(delay(500)).subscribe(saldos => {
        // 1. Inyectamos los nuevos saldos en los campos ocultos del concepto
        concepto.patchValue(saldos);

        // 2. Llamamos a nuestra función evaluadora
        this.evaluarEstadoMeses(concepto);
      });
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
        id: this.esEdicion ? this.idCompromiso! : 0,
        ejercicio: Number(rawValues.ejercicio),
        unidad: Number(rawValues.unidad),
        consecutivo: Number(rawValues.consecutivo || 1),
        folio: this.esEdicion ? rawValues.folio! : `${rawValues.ejercicio?.toString().substring(2)}-10${rawValues.unidad}091PRE000${Math.floor(Math.random()*90)+10}`,
        estatus: rawValues.estatus as any,
        activo: true,
        requisicion: {
          numeroRequisicion: rawValues.requisicion.numeroRequisicion!,
          tipoContratacion: rawValues.requisicion.tipoContratacion as any,
          tipo: rawValues.requisicion.tipo as any,
          importeTotalRequisicion: rawValues.requisicion.importeTotalRequisicion!,
          conceptos: rawValues.conceptos.map((c: any) => ({ ...c, importeTotal: c.importeTotal! }))
        }
      };

      this.precompromisoService.guardar(objetoGuardar);
      this.router.navigate(['/home/commitments/list']);
    } else {
      this.formulario.markAllAsTouched();
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
      
      // Lanzamos el regaño amistoso
      this.mensajeAlerta.set('Solo se aceptan cifras mayores que cero');
      
      // Ocultamos el mensaje después de 3.5 segundos
      setTimeout(() => this.mensajeAlerta.set(null), 3000);
    }
  }
}
