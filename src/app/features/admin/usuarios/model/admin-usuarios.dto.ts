export interface UsuarioResponseDTO {
  idUsuario: number;
  correo: string;
  numEmpleado: number;
  activo: number;
  fechaAlta: string;
}

export interface UsuarioRolResponseDTO {
  idAsignacion: number;
  idRol: number;
  clave: string;
  descripcion: string;
  activo: number;
  fechaAsignacion: string;
}

export interface UsuarioUnidadResponseDTO {
  idAsignacion: number;
  unidadEjecutora: string;
  activo: number;
  fechaAsignacion: string;
}



export interface AdminResponseDTO {
  estatus: number;
  mensaje: string;
  idGenerado?: number;
}