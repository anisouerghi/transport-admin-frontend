import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  BadgeComponent,
  ButtonCloseDirective,
  ButtonDirective,
  FormControlDirective,
  FormDirective,
  FormLabelDirective,
  FormSelectDirective,
  ModalBodyComponent,
  ModalComponent,
  ModalFooterComponent,
  ModalHeaderComponent,
  ModalTitleDirective,
  SpinnerComponent,
} from '@coreui/angular';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ReportType } from '../../report-types/models/report-type.model';
import { ReportTypesService } from '../../report-types/services/report-types.service';
import { AGENT_REPLY_TYPE, AGENT_REPLY_TYPE_OPTIONS, AgentReplyType, replyAuthorLabel, replyTypeLabel } from '../models/reply-kinds';
import { PRIORITY_OPTIONS, Priority, ReportReply, ReportReplyRequest, Report, ReportAttachment, Status } from '../models/report.model';
import { ReportsService } from '../services/reports.service';

/** Ordre fixe des natures voyageur (ReportType). */
const NATURE_ORDER = [
  'COMPLAINT',
  'ASSAULT',
  'INCIDENT',
  'SUGGESTION',
  'THANKS',
  'OTHER',
] as const;

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
    BadgeComponent,
    SpinnerComponent,
  ],
  templateUrl: './report-reply-modal.component.html',
  styles: `
    .treat-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 0.75rem;
      padding-bottom: 0.85rem;
      margin-bottom: 1rem;
      border-bottom: 1px solid var(--cui-border-color, #d8dbe0);
    }
    .treat-kicker {
      margin: 0;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--cui-secondary-color, #6c757d);
    }
    .treat-ref {
      margin: 0.1rem 0 0;
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--cui-primary, #007a4d);
      word-break: break-word;
    }
    .treat-meta {
      margin: 0.35rem 0 0;
      color: var(--cui-secondary-color, #6c757d);
      font-size: 0.82rem;
    }
    .treat-grid {
      display: grid;
      gap: 1rem;
    }
    .treat-card {
      border: 1px solid var(--cui-border-color, #d8dbe0);
      border-radius: 0.6rem;
      padding: 0.85rem 1rem;
      background: #fff;
    }
    .treat-card + .treat-card {
      margin-top: 0.75rem;
    }
    .treat-card h6,
    .treat-form h6 {
      margin: 0 0 0.7rem;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--cui-secondary-color, #6c757d);
    }
    .treat-desc {
      margin: 0;
      white-space: pre-wrap;
      word-break: break-word;
      line-height: 1.45;
    }
    .treat-form {
      border: 1px solid var(--cui-border-color, #d8dbe0);
      border-radius: 0.7rem;
      background: #f7faf8;
      padding: 0.95rem;
    }
    .treat-hint {
      margin: 0.45rem 0 0;
      font-size: 0.8rem;
      color: var(--cui-secondary-color, #6c757d);
    }
    .treat-count {
      margin-top: 0.3rem;
      text-align: end;
      font-size: 0.75rem;
      color: var(--cui-secondary-color, #6c757d);
    }
    .treat-thread {
      background: #f6f8f7;
    }
    .thread {
      position: relative;
      list-style: none;
      margin: 0;
      padding: 0.15rem 0.15rem 0 0;
      max-height: 22rem;
      overflow: auto;
    }
    .thread::before {
      content: '';
      position: absolute;
      inset-inline-start: 0.95rem;
      top: 0.5rem;
      bottom: 0.6rem;
      width: 2px;
      background: #d5ddd8;
    }
    .thread__day {
      position: relative;
      z-index: 1;
      width: fit-content;
      margin: 0.15rem auto 0.65rem;
      padding: 0.12rem 0.65rem;
      border-radius: 999px;
      background: #fff;
      border: 1px solid var(--cui-border-color, #d8dbe0);
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--cui-secondary-color, #6c757d);
    }
    .thread__event {
      position: relative;
      display: grid;
      grid-template-columns: 2rem minmax(0, 1fr);
      gap: 0.65rem;
      margin: 0 0 0.75rem;
    }
    .thread__mark {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      border: 2px solid var(--cui-primary, #007a4d);
      background: #fff;
      color: var(--cui-primary, #007a4d);
      display: grid;
      place-items: center;
      z-index: 1;
    }
    .thread__mark .material-symbols-outlined {
      font-size: 1rem;
    }
    .thread__event--passenger .thread__mark {
      border-color: #1f6feb;
      color: #1f6feb;
    }
    .thread__event--ask .thread__mark {
      border-color: #b8860b;
      color: #b8860b;
    }
    .thread__event--note .thread__mark {
      border-color: #8a6d3b;
      background: #f7f1e8;
      color: #8a6d3b;
    }
    .thread__card {
      border: 1px solid #e3ebe6;
      border-inline-start: 3px solid var(--cui-primary, #007a4d);
      border-radius: 0.7rem;
      background: #fff;
      padding: 0.6rem 0.75rem;
      min-width: 0;
    }
    .thread__event--passenger .thread__card {
      background: #f4f8ff;
      border-inline-start-color: #1f6feb;
    }
    .thread__event--ask .thread__card {
      background: #fffdf6;
      border-color: #f0d48a;
      border-inline-start-color: #d4a017;
    }
    .thread__event--note .thread__card {
      background: #fbf6ee;
      border-color: #ead9b0;
      border-inline-start-color: #b8860b;
    }
    .thread__head {
      display: flex;
      justify-content: space-between;
      gap: 0.5rem;
      align-items: baseline;
    }
    .thread__head strong {
      font-size: 0.86rem;
      color: var(--cui-primary, #007a4d);
    }
    .thread__event--passenger .thread__head strong {
      color: #1a4f9c;
    }
    .thread__head time {
      font-size: 0.75rem;
      color: var(--cui-secondary-color, #6c757d);
      white-space: nowrap;
    }
    .thread__kind {
      margin: 0.1rem 0 0.35rem;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      color: var(--cui-secondary-color, #6c757d);
    }
    .thread__note {
      margin: 0 0 0.35rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: #8a6d3b;
    }
    .thread__text {
      margin: 0;
      line-height: 1.45;
      white-space: pre-wrap;
      word-break: break-word;
      font-size: 0.9rem;
    }
    @media (min-width: 992px) {
      .treat-grid {
        grid-template-columns: minmax(0, 1.05fr) minmax(18rem, 0.95fr);
        align-items: start;
      }
      .treat-form {
        position: sticky;
        top: 0;
      }
    }
  `,
})
export class ReportReplyModalComponent implements OnChanges {
  private readonly reportsService = inject(ReportsService);
  private readonly reportTypesService = inject(ReportTypesService);
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
  readonly reportTypes = signal<ReportType[]>([]);
  /** Signalement enrichi (détail API) pour infos voyageur complètes. */
  readonly detail = signal<Report | null>(null);
  readonly attachments = signal<ReportAttachment[]>([]);
  readonly previewUrls = signal<Record<number, string>>({});
  readonly audioUrls = signal<Record<number, string>>({});
  readonly downloadingId = signal<number | null>(null);
  readonly priorities = PRIORITY_OPTIONS;
  readonly replyTypeOptions = AGENT_REPLY_TYPE_OPTIONS;
  readonly replyTypeLabel = replyTypeLabel;
  readonly replyAuthorLabel = replyAuthorLabel;
  readonly existingReplies = signal<ReportReply[]>([]);
  readonly internalNote = AGENT_REPLY_TYPE.internalNote;
  readonly complementRequest = AGENT_REPLY_TYPE.complementRequest;
  readonly canUpdatePriority = () => this.auth.hasPermission('REPORT_UPDATE_PRIORITY');

  readonly form = this.fb.nonNullable.group({
    reportTypeId: '' as string | number,
    message: ['', [Validators.required, Validators.maxLength(2000)]],
    statusId: '' as string | number,
    priority: '' as Priority | '',
    sendEmail: true,
    publicResponse: true,
    publish: false,
    replyType: AGENT_REPLY_TYPE.response as AgentReplyType,
  });

  ngOnChanges(changes: SimpleChanges): void {
    this.submitted.set(false);
    if (!this.visible) {
      this.detail.set(null);
      this.clearPreviews();
      this.attachments.set([]);
      this.existingReplies.set([]);
      this.form.reset({
        reportTypeId: '',
        message: '',
        statusId: '',
        priority: '',
        sendEmail: true,
        publicResponse: true,
        publish: false,
        replyType: AGENT_REPLY_TYPE.response,
      });
      this.enableMessageOptions();
      return;
    }
    if (this.statuses().length === 0) {
      this.loadStatuses();
    }
    if (this.reportTypes().length === 0) {
      this.loadReportTypes();
    }
    const reportId = this.report?.reportId;
    if (reportId != null && (changes['visible'] || changes['report'])) {
      this.loadDetail(reportId);
    }
  }

  private alignReplyType(): void {
    const allowed = this.availableReplyTypes().some(
      (option) => option.value === this.form.controls.replyType.value,
    );
    if (!allowed) {
      this.form.patchValue({ replyType: AGENT_REPLY_TYPE.response });
      this.onReplyTypeChange();
    }
  }

  private enableMessageOptions(): void {
    this.form.controls.sendEmail.enable();
    this.form.controls.publish.enable();
    this.form.controls.statusId.enable();
  }

  onReplyTypeChange(): void {
    const type = this.form.controls.replyType.value;
    if (type === AGENT_REPLY_TYPE.internalNote) {
      this.form.patchValue({ publicResponse: false, sendEmail: false, publish: false });
      this.form.controls.sendEmail.disable();
      this.form.controls.publish.disable();
      this.form.controls.statusId.disable();
      return;
    }
    if (type === AGENT_REPLY_TYPE.complementRequest) {
      this.form.controls.statusId.disable();
    } else {
      this.form.controls.statusId.enable();
    }
    this.form.controls.sendEmail.enable();
    this.form.controls.publish.enable();
    this.form.patchValue({
      publicResponse: true,
      sendEmail: type === AGENT_REPLY_TYPE.response || type === AGENT_REPLY_TYPE.complementRequest
        ? this.hasPassengerEmail()
        : this.form.controls.sendEmail.value,
    });
  }

  onPublicResponseChange(): void {
    if (!this.form.controls.publicResponse.value) {
      this.form.patchValue({ sendEmail: false });
    } else if (this.hasPassengerEmail()) {
      this.form.patchValue({ sendEmail: true });
    }
  }

  exchangeGroups(): { label: string; replies: ReportReply[] }[] {
    const groups: { label: string; replies: ReportReply[] }[] = [];
    for (const reply of this.existingReplies()) {
      const label = this.exchangeDayLabel(reply.replyDate);
      const current = groups[groups.length - 1];
      if (!current || current.label !== label) {
        groups.push({ label, replies: [reply] });
      } else {
        current.replies.push(reply);
      }
    }
    return groups;
  }

  exchangeIcon(reply: ReportReply): string {
    switch ((reply.replyType ?? '').toUpperCase()) {
      case AGENT_REPLY_TYPE.complementRequest:
        return 'help';
      case 'COMPLEMENT_RESPONSE':
        return 'reply';
      case AGENT_REPLY_TYPE.internalNote:
        return 'lock';
      default:
        return reply.authorType === 'PASSENGER' ? 'person' : 'support_agent';
    }
  }

  private exchangeDayLabel(value?: string): string {
    if (!value) {
      return '';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    const today = new Date();
    const sameDay =
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();
    if (sameDay) {
      return "Aujourd'hui";
    }
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  /** Anonyme, contact sans compte, ou voyageur avec suivi. */
  passengerMode(): 'anonymous' | 'contact' | 'tracked' {
    if (this.isAnonymous()) {
      return 'anonymous';
    }
    const passenger = this.detail()?.passenger ?? this.report?.passenger;
    return passenger?.tracked ? 'tracked' : 'contact';
  }

  /** Demande de complément uniquement si le voyageur a un compte de suivi. */
  availableReplyTypes() {
    const passenger = this.detail()?.passenger ?? this.report?.passenger;
    if (passenger?.tracked) {
      return this.replyTypeOptions;
    }
    return this.replyTypeOptions.filter((option) => option.value !== AGENT_REPLY_TYPE.complementRequest);
  }

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
    const replyType = raw.replyType || AGENT_REPLY_TYPE.response;
    const internal = replyType === AGENT_REPLY_TYPE.internalNote;
    const canEmail = this.hasPassengerEmail() && !internal;
    const payload: ReportReplyRequest = {
      message: raw.message,
      replyType,
      sendEmail: canEmail && raw.publicResponse ? raw.sendEmail : false,
      publicResponse: internal ? false : raw.publicResponse,
      publish: internal ? false : raw.publish,
    };
    if (replyType === AGENT_REPLY_TYPE.response) {
      const statusId = Number(raw.statusId);
      if (!Number.isNaN(statusId) && statusId > 0) {
        payload.statusId = statusId;
      }
    }

    this.saving.set(true);
    const reportId = current.reportId;
    const priorityChanged =
      this.canUpdatePriority() &&
      !!raw.priority &&
      raw.priority !== current.priority;

    const selectedTypeRaw = raw.reportTypeId === '' || raw.reportTypeId == null
      ? null
      : Number(raw.reportTypeId);
    const selectedTypeId =
      selectedTypeRaw != null && !Number.isNaN(selectedTypeRaw) && selectedTypeRaw > 0
        ? selectedTypeRaw
        : null;
    const previousTypeId = current.reportTypeId ?? null;
    const typeChanged = selectedTypeId !== previousTypeId;

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

        const afterType = () => {
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
        };

        if (!typeChanged) {
          afterType();
          return;
        }
        this.reportsService.updateReportType(reportId, selectedTypeId).subscribe({
          next: () => afterType(),
          error: () => {
            if (res.success) {
              this.notifications.success(res.message || 'Réponse enregistrée');
            } else {
              this.notifications.error(res.message || "Échec d'envoi de l'e-mail");
            }
            this.notifications.error("La nature du signalement n'a pas pu être mise à jour.");
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
          reportTypeId: r.reportTypeId ?? '',
          message: '',
          statusId: r.status?.statusId ?? '',
          priority: (r.priority as Priority) || '',
          sendEmail: hasEmail,
          publicResponse: true,
          publish: false,
          replyType: AGENT_REPLY_TYPE.response,
        });
        this.enableMessageOptions();
        this.alignReplyType();
        this.loadExistingRepliesAndAttachments(reportId);
      },
      error: () => {
        // Fallback sur le report de la liste
        const fallback = this.report;
        this.detail.set(fallback);
        const email = fallback?.passenger?.email?.trim() ?? '';
        this.form.patchValue({
          reportTypeId: fallback?.reportTypeId ?? '',
          statusId: fallback?.status?.statusId ?? '',
          priority: (fallback?.priority as Priority) || '',
          sendEmail: this.isValidEmail(email),
          publicResponse: true,
          publish: false,
          replyType: AGENT_REPLY_TYPE.response,
        });
        this.enableMessageOptions();
        this.alignReplyType();
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
        this.existingReplies.set(replies ?? []);
      },
      error: () => this.existingReplies.set([]),
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

  private loadReportTypes(): void {
    this.reportTypesService.getActive().subscribe({
      next: (types) => this.reportTypes.set(this.orderNatures(types)),
      error: () => {},
    });
  }

  private orderNatures(types: ReportType[]): ReportType[] {
    const byCode = new Map(types.map((t) => [t.code?.toUpperCase(), t]));
    const ordered: ReportType[] = [];
    for (const code of NATURE_ORDER) {
      const hit = byCode.get(code);
      if (hit) {
        ordered.push(hit);
      }
    }
    return ordered;
  }

  private isValidEmail(value: string): boolean {
    if (!value) {
      return false;
    }
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
}
