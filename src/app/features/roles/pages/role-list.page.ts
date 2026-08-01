import { Component, OnInit, inject, signal } from '@angular/core';
import {
  BadgeComponent,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  SpinnerComponent,
  TableDirective,
} from '@coreui/angular';
import { NotificationService } from '../../../core/services/notification.service';
import { HasPermissionDirective } from '../../../core/directives/has-permission.directive';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal.component';
import { RoleFormModalComponent } from '../components/role-form-modal.component';
import { Role } from '../models/role.model';
import { RolesService } from '../services/roles.service';

@Component({
  selector: 'app-role-list-page',
  standalone: true,
  imports: [
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    ButtonDirective,
    TableDirective,
    SpinnerComponent,
    BadgeComponent,
    HasPermissionDirective,
    RoleFormModalComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './role-list.page.html',
})
export class RoleListPage implements OnInit {
  private readonly service = inject(RolesService);
  private readonly notifications = inject(NotificationService);

  readonly loading = signal(false);
  readonly actionBusy = signal(false);
  readonly items = signal<Role[]>([]);
  readonly formVisible = signal(false);
  readonly editing = signal<Role | null>(null);
  readonly confirmVisible = signal(false);
  readonly confirmItem = signal<Role | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.service.getAll().subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openCreate(): void {
    this.editing.set(null);
    this.formVisible.set(true);
  }

  openEdit(item: Role): void {
    this.editing.set(item);
    this.formVisible.set(true);
  }

  askDelete(item: Role): void {
    this.confirmItem.set(item);
    this.confirmVisible.set(true);
  }

  onConfirmDelete(): void {
    const item = this.confirmItem();
    if (!item) return;
    this.actionBusy.set(true);
    this.service.delete(item.roleId).subscribe({
      next: () => {
        this.notifications.success('Rôle supprimé');
        this.actionBusy.set(false);
        this.confirmVisible.set(false);
        this.confirmItem.set(null);
        this.load();
      },
      error: () => this.actionBusy.set(false),
    });
  }
}
