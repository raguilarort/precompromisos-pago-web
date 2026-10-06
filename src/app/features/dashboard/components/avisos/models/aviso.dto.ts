export interface AvisoDTO {
  id: number;
  titulo: string;
  mensaje: string;
  fecha: Date;
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
}