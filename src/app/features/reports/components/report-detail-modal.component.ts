import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
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
import { PRIORITY_OPTIONS, Priority, Report, ReportReply } from '../models/report.model';

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
export class ReportDetailModalComponent implements OnChanges {
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
  readonly priorities = PRIORITY_OPTIONS;
  readonly canUpdatePriority = () => this.auth.hasPermission('REPORT_UPDATE_PRIORITY');

  readonly priorityForm = this.fb.nonNullable.group({
    priority: '' as Priority | '',
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && !this.visible) {
      this.report.set(null);
      this.replies.set([]);
      this.priorityForm.reset({ priority: '' });
    }
    if (this.visible && this.reportId != null) {
      this.load(this.reportId);
      this.loadReplies(this.reportId);
    }
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

  private load(id: number): void {
    this.loading.set(true);
    this.reportsService.getReportById(id).subscribe({
      next: (r) => {
        this.report.set(r);
        this.priorityForm.patchValue({ priority: (r.priority as Priority) || '' });
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
}
