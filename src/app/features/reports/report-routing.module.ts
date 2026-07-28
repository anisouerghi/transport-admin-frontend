import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportListPage } from './pages/report-list.page';

const routes: Routes = [
  {
    path: '',
    component: ReportListPage,
    data: { title: 'Reports' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes), ReportListPage],
  exports: [RouterModule],
})
export class ReportRoutingModule {}
