import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ButtonCloseDirective,
  ButtonDirective,
  ColComponent,
  FormControlDirective,
  FormDirective,
  FormLabelDirective,
  ModalBodyComponent,
  ModalComponent,
  ModalFooterComponent,
  ModalHeaderComponent,
  ModalTitleDirective,
  RowComponent,
} from '@coreui/angular';
import { NotificationService } from '../../../core/services/notification.service';
import { RolesService } from '../../roles/services/roles.service';
import { Role } from '../../roles/models/role.model';
import { User, UserRequest } from '../models/user.model';
import { UsersService } from '../services/users.service';

@Component({
  selector: 'app-user-form-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ModalComponent,
    ModalHeaderComponent,
    ModalTitleDirective,
    ModalBodyComponent,
    ModalFooterComponent,
    ButtonCloseDirective,
    ButtonDirective,
    FormDirective,
    FormLabelDirective,
    FormControlDirective,
    RowComponent,
    ColComponent,
  ],
  templateUrl: './user-form-modal.component.html',
})
export class UserFormModalComponent implements OnChanges {
  private readonly usersService = inject(UsersService);
  private readonly rolesService = inject(RolesService);
  private readonly notifications = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  @Input() visible = false;
  @Input() user: User | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<void>();

  readonly saving = signal(false);
  readonly submitted = signal(false);
  readonly roles = signal<Role[]>([]);
  readonly selectedRoleIds = signal<Set<number>>(new Set());

  readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.maxLength(100)]],
    name: ['', [Validators.required, Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    password: [''],
  });

  get isEdit(): boolean {
    return this.user != null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] || changes['user']) {
      this.submitted.set(false);
      if (this.visible) {
        this.loadRoles();
      }
      if (this.user) {
        this.form.reset({
          username: this.user.username,
          name: this.user.name,
          email: this.user.email,
          password: '',
        });
        this.form.controls.password.clearValidators();
      } else {
        this.form.reset({ username: '', name: '', email: '', password: '' });
        this.form.controls.password.setValidators([
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(100),
        ]);
        this.selectedRoleIds.set(new Set());
      }
      this.form.controls.password.updateValueAndValidity();
    }
  }

  toggleRole(id: number, checked: boolean): void {
    const next = new Set(this.selectedRoleIds());
    if (checked) next.add(id);
    else next.delete(id);
    this.selectedRoleIds.set(next);
  }

  isRoleChecked(id: number): boolean {
    return this.selectedRoleIds().has(id);
  }

  close(): void {
    this.visibleChange.emit(false);
  }

  onVisibleChange(value: boolean): void {
    this.visibleChange.emit(value);
  }

  submit(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: UserRequest = {
      username: raw.username,
      name: raw.name,
      email: raw.email,
      roleIds: [...this.selectedRoleIds()],
    };
    if (raw.password.trim()) {
      payload.password = raw.password;
    }

    this.saving.set(true);
    const request$ =
      this.isEdit && this.user
        ? this.usersService.updateUser(this.user.userId, payload)
        : this.usersService.createUser({ ...payload, password: raw.password });

    request$.subscribe({
      next: () => {
        this.notifications.success(this.isEdit ? 'User updated' : 'User created');
        this.saving.set(false);
        this.saved.emit();
        this.close();
      },
      error: () => this.saving.set(false),
    });
  }

  fieldInvalid(name: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.submitted());
  }

  fieldTouchedValid(name: keyof typeof this.form.controls): boolean | undefined {
    const control = this.form.controls[name];
    if (!(control.touched || this.submitted())) {
      return undefined;
    }
    return control.valid;
  }

  private loadRoles(): void {
    this.rolesService.getAll().subscribe({
      next: (roles) => {
        this.roles.set(roles);
        if (this.user?.roles?.length) {
          const ids = roles
            .filter((r) => this.user!.roles!.includes(r.code))
            .map((r) => r.roleId);
          this.selectedRoleIds.set(new Set(ids));
        } else if (!this.user) {
          this.selectedRoleIds.set(new Set());
        }
      },
    });
  }
}
