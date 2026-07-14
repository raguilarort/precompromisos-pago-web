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
}

export interface Requisicion {
  numeroRequisicion: string;
  tipoContratacion: 'Licitación Pública' | 'Adjudicación Directa' | 'Invitación a tres personas';
  tipo: 'Bien' | 'Servicio';
  importeTotalRequisicion: number;
  conceptos: ConceptoPresupuestal[];
}

export interface Precompromiso {
  id: number;
  ejercicio: number;
  unidad: number;
  consecutivo: number;
  folio: string;
  estatus: 'Capturado' | 'Comprometido' | 'Cancelado';
  requisicion: Requisicion;
  activo: boolean; // Para borrado lógico en frontend
}