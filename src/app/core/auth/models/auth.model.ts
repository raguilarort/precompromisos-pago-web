export enum RolSistema {
  Administrador = 1,
  Validador = 2,
  Revisor = 3,
  Capturista = 4,
  Consultor = 5
}

export interface UsuarioSession {
  id: number;
  email: string;
  rol: RolSistema; 
  unidadesPermitidas: number[]; 
}

export interface BackendAuthResponse {
  idUsuario: number;
  numEmpleado: number;
  correo: string;
  roles: string[];
  unidades: string[];
  accessToken: string;
  tokenType: string;
}