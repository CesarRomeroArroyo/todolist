import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'categories',
    loadComponent: () => import('./pages/categories/categories.page').then(m => m.CategoriesPage)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
