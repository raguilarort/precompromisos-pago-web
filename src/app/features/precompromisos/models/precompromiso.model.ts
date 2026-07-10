export interface Precompromiso {
  id: string;
  folio: string;
  cliente: string;
  monto: number;
  fechaRegistro: Date;
  fechaCompromiso: Date;
  descripcion: string;
  // Bandera para el borrado lógico
  activo: boolean; 
}