import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuditLogListPage } from './pages/audit-log-list.page';

const routes: Routes = [
  { path: '', component: AuditLogListPage, data: { title: "Journal d'audit" } },
];

@NgModule({
  imports: [RouterModule.forChild(routes), AuditLogListPage],
  exports: [RouterModule],
})
export class AuditLogRoutingModule {}
