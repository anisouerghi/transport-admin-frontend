import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleListPage } from './pages/role-list.page';

const routes: Routes = [{ path: '', component: RoleListPage, data: { title: 'Rôles' } }];

@NgModule({
  imports: [RouterModule.forChild(routes), RoleListPage],
  exports: [RouterModule],
})
export class RoleRoutingModule {}
