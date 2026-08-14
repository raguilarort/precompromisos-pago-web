// 1. Nuevas interfaces de soporte para la UI y la Bitácora
export interface MesDesglose {
  nombre: string;
  importe: number;
  disponible: number;
  haySuficiencia?: boolean; // Para evaluar disponibilidad presupuestal
}

export interface HistorialSeguimiento {
  estatus: string;
  fecha: string;
  usuario: string;
}

export interface ConceptoPresupuestal {
  idCvePresupuestaria: number;
  descripcion: string;
  importeEnero: number;
  importeFebrero: number;
  importeMarzo: number;
  importeAbril: number;
  importeMayo: number;
  importeJunio: number;
  importeJulio: number;
  importeAgosto: number;
  importeSeptiembre: number;
  importeOctubre: number;
  importeNoviembre: number;
  importeDiciembre: number;
  importeTotal: number;

  // Propiedad opcional para iterar en el acordeón del HTML
  meses?: MesDesglose[];
}

export interface Requisicion {
  numeroRequisicion: string;
  tipoContratacion: number;
  tipoRequerimiento: number;
  importeTotalRequisicion: number;
  conceptos: ConceptoPresupuestal[];
}

export interface Precompromiso {
  id: number;
  ejercicio: number;
  unidad: number;
  consecutivo: number;
  folio: string;
  estatus: number;
  requisicion: Requisicion;
  activo: boolean; // Para borrado lógico en frontend
  // Propiedad opcional para la bitácora de seguimiento
  historial?: HistorialSeguimiento[];
}