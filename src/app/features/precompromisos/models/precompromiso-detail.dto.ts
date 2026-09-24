
export interface PrecompromisoDetailDTO {
  idPrecompromiso: number;
  folio: string;
  ejercicio: number;
  unidad: string;
  idEstatus: number;
  estatus: string;
  numeroRequisicion: string;
  idTipoContratacion: number;
  nombreTipoContratacion: string;
  idTipoRequerimiento: number;
  nombreTipoRequerimiento:string;
  conceptos: ConceptoDetailDTO[];
}

export interface ConceptoDetailDTO {
  idConcepto: number,
  descripcion: string;
  idClavePresupuestaria: number;
  idClaveProgramatica: number;
  claveProgramatica: string;
  descClaveProgramatica: string;
  idPartidaEspecifica: number;
  partidaEspecifica: string;
  descPartidaEspecifica: string;
  idFuenteFinanciamiento: number;
  descFuenteFinanciamiento: string;
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
}

export interface MesView {
  nombre: string;
  importe: number;
  disponible: number;
  haySuficiencia: boolean;
}

export interface ConceptoDetailView extends ConceptoDetailDTO {
  clavePresupuestariaFormateada?: string;
  importeTotal: number;
  meses: MesView[];
}

export interface PrecompromisoDetailView extends PrecompromisoDetailDTO {
  importeTotalRequisicion: number;
  conceptos: ConceptoDetailView[];
}