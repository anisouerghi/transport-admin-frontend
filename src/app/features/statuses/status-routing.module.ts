import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StatusListPage } from './pages/status-list.page';

const routes: Routes = [
  { path: '', component: StatusListPage, data: { title: 'Statuses' } },
];

@NgModule({
  imports: [RouterModule.forChild(routes), StatusListPage],
  exports: [RouterModule],
})
export class StatusRoutingModule {}
