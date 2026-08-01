import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  BadgeComponent,
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
  SpinnerComponent,
} from '@coreui/angular';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PRIORITY_OPTIONS, Priority, ReportReplyRequest, Report, Status } from '../models/report.model';
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
    BadgeComponent,
    SpinnerComponent,
  ],
  templateUrl: './report-reply-modal.component.html',
})
export class ReportReplyModalComponent implements OnChanges {
  private readonly reportsService = inject(ReportsService);
  private readonly notifications = inject(NotificationService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  @Input() visible = false;
  @Input() report: Report | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() replied = new EventEmitter<void>();

  readonly saving = signal(false);
  readonly loadingReport = signal(false);
  readonly submitted = signal(false);
  readonly statuses = signal<Status[]>([]);
  /** Signalement enrichi (détail API) pour infos voyageur complètes. */
  readonly detail = signal<Report | null>(null);
  readonly priorities = PRIORITY_OPTIONS;
  readonly canUpdatePriority = () => this.auth.hasPermission('REPORT_UPDATE_PRIORITY');

  readonly form = this.fb.nonNullable.group({
    message: ['', [Validators.required, Validators.maxLength(2000)]],
    statusId: '' as string | number,
    priority: '' as Priority | '',
    sendEmail: true,
    publicResponse: true,
    publish: false,
  });

  ngOnChanges(changes: SimpleChanges): void {
    this.submitted.set(false);
    if (!this.visible) {
      this.detail.set(null);
      this.form.reset({
        message: '',
        statusId: '',
        priority: '',
        sendEmail: true,
        publicResponse: true,
        publish: false,
      });
      return;
    }
    if (this.statuses().length === 0) {
      this.loadStatuses();
    }
    const reportId = this.report?.reportId;
    if (reportId != null && (changes['visible'] || changes['report'])) {
      this.loadDetail(reportId);
    }
  }

  /** Voyageur anonyme (aucune identité). */
  isAnonymous(): boolean {
    const p = this.detail()?.passenger ?? this.report?.passenger;
    if (!p) {
      return true;
    }
    if (p.anonymous === true) {
      return true;
    }
    return !p.name?.trim() && !p.email?.trim() && !p.phoneNumber?.trim();
  }

  passengerEmail(): string | null {
    const email = this.detail()?.passenger?.email ?? this.report?.passenger?.email;
    const trimmed = email?.trim() ?? '';
    return this.isValidEmail(trimmed) ? trimmed : null;
  }

  hasPassengerEmail(): boolean {
    return !!this.passengerEmail();
  }

  close(): void {
    this.visibleChange.emit(false);
  }

  submit(): void {
    this.submitted.set(true);
    const current = this.detail() ?? this.report;
    if (this.form.invalid || !current) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const canEmail = this.hasPassengerEmail();
    const payload: ReportReplyRequest = {
      message: raw.message,
      sendEmail: canEmail ? raw.sendEmail : false,
      publicResponse: raw.publicResponse,
      publish: raw.publish,
    };
    const statusId = Number(raw.statusId);
    if (!Number.isNaN(statusId) && statusId > 0) {
      payload.statusId = statusId;
    }

    this.saving.set(true);
    const reportId = current.reportId;
    const priorityChanged =
      this.canUpdatePriority() &&
      !!raw.priority &&
      raw.priority !== current.priority;

    const afterReply = () => {
      if (!priorityChanged) {
        this.notifications.success('Réponse envoyée');
        this.saving.set(false);
        this.replied.emit();
        this.close();
        return;
      }
      this.reportsService.updatePriority(reportId, raw.priority).subscribe({
        next: () => {
          this.notifications.success('Réponse et priorité enregistrées');
          this.saving.set(false);
          this.replied.emit();
          this.close();
        },
        error: () => this.saving.set(false),
      });
    };

    this.reportsService.createReply(reportId, payload).subscribe({
      next: () => afterReply(),
      error: () => this.saving.set(false),
    });
  }

  private loadDetail(reportId: number): void {
    this.loadingReport.set(true);
    this.reportsService.getReportById(reportId).subscribe({
      next: (r) => {
        this.detail.set(r);
        const email = r.passenger?.email?.trim() ?? '';
        const hasEmail = this.isValidEmail(email);
        this.form.reset({
          message: '',
          statusId: r.status?.statusId ?? '',
          priority: (r.priority as Priority) || '',
          sendEmail: hasEmail,
          publicResponse: true,
          publish: false,
        });
        this.loadingReport.set(false);
      },
      error: () => {
        // Fallback sur le report de la liste
        const fallback = this.report;
        this.detail.set(fallback);
        const email = fallback?.passenger?.email?.trim() ?? '';
        this.form.patchValue({
          statusId: fallback?.status?.statusId ?? '',
          priority: (fallback?.priority as Priority) || '',
          sendEmail: this.isValidEmail(email),
          publicResponse: true,
          publish: false,
        });
        this.loadingReport.set(false);
      },
    });
  }

  private loadStatuses(): void {
    this.reportsService.getStatuses().subscribe({
      next: (statuses) => this.statuses.set(statuses),
      error: () => {},
    });
  }

  private isValidEmail(value: string): boolean {
    if (!value) {
      return false;
    }
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
}
