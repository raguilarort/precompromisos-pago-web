
export interface PrecompromisoRequestDTO {
  ejercicio: number;
  unidad: number;
  numeroRequisicion: string;
  tipoContratacion: number;
  tipoRequerimiento: number;
  conceptos: ConceptoRequestDTO[];
}

// Interfaz para tipar la respuesta de éxito del backend
export interface PrecompromisoResponse {
  mensaje: string;
  folio?: string;
}


export interface ConceptoRequestDTO {
  idConcepto?: number;
  descripcion: string;
  idCvePresupuestaria: number;
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