export const ESTATUS_PRECOMPROMISO = {
  CAPTURADO: 1,
  REVISADO: 2,
  AUTORIZADO: 3,
  COMPROMETIDO: 4,
  RECHAZADO: 5,
  CANCELADO: 6,
  ELIMINADO: 7
} as const;

// Opcional: Si necesitas extraer solo los valores numéricos como un tipo
export type TipoEstatusPrecompromiso = typeof ESTATUS_PRECOMPROMISO[keyof typeof ESTATUS_PRECOMPROMISO];