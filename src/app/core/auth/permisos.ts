import { Service, inject } from '@angular/core';
import { Auth } from './services/auth'
import { RolSistema } from './models/auth.model';
import { ESTATUS_PRECOMPROMISO } from '../../shared/constants/precompromiso-estatus.constants';

@Service()
export class Permisos {
    private auth = inject(Auth);

  // --------------------------------------------------------
  // 1. REGLAS BÁSICAS (CRUD)
  // --------------------------------------------------------
  puedeGestionarPrecompromisos(): boolean {
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

  puedeEditarPrecompromiso(idEstatusActual: number): boolean {
    const user = this.auth.usuarioAutenticado();
    if (!user) return false;

    if (idEstatusActual !== ESTATUS_PRECOMPROMISO.CAPTURADO) {
      return false;
    }

    const rolesPermitidos = [RolSistema.Capturista, RolSistema.Revisor, RolSistema.Administrador];
    return rolesPermitidos.includes(user.rol);
  }

  // ELIMINACIÓN (Ampliación de Regla)
  puedeEliminarPrecompromiso(idEstatusActual: number): boolean {
    const user = this.auth.usuarioAutenticado();
    if (!user) return false;

    const estatusPermitidos: number[] = [
      ESTATUS_PRECOMPROMISO.CAPTURADO, 
      ESTATUS_PRECOMPROMISO.RECHAZADO
    ];
    
    if (!estatusPermitidos.includes(idEstatusActual)) {
      return false;
    }

    const rolesPermitidos = [RolSistema.Capturista, RolSistema.Revisor, RolSistema.Administrador];
    return rolesPermitidos.includes(user.rol);
  }

  // --------------------------------------------------------
  // 2. REGLAS DE FLUJO DE TRABAJO (WORKFLOW)
  // --------------------------------------------------------

  puedeDarVistoBuenoPrecompromiso(estatusActual: string): boolean {
    const user = this.auth.usuarioAutenticado();
    if (!user) return false;
    if (user.rol === RolSistema.Administrador) return true;

    return user.rol === RolSistema.Revisor && estatusActual === 'CAPTURADO';
  }

  puedeAutorizarPrecompromiso(estatusActual: string): boolean {
    const user = this.auth.usuarioAutenticado();
    if (!user) return false;
    if (user.rol === RolSistema.Administrador) return true;

    return user.rol === RolSistema.Validador && estatusActual === 'REVISADO';
  }

  puedeLiberarPrecompromiso(estatusActual: string): boolean {
    const user = this.auth.usuarioAutenticado();
    if (!user) return false;
    if (user.rol === RolSistema.Administrador) return true;

    if (user.rol === RolSistema.Revisor && estatusActual === 'REVISADO') return true;
    if (user.rol === RolSistema.Validador && estatusActual === 'REVISADO') return true;

    return false;
  }

  
  // REVISOR
  puedeDarVistoBueno(idEstatusActual: number): boolean {
    const user = this.auth.usuarioAutenticado();
    if (!user) return false;

    if (idEstatusActual !== ESTATUS_PRECOMPROMISO.CAPTURADO) {
      return false;
    }

    const rolesPermitidos = [RolSistema.Revisor, RolSistema.Administrador];
    return rolesPermitidos.includes(user.rol);
  }

  // VALIDADOR
  puedeAutorizar(idEstatusActual: number): boolean {
    const user = this.auth.usuarioAutenticado();
    if (!user) return false;

    if (idEstatusActual !== ESTATUS_PRECOMPROMISO.REVISADO) {
      return false;
    }

    const rolesPermitidos = [RolSistema.Validador, RolSistema.Administrador];
    return rolesPermitidos.includes(user.rol);
  }

  puedeRechazar(idEstatusActual: number): boolean {
    const user = this.auth.usuarioAutenticado();
    if (!user) return false;

    if (idEstatusActual !== ESTATUS_PRECOMPROMISO.REVISADO) {
      return false;
    }

    const rolesPermitidos = [RolSistema.Validador, RolSistema.Administrador];
    return rolesPermitidos.includes(user.rol);
  }

  puedeCancelarPrecompromiso(idEstatusActual: number): boolean {
    const user = this.auth.usuarioAutenticado();
    if (!user) return false;

    if (idEstatusActual !== ESTATUS_PRECOMPROMISO.AUTORIZADO) {
      return false;
    }

    const rolesPermitidos = [RolSistema.Validador, RolSistema.Administrador];
    return rolesPermitidos.includes(user.rol);
  }


  // --------------------------------------------------------
  // 3. REGLAS DE BANDEJA DE TAREAS (INBOX)
  // --------------------------------------------------------

  tieneBandejaPendientes(): boolean {
    const user = this.auth.usuarioAutenticado();
    if (!user) return false;
    
    // Por ahora, Revisor y Validador tienen bandeja de entrada. 
    // (Podemos incluir al Capturista después para folios 'Rechazados')
    return [RolSistema.Revisor, RolSistema.Validador].includes(user.rol);
  }

  esPendienteParaMi(estatusActual: string): boolean {
    const user = this.auth.usuarioAutenticado();
    if (!user) return false;

    if (user.rol === RolSistema.Revisor) return estatusActual === 'CAPTURADO';
    if (user.rol === RolSistema.Validador) return estatusActual === 'REVISADO';

    return false;
  }
}
