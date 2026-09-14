import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
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
import { PRIORITY_OPTIONS, Priority, ReportReplyRequest, Report, ReportAttachment, Status } from '../models/report.model';
import { ReportsService } from '../services/reports.service';

@Component({
  selector: 'app-report-reply-modal',
  standalone: true,
  imports: [
    DatePipe,
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
  readonly attachments = signal<ReportAttachment[]>([]);
  readonly previewUrls = signal<Record<number, string>>({});
  readonly audioUrls = signal<Record<number, string>>({});
  readonly downloadingId = signal<number | null>(null);
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
      this.clearPreviews();
      this.attachments.set([]);
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

  onPublicResponseChange(): void {
    if (!this.form.controls.publicResponse.value) {
      this.form.patchValue({ sendEmail: false });
    } else if (this.hasPassengerEmail()) {
      this.form.patchValue({ sendEmail: true });
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
      sendEmail: canEmail && raw.publicResponse ? raw.sendEmail : false,
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

    this.reportsService.createReply(reportId, payload).subscribe({
      next: (res) => {
        const finish = (baseMsg: string) => {
          if (res.success) {
            this.notifications.success(res.message || baseMsg);
          } else {
            this.notifications.error(
              res.message || "La réponse a été enregistrée, mais l'e-mail n'a pas pu être envoyé."
            );
          }
          this.saving.set(false);
          this.replied.emit();
          this.close();
        };

        if (!priorityChanged) {
          finish('Réponse enregistrée');
          return;
        }
        this.reportsService.updatePriority(reportId, raw.priority).subscribe({
          next: () => finish(res.message || 'Réponse et priorité enregistrées'),
          error: () => {
            if (res.success) {
              this.notifications.success(res.message || 'Réponse enregistrée');
            } else {
              this.notifications.error(res.message || "Échec d'envoi de l'e-mail");
            }
            this.notifications.error("La priorité n'a pas pu être mise à jour.");
            this.saving.set(false);
            this.replied.emit();
            this.close();
          },
        });
      },
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
        this.loadExistingRepliesAndAttachments(reportId);
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
        if (fallback) {
          this.loadExistingRepliesAndAttachments(fallback.reportId);
        } else {
          this.loadingReport.set(false);
        }
      },
    });
  }

  private loadExistingRepliesAndAttachments(reportId: number): void {
    this.reportsService.getReplies(reportId).subscribe({
      next: (replies) => {
        if (replies && replies.length > 0) {
          const lastReply = replies[replies.length - 1];
          this.form.patchValue({
            message: lastReply.message || '',
            publicResponse: lastReply.publicResponse ?? true,
            publish: lastReply.publish ?? false,
          });
        }
      },
      error: () => {},
    });

    this.reportsService.getAttachments(reportId).subscribe({
      next: (atts) => {
        this.attachments.set(atts);
        this.loadImagePreviews(atts);
        this.loadingReport.set(false);
      },
      error: () => {
        this.attachments.set([]);
        this.loadingReport.set(false);
      },
    });
  }

  private loadImagePreviews(items: ReportAttachment[]): void {
    this.clearPreviews();
    for (const att of items) {
      if (att.image) {
        this.reportsService.viewAttachmentBlob(att.attachmentId).subscribe({
          next: (blob) => {
            const url = URL.createObjectURL(blob);
            this.previewUrls.update((map) => ({ ...map, [att.attachmentId]: url }));
          },
        });
      } else if (this.isAudio(att)) {
        this.reportsService.viewAttachmentBlob(att.attachmentId).subscribe({
          next: (blob) => {
            const url = URL.createObjectURL(blob);
            this.audioUrls.update((map) => ({ ...map, [att.attachmentId]: url }));
          },
        });
      }
    }
  }

  private clearPreviews(): void {
    const urls = Object.values(this.previewUrls());
    for (const url of urls) {
      URL.revokeObjectURL(url);
    }
    this.previewUrls.set({});
    const audio = Object.values(this.audioUrls());
    for (const url of audio) {
      URL.revokeObjectURL(url);
    }
    this.audioUrls.set({});
  }

  isPdf(att: ReportAttachment): boolean {
    return (att.fileType ?? '').toLowerCase().includes('pdf')
      || (att.fileName ?? '').toLowerCase().endsWith('.pdf');
  }

  isAudio(att: ReportAttachment): boolean {
    if (att.audio) {
      return true;
    }
    const type = (att.fileType ?? '').toLowerCase();
    if (type.startsWith('audio/')) {
      return true;
    }
    const name = (att.fileName ?? '').toLowerCase();
    return ['.webm', '.m4a', '.mp3', '.ogg', '.mp4'].some((ext) => name.endsWith(ext));
  }

  formatSize(bytes?: number | null): string {
    if (bytes == null || bytes < 0) {
      return '—';
    }
    if (bytes < 1024) {
      return `${bytes} o`;
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} Ko`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  }

  downloadAttachment(att: ReportAttachment): void {
    this.downloadingId.set(att.attachmentId);
    this.reportsService.downloadAttachmentBlob(att.attachmentId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = att.fileName || `attachment-${att.attachmentId}`;
        a.click();
        URL.revokeObjectURL(url);
        this.downloadingId.set(null);
      },
      error: () => this.downloadingId.set(null),
    });
  }

  viewAttachment(att: ReportAttachment): void {
    this.reportsService.viewAttachmentBlob(att.attachmentId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank', 'noopener');
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
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
