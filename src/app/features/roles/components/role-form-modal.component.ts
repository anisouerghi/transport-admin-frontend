import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ButtonCloseDirective,
  ButtonDirective,
  FormControlDirective,
  FormDirective,
  FormLabelDirective,
  ModalBodyComponent,
  ModalComponent,
  ModalFooterComponent,
  ModalHeaderComponent,
  ModalTitleDirective,
  SpinnerComponent,
  TableDirective,
} from '@coreui/angular';
import { NotificationService } from '../../../core/services/notification.service';
import { PermissionMatrix, PermissionMatrixCell, Role, RoleReportType, RoleRequest } from '../models/role.model';
import { RolesService } from '../services/roles.service';

@Component({
  selector: 'app-role-form-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
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
    TableDirective,
    SpinnerComponent,
  ],
  templateUrl: './role-form-modal.component.html',
})
export class RoleFormModalComponent implements OnChanges {
  private readonly service = inject(RolesService);
  private readonly notifications = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  @Input() visible = false;
  @Input() item: Role | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<void>();

  readonly saving = signal(false);
  readonly loadingMatrix = signal(false);
  readonly loadingReportTypes = signal(false);
  readonly matrix = signal<PermissionMatrix | null>(null);
  readonly selectedIds = signal<Set<number>>(new Set());
  readonly selectedReportTypeIds = signal<Set<number>>(new Set());
  readonly availableReportTypes = signal<RoleReportType[]>([]);
  reportTypeQuery = '';

  readonly form = this.fb.nonNullable.group({
    code: ['', Validators.required],
    label: ['', Validators.required],
    description: [''],
    active: [true],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (this.visible) {
      this.loadMatrix();
      this.loadReportTypes();
      this.reportTypeQuery = '';
      if (this.item) {
        this.form.reset({
          code: this.item.code,
          label: this.item.label,
          description: this.item.description || '',
          active: this.item.active,
        });
        this.selectedIds.set(new Set(this.item.permissions?.map((p) => p.permissionId) ?? []));
        this.selectedReportTypeIds.set(
          new Set(this.item.reportTypes?.map((t) => t.reportTypeId) ?? []),
        );
      } else {
        this.form.reset({ code: '', label: '', description: '', active: true });
        this.selectedIds.set(new Set());
        this.selectedReportTypeIds.set(new Set());
      }
    }
  }

  filteredReportTypes(): RoleReportType[] {
    const q = this.reportTypeQuery.trim().toLowerCase();
    const selected = this.selectedReportTypeIds();
    const active = this.availableReportTypes();
    const assignedInactive = (this.item?.reportTypes ?? []).filter(
      (t) => !t.active && selected.has(t.reportTypeId),
    );
    const merged = [...active];
    for (const type of assignedInactive) {
      if (!merged.some((t) => t.reportTypeId === type.reportTypeId)) {
        merged.push(type);
      }
    }
    if (!q) {
      return merged;
    }
    return merged.filter((t) => {
      const label = `${t.labelFr || ''} ${t.label || ''} ${t.code || ''}`.toLowerCase();
      return label.includes(q);
    });
  }

  cell(moduleCode: string, action: string): PermissionMatrixCell | null {
    const m = this.matrix()?.modules.find((x) => x.moduleCode === moduleCode);
    return m?.permissions?.[action] ?? null;
  }

  togglePermission(id: number, checked: boolean): void {
    const next = new Set(this.selectedIds());
    if (checked) next.add(id);
    else next.delete(id);
    this.selectedIds.set(next);
  }

  isChecked(id: number): boolean {
    return this.selectedIds().has(id);
  }

  toggleReportType(id: number, checked: boolean): void {
    const next = new Set(this.selectedReportTypeIds());
    if (checked) next.add(id);
    else next.delete(id);
    this.selectedReportTypeIds.set(next);
  }

  isReportTypeChecked(id: number): boolean {
    return this.selectedReportTypeIds().has(id);
  }

  toggleModuleRow(moduleCode: string, checked: boolean): void {
    const module = this.matrix()?.modules.find((m) => m.moduleCode === moduleCode);
    if (!module) return;
    const next = new Set(this.selectedIds());
    for (const cell of Object.values(module.permissions)) {
      if (!cell) continue;
      if (checked) next.add(cell.permissionId);
      else next.delete(cell.permissionId);
    }
    this.selectedIds.set(next);
  }

  close(): void {
    this.visibleChange.emit(false);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const payload: RoleRequest = {
      code: raw.code.trim().toUpperCase(),
      label: raw.label,
      description: raw.description || undefined,
      active: raw.active,
      permissionIds: [...this.selectedIds()],
      reportTypeIds: [...this.selectedReportTypeIds()],
    };
    this.saving.set(true);
    const req$ = this.item
      ? this.service.update(this.item.roleId, payload)
      : this.service.create(payload);
    req$.subscribe({
      next: () => {
        this.notifications.success(this.item ? 'Rôle mis à jour' : 'Rôle créé');
        this.saving.set(false);
        this.saved.emit();
        this.close();
      },
      error: () => this.saving.set(false),
    });
  }

  private loadMatrix(): void {
    this.loadingMatrix.set(true);
    this.service.getPermissionMatrix().subscribe({
      next: (matrix) => {
        this.matrix.set(matrix);
        this.loadingMatrix.set(false);
      },
      error: () => this.loadingMatrix.set(false),
    });
  }

  private loadReportTypes(): void {
    this.loadingReportTypes.set(true);
    this.service.getActiveReportTypes().subscribe({
      next: (types) => {
        this.availableReportTypes.set(types);
        this.loadingReportTypes.set(false);
      },
      error: () => {
        this.availableReportTypes.set([]);
        this.loadingReportTypes.set(false);
      },
    });
  }
}
