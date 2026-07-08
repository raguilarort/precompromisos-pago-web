import { Routes } from '@angular/router';

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
    // Ajustado a home.ts y la clase Home
    loadComponent: () => import('./features/home/home').then(m => m.Home),
    children: [
      {
        path: 'commitments/list',
        // Ajustado a list.ts y la clase List
        loadComponent: () => import('./features/commitments/list/list').then(m => m.List)
      },
      {
        path: 'commitments/register',
        // Ajustado a register.ts y la clase Register
        loadComponent: () => import('./features/commitments/register/register').then(m => m.Register)
      },
      {
        path: 'commitments',
        redirectTo: 'commitments/list',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'portal'
  }
];