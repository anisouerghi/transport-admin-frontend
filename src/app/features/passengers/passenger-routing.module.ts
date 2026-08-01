import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PassengerListPage } from './pages/passenger-list.page';

const routes: Routes = [
  {
    path: '',
    component: PassengerListPage,
    data: { title: 'Voyageurs' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes), PassengerListPage],
  exports: [RouterModule],
})
export class PassengerRoutingModule {}
