import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { PrecompromisoService } from '../services/precompromisos/precompromisos';
import { Precompromiso } from '../models/precompromiso.model';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe],
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
  crearConceptoFormGroup(): FormGroup {
    const grupo = this.fb.group({
      idCvePresupuestaria: [null, Validators.required],
      descripcion: ['', Validators.required],
      importeEnero: [0, [Validators.required, Validators.min(0)]],
      importeFebrero: [0, [Validators.required, Validators.min(0)]],
      importeMarzo: [0, [Validators.required, Validators.min(0)]],
      importeAbril: [0, [Validators.required, Validators.min(0)]],
      importeMayo: [0, [Validators.required, Validators.min(0)]],
      importeJunio: [0, [Validators.required, Validators.min(0)]],
      importeJulio: [0, [Validators.required, Validators.min(0)]],
      importeAgosto: [0, [Validators.required, Validators.min(0)]],
      importeSeptiembre: [0, [Validators.required, Validators.min(0)]],
      importeOctubre: [0, [Validators.required, Validators.min(0)]],
      importeNoviembre: [0, [Validators.required, Validators.min(0)]],
      importeDiciembre: [0, [Validators.required, Validators.min(0)]],
      importeTotal: [{ value: 0, disabled: true }]
    });

    // Escucha cambios en los meses de este concepto específico para recalcular totales
    grupo.valueChanges.subscribe(() => this.calcularTotales());
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
}
