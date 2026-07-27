import { Component, EventEmitter, Input, OnChanges, Output, inject, signal } from '@angular/core';
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
import { SupportType, SupportTypeRequest } from '../models/support-type.model';
import { SupportTypesService } from '../services/support-types.service';

@Component({
  selector: 'app-support-type-form-modal',
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
  templateUrl: './support-type-form-modal.component.html',
})
export class SupportTypeFormModalComponent implements OnChanges {
  private readonly service = inject(SupportTypesService);
  private readonly notifications = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  @Input() visible = false;
  @Input() item: SupportType | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<void>();

  readonly saving = signal(false);
  readonly submitted = signal(false);

  readonly form = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.maxLength(50)]],
    label: ['', [Validators.required, Validators.maxLength(150)]],
  });

  get isEdit(): boolean {
    return this.item != null;
  }

  ngOnChanges(): void {
    this.submitted.set(false);
    if (this.item) {
      this.form.reset({ code: this.item.code, label: this.item.label });
    } else {
      this.form.reset({ code: '', label: '' });
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
    const payload: SupportTypeRequest = this.form.getRawValue();
    this.saving.set(true);
    const req$ =
      this.isEdit && this.item
        ? this.service.update(this.item.supportTypeId, payload)
        : this.service.create(payload);
    req$.subscribe({
      next: () => {
        this.notifications.success(this.isEdit ? 'Support type updated' : 'Support type created');
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
