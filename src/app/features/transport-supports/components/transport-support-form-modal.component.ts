import { Component, EventEmitter, Input, OnChanges, Output, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ButtonCloseDirective,
  ButtonDirective,
  ColComponent,
  FormControlDirective,
  FormDirective,
  FormLabelDirective,
  FormSelectDirective,
  ModalBodyComponent,
  ModalComponent,
  ModalFooterComponent,
  ModalHeaderComponent,
  ModalTitleDirective,
  RowComponent,
} from '@coreui/angular';
import { NotificationService } from '../../../core/services/notification.service';
import { SupportType } from '../../support-types/models/support-type.model';
import { SupportTypesService } from '../../support-types/services/support-types.service';
import { SUPPORT_STATUSES, TransportSupport, TransportSupportRequest } from '../models/transport-support.model';
import { TransportSupportsService } from '../services/transport-supports.service';

@Component({
  selector: 'app-transport-support-form-modal',
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
    FormSelectDirective,
    RowComponent,
    ColComponent,
  ],
  templateUrl: './transport-support-form-modal.component.html',
})
export class TransportSupportFormModalComponent implements OnChanges {
  private readonly service = inject(TransportSupportsService);
  private readonly supportTypesService = inject(SupportTypesService);
  private readonly notifications = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  @Input() visible = false;
  @Input() item: TransportSupport | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<void>();

  readonly saving = signal(false);
  readonly submitted = signal(false);
  readonly supportTypes = signal<SupportType[]>([]);
  readonly statuses = SUPPORT_STATUSES;

  readonly form = this.fb.nonNullable.group({
    reference: ['', [Validators.required, Validators.maxLength(50)]],
    label: ['', [Validators.required, Validators.maxLength(150)]],
    supportTypeId: [0, [Validators.required, Validators.min(1)]],
    supportStatus: 'ACTIVE',
  });

  get isEdit(): boolean {
    return this.item != null;
  }

  ngOnChanges(): void {
    this.submitted.set(false);
    this.supportTypesService.getAll().subscribe((types) => this.supportTypes.set(types));
    if (this.item) {
      this.form.reset({
        reference: this.item.reference,
        label: this.item.label,
        supportTypeId: this.item.supportTypeId,
        supportStatus: this.item.supportStatus,
      });
    } else {
      this.form.reset({ reference: '', label: '', supportTypeId: 0, supportStatus: 'ACTIVE' });
    }
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
    const payload: TransportSupportRequest = {
      reference: raw.reference,
      label: raw.label,
      supportTypeId: Number(raw.supportTypeId),
      supportStatus: raw.supportStatus,
    };
    if (this.isEdit && this.item?.version != null) {
      payload.version = this.item.version;
    }
    this.saving.set(true);
    const req$ =
      this.isEdit && this.item
        ? this.service.update(this.item.transportSupportId, payload)
        : this.service.create(payload);
    req$.subscribe({
      next: () => {
        this.notifications.success(this.isEdit ? 'Transport support updated' : 'Transport support created');
        this.saving.set(false);
        this.saved.emit();
        this.close();
      },
      error: () => this.saving.set(false),
    });
  }

  fieldInvalid(name: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || this.submitted());
  }

  fieldTouchedValid(name: keyof typeof this.form.controls): boolean | undefined {
    const c = this.form.controls[name];
    if (!(c.touched || this.submitted())) return undefined;
    return c.valid;
  }
}
