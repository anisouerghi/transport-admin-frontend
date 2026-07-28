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
      {
        path: 'support-types',
        loadChildren: () =>
          import('./features/support-types/support-types.module').then((m) => m.SupportTypesModule),
      },
      {
        path: 'transport-supports',
        loadChildren: () =>
          import('./features/transport-supports/transport-supports.module').then((m) => m.TransportSupportsModule),
      },
      {
        path: 'reports',
        loadChildren: () => import('./features/reports/reports.module').then((m) => m.ReportsModule),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
