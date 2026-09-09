import { HistorialSeguimiento } from "./precompromiso.model";

export interface Precompromiso {
  id: number;
  ejercicio: number;
  unidad: number;
  consecutivo: number;
  folio: string;
  numeroRequisicion: string;
  tipoContratacion: number;
  tipoRequerimiento: number;
  historial?: HistorialSeguimiento[];
}