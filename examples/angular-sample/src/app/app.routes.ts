import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile.component').then((m) => m.ProfileComponent),
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./pages/products.component').then((m) => m.ProductsComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
