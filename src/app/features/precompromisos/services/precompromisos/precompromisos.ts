import { Injectable, signal, computed } from '@angular/core';
import { Precompromiso } from '../../models/precompromiso.model';

@Injectable({
  providedIn: 'root'
})
export class PrecompromisoService {
  private compromisos = signal<Precompromiso[]>([
    {
      id: 1, ejercicio: 2026, unidad: 1, consecutivo: 1, folio: '26-101091PRE00001', estatus: 'Comprometido', activo: true,
      requisicion: {
        numeroRequisicion: '103/26', tipoContratacion: 'Licitación Pública', tipo: 'Servicio', importeTotalRequisicion: 36,
        conceptos: [
          { idCvePresupuestaria: 15498, descripcion: 'Suministro de material de limpieza.', importeEnero: 1, importeFebrero: 1, importeMarzo: 1, importeAbril: 1, importeMayo: 1, importeJunio: 1, importeJulio: 1, importeAgosto: 1, importeSeptiembre: 1, importeOctubre: 1, importeNoviembre: 1, importeDiciembre: 1, importeTotal: 12 },
          { idCvePresupuestaria: 15499, descripcion: 'Servicio de montaje y logística.', importeEnero: 2, importeFebrero: 2, importeMarzo: 2, importeAbril: 2, importeMayo: 2, importeJunio: 2, importeJulio: 2, importeAgosto: 2, importeSeptiembre: 2, importeOctubre: 2, importeNoviembre: 2, importeDiciembre: 2, importeTotal: 24 }
        ]
      }
    },
    {
      id: 2, ejercicio: 2026, unidad: 2, consecutivo: 4, folio: '26-102091PRE00004', estatus: 'Capturado', activo: true,
      requisicion: {
        numeroRequisicion: '104/26', tipoContratacion: 'Adjudicación Directa', tipo: 'Bien', importeTotalRequisicion: 48,
        conceptos: [
          { idCvePresupuestaria: 14498, descripcion: 'Adquisición de frigobar congelador.', importeEnero: 1, importeFebrero: 1, importeMarzo: 1, importeAbril: 1, importeMayo: 1, importeJunio: 1, importeJulio: 1, importeAgosto: 1, importeSeptiembre: 1, importeOctubre: 1, importeNoviembre: 1, importeDiciembre: 1, importeTotal: 12 },
          { idCvePresupuestaria: 14499, descripcion: 'Soportes de pared articulados.', importeEnero: 2, importeFebrero: 2, importeMarzo: 2, importeAbril: 2, importeMayo: 2, importeJunio: 2, importeJulio: 2, importeAgosto: 2, importeSeptiembre: 2, importeOctubre: 2, importeNoviembre: 2, importeDiciembre: 2, importeTotal: 24 },
          { idCvePresupuestaria: 18498, descripcion: 'No Breaks de 850VA.', importeEnero: 1, importeFebrero: 1, importeMarzo: 1, importeAbril: 1, importeMayo: 1, importeJunio: 1, importeJulio: 1, importeAgosto: 1, importeSeptiembre: 1, importeOctubre: 1, importeNoviembre: 1, importeDiciembre: 1, importeTotal: 12 }
        ]
      }
    },
    {
      id: 3, ejercicio: 2026, unidad: 1, consecutivo: 5, folio: '26-101091PRE00005', estatus: 'Comprometido', activo: true,
      requisicion: {
        numeroRequisicion: '105/26', tipoContratacion: 'Invitación a tres personas', tipo: 'Servicio', importeTotalRequisicion: 120000,
        conceptos: [{ idCvePresupuestaria: 22101, descripcion: 'Mantenimiento preventivo de elevadores.', importeEnero: 10000, importeFebrero: 10000, importeMarzo: 10000, importeAbril: 10000, importeMayo: 10000, importeJunio: 10000, importeJulio: 10000, importeAgosto: 10000, importeSeptiembre: 10000, importeOctubre: 10000, importeNoviembre: 10000, importeDiciembre: 10000, importeTotal: 120000 }]
      }
    },
    {
      id: 4, ejercicio: 2026, unidad: 3, consecutivo: 12, folio: '26-103091PRE00012', estatus: 'Capturado', activo: true,
      requisicion: {
        numeroRequisicion: '108/26', tipoContratacion: 'Adjudicación Directa', tipo: 'Bien', importeTotalRequisicion: 45000,
        conceptos: [{ idCvePresupuestaria: 21101, descripcion: 'Consumibles de oficina e imprenta.', importeEnero: 5000, importeFebrero: 2000, importeMarzo: 8000, importeAbril: 1000, importeMayo: 4000, importeJunio: 3000, importeJulio: 2000, importeAgosto: 6000, importeSeptiembre: 1000, importeOctubre: 5000, importeNoviembre: 3000, importeDiciembre: 5000, importeTotal: 45000 }]
      }
    },
    {
      id: 5, ejercicio: 2026, unidad: 1, consecutivo: 18, folio: '26-101091PRE00018', estatus: 'Cancelado', activo: true,
      requisicion: {
        numeroRequisicion: '110/26', tipoContratacion: 'Licitación Pública', tipo: 'Servicio', importeTotalRequisicion: 800000,
        conceptos: [{ idCvePresupuestaria: 33401, descripcion: 'Servicio anual de desarrollo de software.', importeEnero: 0, importeFebrero: 200000, importeMarzo: 0, importeAbril: 200000, importeMayo: 0, importeJunio: 200000, importeJulio: 0, importeAgosto: 0, importeSeptiembre: 200000, importeOctubre: 0, importeNoviembre: 0, importeDiciembre: 0, importeTotal: 800000 }]
      }
    },
    {
      id: 6, ejercicio: 2026, unidad: 4, consecutivo: 22, folio: '26-104091PRE00022', estatus: 'Comprometido', activo: true,
      requisicion: {
        numeroRequisicion: '115/26', tipoContratacion: 'Adjudicación Directa', tipo: 'Bien', importeTotalRequisicion: 15000,
        conceptos: [{ idCvePresupuestaria: 51101, descripcion: 'Adquisición de mobiliario de oficina.', importeEnero: 15000, importeFebrero: 0, importeMarzo: 0, importeAbril: 0, importeMayo: 0, importeJunio: 0, importeJulio: 0, importeAgosto: 0, importeSeptiembre: 0, importeOctubre: 0, importeNoviembre: 0, importeDiciembre: 0, importeTotal: 15000 }]
      }
    },
    {
      id: 7, ejercicio: 2026, unidad: 2, consecutivo: 25, folio: '26-102091PRE00025', estatus: 'Capturado', activo: true,
      requisicion: {
        numeroRequisicion: '120/26', tipoContratacion: 'Invitación a tres personas', tipo: 'Servicio', importeTotalRequisicion: 60000,
        conceptos: [{ idCvePresupuestaria: 35501, descripcion: 'Mantenimiento del parque vehicular.', importeEnero: 5000, importeFebrero: 5000, importeMarzo: 5000, importeAbril: 5000, importeMayo: 5000, importeJunio: 5000, importeJulio: 5000, importeAgosto: 5000, importeSeptiembre: 5000, importeOctubre: 5000, importeNoviembre: 5000, importeDiciembre: 5000, importeTotal: 60000 }]
      }
    },
    {
      id: 8, ejercicio: 2026, unidad: 5, consecutivo: 30, folio: '26-105091PRE00030', estatus: 'Comprometido', activo: true,
      requisicion: {
        numeroRequisicion: '122/26', tipoContratacion: 'Licitación Pública', tipo: 'Bien', importeTotalRequisicion: 240000,
        conceptos: [{ idCvePresupuestaria: 25301, descripcion: 'Adquisición de insumos médicos básicos.', importeEnero: 20000, importeFebrero: 20000, importeMarzo: 20000, importeAbril: 20000, importeMayo: 20000, importeJunio: 20000, importeJulio: 20000, importeAgosto: 20000, importeSeptiembre: 20000, importeOctubre: 20000, importeNoviembre: 20000, importeDiciembre: 20000, importeTotal: 240000 }]
      }
    },
    {
      id: 9, ejercicio: 2026, unidad: 1, consecutivo: 35, folio: '26-101091PRE00035', estatus: 'Capturado', activo: true,
      requisicion: {
        numeroRequisicion: '130/26', tipoContratacion: 'Adjudicación Directa', tipo: 'Servicio', importeTotalRequisicion: 18000,
        conceptos: [{ idCvePresupuestaria: 31401, descripcion: 'Servicio de conectividad a internet simétrico.', importeEnero: 1500, importeFebrero: 1500, importeMarzo: 1500, importeAbril: 1500, importeMayo: 1500, importeJunio: 1500, importeJulio: 1500, importeAgosto: 1500, importeSeptiembre: 1500, importeOctubre: 1500, importeNoviembre: 1500, importeDiciembre: 1500, importeTotal: 18000 }]
      }
    },
    {
      id: 10, ejercicio: 2026, unidad: 3, consecutivo: 42, folio: '26-103091PRE00042', estatus: 'Comprometido', activo: true,
      requisicion: {
        numeroRequisicion: '135/26', tipoContratacion: 'Licitación Pública', tipo: 'Servicio', importeTotalRequisicion: 144000,
        conceptos: [{ idCvePresupuestaria: 33801, descripcion: 'Servicio de vigilancia y seguridad perimetral.', importeEnero: 12000, importeFebrero: 12000, importeMarzo: 12000, importeAbril: 12000, importeMayo: 12000, importeJunio: 12000, importeJulio: 12000, importeAgosto: 12000, importeSeptiembre: 12000, importeOctubre: 12000, importeNoviembre: 12000, importeDiciembre: 12000, importeTotal: 144000 }]
      }
    }
  ]);

  compromisosActivos = computed(() => this.compromisos().filter(c => c.activo));

  obtenerPorId(id: number): Precompromiso | undefined {
    return this.compromisos().find(c => c.id === id && c.activo);
  }

  guardar(compromiso: Precompromiso) {
    if (compromiso.id) {
      this.compromisos.update(lista => lista.map(c => c.id === compromiso.id ? compromiso : c));
    } else {
      const nuevo = { ...compromiso, id: Math.floor(Math.random() * 10000) + 10, activo: true };
      this.compromisos.update(lista => [...lista, nuevo]);
    }
  }

  eliminarLogico(id: number) {
    this.compromisos.update(lista => lista.map(c => c.id === id ? { ...c, activo: false } : c));
  }
}