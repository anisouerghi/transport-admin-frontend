import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StatisticsOverviewPage } from './pages/statistics-overview.page';

const routes: Routes = [
  {
    path: '',
    component: StatisticsOverviewPage,
    data: { title: 'Rapports & Statistiques' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes), StatisticsOverviewPage],
  exports: [RouterModule],
})
export class StatisticsRoutingModule {}
