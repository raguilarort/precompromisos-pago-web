export interface FiltroCombinacionEUPPFFDTO {
  ejercicio: number;
  unidad: string;
  idCveProg?: number; // Opcional para cuando solo se busca la estructura
  idPartida?: number; // Opcional
  idFuenteFin?: number; // Opcional
}