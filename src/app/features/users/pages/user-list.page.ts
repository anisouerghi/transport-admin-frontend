import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  BadgeComponent,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  FormControlDirective,
  FormDirective,
  FormLabelDirective,
  FormSelectDirective,
  PageItemDirective,
  PageLinkDirective,
  PaginationComponent,
  RowComponent,
  SpinnerComponent,
  TableDirective,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal.component';
import { UserFormModalComponent } from '../components/user-form-modal.component';
import { User, UserFilter } from '../models/user.model';
import { UsersService } from '../services/users.service';

type ConfirmAction = 'delete' | 'activate' | 'deactivate';

@Component({
  selector: 'app-user-list-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    RowComponent,
    ColComponent,
    FormDirective,
    FormLabelDirective,
    FormControlDirective,
    FormSelectDirective,
    ButtonDirective,
    TableDirective,
    PaginationComponent,
    PageItemDirective,
    PageLinkDirective,
    SpinnerComponent,
    IconDirective,
    BadgeComponent,
    UserFormModalComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './user-list.page.html',
})
export class UserListPage implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly notifications = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly actionBusy = signal(false);
  readonly users = signal<User[]>([]);
  readonly totalElements = signal(0);
  readonly totalPages = signal(1);
  readonly page = signal(0);
  readonly size = 10;

  readonly formModalVisible = signal(false);
  readonly editingUser = signal<User | null>(null);

  readonly confirmVisible = signal(false);
  readonly confirmAction = signal<ConfirmAction>('delete');
  readonly confirmUser = signal<User | null>(null);

  readonly filterForm = this.fb.nonNullable.group({
    username: '',
    name: '',
    email: '',
    active: '' as '' | 'true' | 'false',
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const raw = this.filterForm.getRawValue();
    const filter: UserFilter = {
      username: raw.username,
      name: raw.name,
      email: raw.email,
      active: raw.active === '' ? null : raw.active === 'true',
    };
    this.usersService.getUsers(this.page(), this.size, filter).subscribe({
      next: (result) => {
        this.users.set(result.content);
        this.totalElements.set(result.totalElements);
        this.totalPages.set(result.totalPages);
        this.page.set(result.page);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  search(): void {
    this.page.set(0);
    this.load();
  }

  resetFilters(): void {
    this.filterForm.reset({ username: '', name: '', email: '', active: '' });
    this.page.set(0);
    this.load();
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages()) {
      return;
    }
    this.page.set(page);
    this.load();
  }

  openCreate(): void {
    this.editingUser.set(null);
    this.formModalVisible.set(true);
  }

  openEdit(user: User): void {
    this.editingUser.set(user);
    this.formModalVisible.set(true);
  }

  askDelete(user: User): void {
    this.confirmUser.set(user);
    this.confirmAction.set('delete');
    this.confirmVisible.set(true);
  }

  askActivate(user: User): void {
    this.confirmUser.set(user);
    this.confirmAction.set('activate');
    this.confirmVisible.set(true);
  }

  askDeactivate(user: User): void {
    this.confirmUser.set(user);
    this.confirmAction.set('deactivate');
    this.confirmVisible.set(true);
  }

  get confirmTitle(): string {
    switch (this.confirmAction()) {
      case 'activate':
        return 'Activate user';
      case 'deactivate':
        return 'Deactivate user';
      default:
        return 'Delete user';
    }
  }

  get confirmMessage(): string {
    const user = this.confirmUser();
    const name = user?.username ?? '';
    switch (this.confirmAction()) {
      case 'activate':
        return `Do you want to activate user « ${name} » ?`;
      case 'deactivate':
        return `Do you want to deactivate user « ${name} » ?`;
      default:
        return `Do you want to permanently delete user « ${name} » ? This action cannot be undone.`;
    }
  }

  get confirmLabel(): string {
    switch (this.confirmAction()) {
      case 'activate':
        return 'Activate';
      case 'deactivate':
        return 'Deactivate';
      default:
        return 'Delete';
    }
  }

  get confirmColor(): 'primary' | 'danger' | 'warning' | 'success' {
    switch (this.confirmAction()) {
      case 'activate':
        return 'success';
      case 'deactivate':
        return 'warning';
      default:
        return 'danger';
    }
  }

  onConfirm(): void {
    const user = this.confirmUser();
    if (!user) {
      return;
    }

    this.actionBusy.set(true);
    const action = this.confirmAction();

    const done = (message: string) => {
      this.notifications.success(message);
      this.actionBusy.set(false);
      this.confirmVisible.set(false);
      this.confirmUser.set(null);
      this.load();
    };
    const fail = () => this.actionBusy.set(false);

    if (action === 'delete') {
      this.usersService.deleteUser(user.userId).subscribe({
        next: () => done('User deleted'),
        error: fail,
      });
      return;
    }

    if (action === 'activate') {
      this.usersService.activateUser(user.userId).subscribe({
        next: () => done('User activated'),
        error: fail,
      });
      return;
    }

    this.usersService.deactivateUser(user.userId).subscribe({
      next: () => done('User deactivated'),
      error: fail,
    });
  }

  pages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i);
  }
}
