import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportTypeListPage } from './pages/report-type-list.page';

const routes: Routes = [{ path: '', component: ReportTypeListPage, data: { title: 'Report types' } }];

@NgModule({
  imports: [RouterModule.forChild(routes), ReportTypeListPage],
  exports: [RouterModule],
})
export class ReportTypeRoutingModule {}
