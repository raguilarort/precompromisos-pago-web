import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth-guard'; // Asegúrate de ajustar la ruta de importación
import { roleGuard } from './core/auth/guards/role-guard';
import { RolSistema } from './core/auth/models/auth.model';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'portal',
    pathMatch: 'full'
  },
  {
    path: 'portal',
    // Ajustado a portal.ts y la clase Portal
    loadComponent: () => import('./features/portal/portal').then(m => m.Portal)
  },
  {
    path: 'home',
    canActivate: [authGuard], // BLINDAJE NIVEL 1: Sesión activa de Microsoft
    // Ajustado a home.ts y la clase Home
    loadComponent: () => import('./features/home/home').then(m => m.Home),
    children: [
      {
        // Ruta para visualizar el listado de precompromisos
        path: 'precompromisos/list',
        // BLINDAJE NIVEL 2: Todos los perfiles del negocio pueden ver la lista
        canActivate: [roleGuard],
        data: { 
          rolesPermitidos: [
            RolSistema.Consultor, 
            RolSistema.Capturista, 
            RolSistema.Revisor, 
            RolSistema.Validador, 
            RolSistema.Administrador
          ] 
        },
        loadComponent: () => import('./features/precompromisos/list/list').then(m => m.List)
      },
      {
        // Ruta para visualizar el formulario para el registro
        path: 'precompromisos/register',
        canActivate: [roleGuard],
        data: { 
          // El Consultor queda excluido de esta ruta
          rolesPermitidos: [
            RolSistema.Capturista, 
            RolSistema.Revisor, 
            RolSistema.Validador, 
            RolSistema.Administrador
          ] 
        },
        loadComponent: () => import('./features/precompromisos/register/register').then(m => m.Register)
      },
      {
        // Ruta para visualizar el detalle
        path: 'precompromisos/detail/:id',
        canActivate: [roleGuard],
        data: { 
          rolesPermitidos: [
            RolSistema.Consultor, 
            RolSistema.Capturista, 
            RolSistema.Revisor, 
            RolSistema.Validador, 
            RolSistema.Administrador
          ] 
        },
        loadComponent: () => import('./features/precompromisos/detail/detail').then(m => m.Detail)
      },
      {
        // Ruta para editar
        path: 'precompromisos/edit/:id',
        canActivate: [roleGuard],
        data: { 
          // El Consultor queda excluido de esta ruta
          rolesPermitidos: [
            RolSistema.Capturista, 
            RolSistema.Revisor, 
            RolSistema.Validador, 
            RolSistema.Administrador
          ] 
        },
        loadComponent: () => import('./features/precompromisos/edit/edit').then(m => m.Edit)
      },
      {
        path: 'precompromisos',
        redirectTo: 'precompromisos/list',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./features/unauthorized/unauthorized').then(m => m.Unauthorized)
  },
  {
    path: '**',
    redirectTo: 'portal'
  },
];