
export interface PrecompromisoDetailDTO {
  idPrecompromiso: number;
  folio: string;
  ejercicio: number;
  unidad: string;
  idEstatus: number;
  estatus: string;
  numeroRequisicion: string;
  idTipoContratacion: number;
  idTipoRequerimiento: number;
  conceptos: ConceptoDetailDTO[];
}

export interface ConceptoDetailDTO {
  idConcepto: number,
  descripcion: string;
  idClaveProgramatica: number;
  idPartidaEspecifica: number;
  idFuenteFinanciamiento: number;
  idClavePresupuestaria: number;
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