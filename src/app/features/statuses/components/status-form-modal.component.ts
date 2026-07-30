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
import { Status, StatusRequest } from '../models/status.model';
import { StatusesService } from '../services/statuses.service';

@Component({
  selector: 'app-status-form-modal',
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
  templateUrl: './status-form-modal.component.html',
})
export class StatusFormModalComponent implements OnChanges {
  private readonly service = inject(StatusesService);
  private readonly notifications = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  @Input() visible = false;
  @Input() item: Status | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<void>();

  readonly saving = signal(false);
  readonly submitted = signal(false);

  readonly form = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.maxLength(100)]],
    label: ['', [Validators.required, Validators.maxLength(150)]],
    displayOrder: [0, [Validators.required, Validators.min(0)]],
  });

  get isEdit(): boolean {
    return this.item != null;
  }

  ngOnChanges(): void {
    this.submitted.set(false);
    if (this.item) {
      this.form.reset({
        code: this.item.code,
        label: this.item.label,
        displayOrder: this.item.displayOrder,
      });
    } else {
      this.form.reset({ code: '', label: '', displayOrder: 0 });
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
    const payload: StatusRequest = {
      code: raw.code,
      label: raw.label,
      displayOrder: raw.displayOrder,
    };

    this.saving.set(true);
    const request$ = this.isEdit && this.item
      ? this.service.update(this.item.statusId, payload)
      : this.service.create(payload);

    request$.subscribe({
      next: () => {
        this.notifications.success(this.isEdit ? 'Status updated' : 'Status created');
        this.saving.set(false);
        this.saved.emit();
        this.close();
      },
      error: () => {
        this.saving.set(false);
      },
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
}
