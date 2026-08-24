import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReclamationTypeListPage } from './pages/reclamation-type-list.page';

const routes: Routes = [
  { path: '', component: ReclamationTypeListPage, data: { title: 'Types de réclamation' } },
];

@NgModule({
  imports: [RouterModule.forChild(routes), ReclamationTypeListPage],
  exports: [RouterModule],
})
export class ReclamationTypeRoutingModule {}