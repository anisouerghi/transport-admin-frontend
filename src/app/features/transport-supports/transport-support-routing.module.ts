import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TransportSupportListPage } from './pages/transport-support-list.page';

const routes: Routes = [{ path: '', component: TransportSupportListPage, data: { title: 'Transport supports' } }];

@NgModule({
  imports: [RouterModule.forChild(routes), TransportSupportListPage],
  exports: [RouterModule],
})
export class TransportSupportRoutingModule {}
