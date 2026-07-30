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
import { ReportReplyRequest, Report, Status } from '../models/report.model';
import { ReportsService } from '../services/reports.service';

@Component({
  selector: 'app-report-reply-modal',
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
  templateUrl: './report-reply-modal.component.html',
})
export class ReportReplyModalComponent implements OnChanges {
  private readonly reportsService = inject(ReportsService);
  private readonly notifications = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  @Input() visible = false;
  @Input() report: Report | null = null;
  @Input() userId = 1;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() replied = new EventEmitter<void>();

  readonly saving = signal(false);
  readonly submitted = signal(false);
  readonly statuses = signal<Status[]>([]);

  readonly form = this.fb.nonNullable.group({
    message: ['', [Validators.required, Validators.maxLength(2000)]],
    statusId: '' as string | number,
    sendEmail: false,
    publish: false,
    publicResponse: false,
  });

  ngOnChanges(): void {
    this.submitted.set(false);
    if (!this.visible) {
      this.form.reset({ message: '', statusId: '', sendEmail: false, publish: false, publicResponse: false });
      return;
    }
    if (this.statuses().length === 0) {
      this.loadStatuses();
    }
    const currentStatusId = this.report?.status?.statusId ?? '';
    this.form.reset({ message: '', statusId: currentStatusId, sendEmail: false, publish: false, publicResponse: false });
  }

  close(): void {
    this.visibleChange.emit(false);
  }

  submit(): void {
    this.submitted.set(true);
    if (this.form.invalid || !this.report) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: ReportReplyRequest = {
      message: raw.message,
      userId: this.userId,
      sendEmail: raw.sendEmail,
      publish: raw.publish,
      publicResponse: raw.publicResponse,
    };
    const statusId = Number(raw.statusId);
    if (!Number.isNaN(statusId) && statusId > 0) {
      payload.statusId = statusId;
    }

    this.saving.set(true);
    this.reportsService.createReply(this.report.reportId, payload).subscribe({
      next: () => {
        this.notifications.success('Reply created');
        this.saving.set(false);
        this.replied.emit();
        this.close();
      },
      error: () => {
        this.saving.set(false);
      },
    });
  }

  private loadStatuses(): void {
    this.reportsService.getStatuses().subscribe({
      next: (statuses) => this.statuses.set(statuses),
      error: () => {},
    });
  }
}
