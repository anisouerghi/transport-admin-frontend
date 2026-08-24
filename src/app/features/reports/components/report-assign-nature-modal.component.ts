import { Component, EventEmitter, Input, OnChanges, Output, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ButtonCloseDirective,
  ButtonDirective,
  FormDirective,
  FormLabelDirective,
  FormSelectDirective,
  ModalBodyComponent,
  ModalComponent,
  ModalFooterComponent,
  ModalHeaderComponent,
  ModalTitleDirective,
} from '@coreui/angular';
import { NotificationService } from '../../../core/services/notification.service';
import { ReportNature } from '../../report-natures/models/report-nature.model';
import { ReportNaturesService } from '../../report-natures/services/report-natures.service';
import { Report } from '../models/report.model';
import { ReportsService } from '../services/reports.service';

@Component({
  selector: 'app-report-assign-nature-modal',
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
    FormSelectDirective,
  ],
  templateUrl: './report-assign-nature-modal.component.html',
})
export class ReportAssignNatureModalComponent implements OnChanges {
  private readonly naturesService = inject(ReportNaturesService);
  private readonly reportsService = inject(ReportsService);
  private readonly notifications = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  @Input() visible = false;
  @Input() report: Report | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() assigned = new EventEmitter<void>();

  readonly saving = signal(false);
  readonly natures = signal<ReportNature[]>([]);
  readonly submitted = signal(false);

  readonly form = this.fb.nonNullable.group({
    reportNatureId: ['' as string | number, Validators.required],
  });

  ngOnChanges(): void {
    this.submitted.set(false);
    if (this.visible) {
      this.loadNatures();
      this.form.reset({
        reportNatureId: this.report?.natureId ?? '',
      });
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
    if (!this.report || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue().reportNatureId;
    const natureId = raw === '' || raw === null ? null : Number(raw);
    if (natureId == null || Number.isNaN(natureId)) {
      return;
    }
    this.saving.set(true);
    this.reportsService.updateNature(this.report.reportId, natureId).subscribe({
      next: () => {
        this.notifications.success('Nature affectée');
        this.saving.set(false);
        this.assigned.emit();
        this.close();
      },
      error: () => this.saving.set(false),
    });
  }

  private loadNatures(): void {
    this.naturesService.getActive().subscribe({
      next: (items) => this.natures.set(items),
      error: () => this.natures.set([]),
    });
  }
}
