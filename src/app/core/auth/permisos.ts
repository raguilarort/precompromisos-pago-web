import { Service, inject } from '@angular/core';
import { Auth } from './auth'
import { RolSistema } from './models/auth.model';

@Service()
export class Permisos {
    private auth = inject(Auth);

  // --------------------------------------------------------
  // 1. REGLAS BÁSICAS (CRUD)
  // --------------------------------------------------------
  
  puedeCrearNuevoPrecompromiso(): boolean {
    const user = this.auth.usuarioAutenticado();
    if (!user) return false;
    
    const rolesPermitidos = [
      RolSistema.Capturista, 
      RolSistema.Revisor, 
      RolSistema.Validador, 
      RolSistema.Administrador
    ];

    return rolesPermitidos.includes(user.rol);
  }

  puedeEditarPrecompromiso(estatusActual: string): boolean {
    const user = this.auth.usuarioAutenticado();
    if (!user) return false;
    if (user.rol === RolSistema.Administrador) return true;

    const rolesPermitidos = [RolSistema.Capturista, RolSistema.Revisor];
    return rolesPermitidos.includes(user.rol) && estatusActual === 'Capturado';
  }

  puedeEliminarPrecompromiso(estatusActual: string): boolean {
    const user = this.auth.usuarioAutenticado();
    if (!user) return false;
    if (user.rol === RolSistema.Administrador) return true;

    const rolesPermitidos = [RolSistema.Capturista, RolSistema.Revisor];
    return rolesPermitidos.includes(user.rol) && estatusActual === 'Capturado';
  }

  // --------------------------------------------------------
  // 2. REGLAS DE FLUJO DE TRABAJO (WORKFLOW)
  // --------------------------------------------------------

  puedeDarVistoBuenoPrecompromiso(estatusActual: string): boolean {
    const user = this.auth.usuarioAutenticado();
    if (!user) return false;
    if (user.rol === RolSistema.Administrador) return true;

    return user.rol === RolSistema.Revisor && estatusActual === 'Capturado';
  }

  puedeAutorizarPrecompromiso(estatusActual: string): boolean {
    const user = this.auth.usuarioAutenticado();
    if (!user) return false;
    if (user.rol === RolSistema.Administrador) return true;

    return user.rol === RolSistema.Validador && estatusActual === 'Revisado';
  }

  puedeLiberarPrecompromiso(estatusActual: string): boolean {
    const user = this.auth.usuarioAutenticado();
    if (!user) return false;
    if (user.rol === RolSistema.Administrador) return true;

    if (user.rol === RolSistema.Revisor && estatusActual === 'Revisado') return true;
    if (user.rol === RolSistema.Validador && estatusActual === 'Revisado') return true;

    return false;
  }

  puedeCancelarPrecompromiso(estatusActual: string): boolean {
    const user = this.auth.usuarioAutenticado();
    if (!user) return false;
    if (user.rol === RolSistema.Administrador) return true;

    return user.rol === RolSistema.Validador && estatusActual === 'Autorizado';
  }
}
