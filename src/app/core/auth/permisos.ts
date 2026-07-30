import { Service, inject } from '@angular/core';
import { Auth } from './auth'
import { RolSistema } from './models/auth.model';

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

  puedeEditarPrecompromiso(estatusActual: string): boolean {
    const user = this.auth.usuarioAutenticado();
    if (!user) return false;
    if (user.rol === RolSistema.Administrador) return true;

    const rolesPermitidos = [RolSistema.Capturista, RolSistema.Revisor];
    return rolesPermitidos.includes(user.rol) && estatusActual === 'Capturado';
  }

  // ELIMINACIÓN (Ampliación de Regla)
  puedeEliminarPrecompromiso(estatusActual: string): boolean {
    const user = this.auth.usuarioAutenticado();
    if (!user) return false;
    
    // El Capturista y Revisor pueden eliminar si aún está en etapa inicial o fue rechazado
    const rolesPermitidos = [RolSistema.Capturista, RolSistema.Revisor];
    const estatusPermitidos = ['Capturado', 'Rechazado'];
    
    return rolesPermitidos.includes(user.rol) && estatusPermitidos.includes(estatusActual);
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


  
  // REVISOR
  puedeDarVistoBueno(estatusActual: string): boolean {
    const user = this.auth.usuarioAutenticado();
    return user ? user.rol === RolSistema.Revisor && estatusActual === 'Capturado' : false;
  }

  // VALIDADOR
  puedeAutorizar(estatusActual: string): boolean {
    const user = this.auth.usuarioAutenticado();
    return user ? user.rol === RolSistema.Validador && estatusActual === 'Revisado' : false;
  }

  // AMBOS (Rechazo)
  puedeRechazar(estatusActual: string): boolean {
    const user = this.auth.usuarioAutenticado();
    if (!user) return false;
    
    if (user.rol === RolSistema.Revisor && estatusActual === 'Capturado') return true;
    if (user.rol === RolSistema.Validador && estatusActual === 'Revisado') return true;
    return false;
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

    if (user.rol === RolSistema.Revisor) return estatusActual === 'Capturado';
    if (user.rol === RolSistema.Validador) return estatusActual === 'Revisado';

    return false;
  }
}
