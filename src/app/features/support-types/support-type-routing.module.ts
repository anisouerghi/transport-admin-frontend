import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SupportTypeListPage } from './pages/support-type-list.page';

const routes: Routes = [{ path: '', component: SupportTypeListPage, data: { title: 'Support types' } }];

@NgModule({
  imports: [RouterModule.forChild(routes), SupportTypeListPage],
  exports: [RouterModule],
})
export class SupportTypeRoutingModule {}
