import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserListPage } from './pages/user-list.page';

const routes: Routes = [
  {
    path: '',
    component: UserListPage,
    data: { title: 'Users' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes), UserListPage],
  exports: [RouterModule],
})
export class UserRoutingModule {}
