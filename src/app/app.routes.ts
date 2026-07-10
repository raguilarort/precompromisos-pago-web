import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth-guard'; // Asegúrate de ajustar la ruta de importación

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
    canActivate: [authGuard], // <--- ESTE ES EL BLINDAJE
    // Ajustado a home.ts y la clase Home
    loadComponent: () => import('./features/home/home').then(m => m.Home),
    children: [
      {
        // Ruta para visualizar el listado de precompromisos
        path: 'precompromisos/list',
        loadComponent: () => import('./features/precompromisos/list/list').then(m => m.List)
      },
      {
        // Ruta para visualizar el formulario para el registro
        path: 'precompromisos/register',
        loadComponent: () => import('./features/precompromisos/register/register').then(m => m.Register)
      },
      {
        // Ruta para visualizar el detalle
        path: 'precompromisos/detail/:id',
        loadComponent: () => import('./features/precompromisos/detail/detail').then(m => m.Detail)
      },
      {
        // Ruta para editar
        path: 'precompromisos/edit/:id',
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