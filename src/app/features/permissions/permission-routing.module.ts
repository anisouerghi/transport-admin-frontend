import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionListPage } from './pages/permission-list.page';

const routes: Routes = [{ path: '', component: PermissionListPage, data: { title: 'Permissions' } }];

@NgModule({
  imports: [RouterModule.forChild(routes), PermissionListPage],
  exports: [RouterModule],
})
export class PermissionRoutingModule {}
