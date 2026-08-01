import { Routes } from '@angular/router';
import { DefaultLayoutComponent } from './layout/default-layout/default-layout.component';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login.page').then((m) => m.LoginPage),
    data: { title: 'Connexion' },
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: '',
    component: DefaultLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        canActivate: [permissionGuard],
        data: { title: 'Dashboard', permission: 'DASHBOARD_VIEW' },
        loadComponent: () =>
          import('./features/dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'users',
        canActivate: [permissionGuard],
        data: { permission: 'USER_VIEW' },
        loadChildren: () => import('./features/users/users.module').then((m) => m.UsersModule),
      },
      {
        path: 'roles',
        canActivate: [permissionGuard],
        data: { permission: 'ROLE_VIEW' },
        loadChildren: () => import('./features/roles/roles.module').then((m) => m.RolesModule),
      },
      {
        path: 'permissions',
        canActivate: [permissionGuard],
        data: { permissions: ['PERMISSION_VIEW', 'ROLE_VIEW'] },
        loadChildren: () =>
          import('./features/permissions/permissions.module').then((m) => m.PermissionsModule),
      },
      {
        path: 'support-types',
        canActivate: [permissionGuard],
        data: { permission: 'SUPPORT_TYPE_VIEW' },
        loadChildren: () =>
          import('./features/support-types/support-types.module').then((m) => m.SupportTypesModule),
      },
      {
        path: 'report-types',
        canActivate: [permissionGuard],
        data: { permission: 'REPORT_TYPE_VIEW', title: 'Report types' },
        loadComponent: () =>
          import('./features/report-types/pages/report-type-list.page').then(
            (m) => m.ReportTypeListPage
          ),
      },
      {
        path: 'transport-supports',
        canActivate: [permissionGuard],
        data: { permission: 'TRANSPORT_SUPPORT_VIEW' },
        loadChildren: () =>
          import('./features/transport-supports/transport-supports.module').then(
            (m) => m.TransportSupportsModule
          ),
      },
      {
        path: 'reports',
        canActivate: [permissionGuard],
        data: { permission: 'REPORT_VIEW' },
        loadChildren: () => import('./features/reports/reports.module').then((m) => m.ReportsModule),
      },
      {
        path: 'passengers',
        canActivate: [permissionGuard],
        data: { permission: 'PASSENGER_VIEW' },
        loadChildren: () =>
          import('./features/passengers/passengers.module').then((m) => m.PassengersModule),
      },
      {
        path: 'statistics',
        canActivate: [permissionGuard],
        data: { permission: 'REPORT_STATISTICS_VIEW' },
        loadChildren: () =>
          import('./features/statistics/statistics.module').then((m) => m.StatisticsModule),
      },
      {
        path: 'audit-logs',
        canActivate: [permissionGuard],
        data: { permission: 'AUDIT_VIEW' },
        loadChildren: () =>
          import('./features/audit-logs/audit-logs.module').then((m) => m.AuditLogsModule),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
