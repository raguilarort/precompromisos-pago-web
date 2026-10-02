export interface SituacionPresupuestalAnualPorClaveDTO {
  idCvePresupuestaria: number;
  clavePresupuestariaFormateada: string;
  descUnidad: string;
  descPrograma: string;
  descPartida: string;
  descFuente: string;

  totalDisponibleSAPFIN: number;
  totalPrecomprometido: number;
  totalDisponibleNeto: number;

  disponibleSAPFINEnero: number; disponibleSAPFINFebrero: number; disponibleSAPFINMarzo: number; disponibleSAPFINAbril: number;
  disponibleSAPFINMayo: number; disponibleSAPFINJunio: number; disponibleSAPFINJulio: number; disponibleSAPFINAgosto: number;
  disponibleSAPFINSeptiembre: number; disponibleSAPFINOctubre: number; disponibleSAPFINNoviembre: number; disponibleSAPFINDiciembre: number;

  precomprometidoEnero: number; precomprometidoFebrero: number; precomprometidoMarzo: number; precomprometidoAbril: number;
  precomprometidoMayo: number; precomprometidoJunio: number; precomprometidoJulio: number; precomprometidoAgosto: number;
  precomprometidoSeptiembre: number; precomprometidoOctubre: number; precomprometidoNoviembre: number; precomprometidoDiciembre: number;

  disponibleNetoEnero: number; disponibleNetoFebrero: number; disponibleNetoMarzo: number; disponibleNetoAbril: number;
  disponibleNetoMayo: number; disponibleNetoJunio: number; disponibleNetoJulio: number; disponibleNetoAgosto: number;
  disponibleNetoSeptiembre: number; disponibleNetoOctubre: number; disponibleNetoNoviembre: number; disponibleNetoDiciembre: number;
}