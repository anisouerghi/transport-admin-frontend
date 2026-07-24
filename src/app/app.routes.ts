import { Routes } from '@angular/router';
import { DefaultLayoutComponent } from './layout/default-layout/default-layout.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: '',
    component: DefaultLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.page').then((m) => m.DashboardPage),
        data: { title: 'Dashboard' },
      },
      {
        path: 'users',
        loadChildren: () =>
          import('./features/users/users.module').then((m) => m.UsersModule),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
