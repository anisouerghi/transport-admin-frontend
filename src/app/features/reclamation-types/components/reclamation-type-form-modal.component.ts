import { Component, EventEmitter, Input, OnChanges, Output, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ButtonCloseDirective, ButtonDirective, FormControlDirective, FormDirective,
  ModalBodyComponent, ModalComponent, ModalFooterComponent, ModalHeaderComponent,
  ModalTitleDirective,
} from '@coreui/angular';
import { NotificationService } from '../../../core/services/notification.service';
import { ReclamationType, ReclamationTypeRequest } from '../models/reclamation-type.model';
import { ReclamationTypesService } from '../services/reclamation-types.service';

@Component({
  selector: 'app-reclamation-type-form-modal', standalone: true,
  imports: [ReactiveFormsModule, ModalComponent, ModalHeaderComponent, ModalTitleDirective,
    ModalBodyComponent, ModalFooterComponent, ButtonCloseDirective, ButtonDirective,
    FormDirective, FormControlDirective],
  templateUrl: './reclamation-type-form-modal.component.html',
})
export class ReclamationTypeFormModalComponent implements OnChanges {
  private readonly service = inject(ReclamationTypesService);
  private readonly notifications = inject(NotificationService);
  private readonly fb = inject(FormBuilder);
  @Input() visible = false;
  @Input() item: ReclamationType | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<void>();
  readonly saving = signal(false);
  readonly submitted = signal(false);
  readonly form = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.maxLength(50)]],
    label: ['', [Validators.required, Validators.maxLength(150)]],
  });

  get isEdit(): boolean { return this.item !== null; }
  ngOnChanges(): void {
    this.submitted.set(false);
    this.form.reset(this.item ? { code: this.item.code, label: this.item.label } : { code: '', label: '' });
  }
  close(): void { this.visibleChange.emit(false); }
  onVisibleChange(value: boolean): void { this.visibleChange.emit(value); }
  submit(): void {
    this.submitted.set(true);
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const payload: ReclamationTypeRequest = this.form.getRawValue();
    this.saving.set(true);
    const request = this.isEdit && this.item
      ? this.service.update(this.item.reclamationTypeId, payload) : this.service.create(payload);
    request.subscribe({
      next: () => { this.notifications.success(this.isEdit ? 'Type de réclamation modifié' : 'Type de réclamation créé'); this.saving.set(false); this.saved.emit(); this.close(); },
      error: () => this.saving.set(false),
    });
  }
  fieldInvalid(name: keyof typeof this.form.controls): boolean { const control = this.form.controls[name]; return control.invalid && (control.touched || this.submitted()); }
  fieldTouchedValid(name: keyof typeof this.form.controls): boolean | undefined { const control = this.form.controls[name]; return control.touched || this.submitted() ? control.valid : undefined; }
}