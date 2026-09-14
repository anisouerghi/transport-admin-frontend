import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  BadgeComponent,
  ButtonCloseDirective,
  ButtonDirective,
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
import { HasPermissionDirective } from '../../../core/directives/has-permission.directive';
import { NotificationService } from '../../../core/services/notification.service';
import { ReportsService } from '../services/reports.service';
import {
  PRIORITY_OPTIONS,
  Priority,
  Report,
  ReportAttachment,
  ReportReply,
} from '../models/report.model';

@Component({
  selector: 'app-report-detail-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ModalComponent,
    ModalHeaderComponent,
    ModalTitleDirective,
    ModalBodyComponent,
    ModalFooterComponent,
    ButtonCloseDirective,
    ButtonDirective,
    SpinnerComponent,
    BadgeComponent,
    FormLabelDirective,
    FormSelectDirective,
    HasPermissionDirective,
  ],
  templateUrl: './report-detail-modal.component.html',
})
export class ReportDetailModalComponent implements OnChanges, OnDestroy {
  private readonly reportsService = inject(ReportsService);
  private readonly notifications = inject(NotificationService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  @Input() visible = false;
  @Input() reportId: number | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() updated = new EventEmitter<void>();

  readonly loading = signal(false);
  readonly savingPriority = signal(false);
  readonly report = signal<Report | null>(null);
  readonly replies = signal<ReportReply[]>([]);
  readonly attachments = signal<ReportAttachment[]>([]);
  readonly previewUrls = signal<Record<number, string>>({});
  readonly audioUrls = signal<Record<number, string>>({});
  readonly downloadingId = signal<number | null>(null);
  readonly priorities = PRIORITY_OPTIONS;
  readonly canUpdatePriority = () => this.auth.hasPermission('REPORT_UPDATE_PRIORITY');

  readonly priorityForm = this.fb.nonNullable.group({
    priority: '' as Priority | '',
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && !this.visible) {
      this.resetState();
    }
    if (this.visible && this.reportId != null) {
      this.load(this.reportId);
      this.loadReplies(this.reportId);
      this.loadAttachments(this.reportId);
    }
  }

  ngOnDestroy(): void {
    this.clearPreviews();
  }

  close(): void {
    this.visibleChange.emit(false);
  }

  savePriority(): void {
    const report = this.report();
    const priority = this.priorityForm.getRawValue().priority;
    if (!report || !priority || !this.canUpdatePriority()) {
      return;
    }
    if (priority === report.priority) {
      return;
    }
    this.savingPriority.set(true);
    this.reportsService.updatePriority(report.reportId, priority).subscribe({
      next: (updated) => {
        this.report.set(updated);
        this.priorityForm.patchValue({ priority: updated.priority ?? '' });
        this.notifications.success('Priorité mise à jour');
        this.savingPriority.set(false);
        this.updated.emit();
      },
      error: () => this.savingPriority.set(false),
    });
  }

  priorityLabel(code?: string | null): string {
    return this.priorities.find((p) => p.value === code)?.label ?? code ?? '—';
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

  download(att: ReportAttachment): void {
    this.downloadingId.set(att.attachmentId);
    this.reportsService.downloadAttachmentBlob(att.attachmentId).subscribe({
      next: (blob) => {
        this.triggerBrowserDownload(blob, att.fileName || `attachment-${att.attachmentId}`);
        this.downloadingId.set(null);
      },
      error: () => this.downloadingId.set(null),
    });
  }

  openView(att: ReportAttachment): void {
    this.reportsService.viewAttachmentBlob(att.attachmentId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank', 'noopener');
        // Libération différée : le nouvel onglet a le temps de charger
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      },
    });
  }

  private load(id: number): void {
    this.loading.set(true);
    this.reportsService.getReportById(id).subscribe({
      next: (r) => {
        this.report.set(r);
        this.priorityForm.patchValue({ priority: (r.priority as Priority) || '' });
        if (r.attachments?.length) {
          this.attachments.set(r.attachments);
          this.loadImagePreviews(r.attachments);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private loadReplies(id: number): void {
    this.reportsService.getReplies(id).subscribe({
      next: (items) => this.replies.set(items),
      error: () => this.replies.set([]),
    });
  }

  private loadAttachments(id: number): void {
    this.reportsService.getAttachments(id).subscribe({
      next: (items) => {
        this.attachments.set(items);
        this.loadImagePreviews(items);
      },
      error: () => this.attachments.set([]),
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

  private triggerBrowserDownload(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
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

  private resetState(): void {
    this.report.set(null);
    this.replies.set([]);
    this.attachments.set([]);
    this.clearPreviews();
    this.priorityForm.reset({ priority: '' });
  }
}
