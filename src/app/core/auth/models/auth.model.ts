export enum RolSistema {
  Consultor = 1,
  Capturista = 2,
  Revisor = 3,
  Validador = 4,
  Administrador = 5
}

export interface UsuarioSession {
  id: number;
  email: string;
  rol: RolSistema; 
  unidadesPermitidas: number[]; 
}