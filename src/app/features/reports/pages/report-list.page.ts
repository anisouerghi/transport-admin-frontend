import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  BadgeComponent,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  FormControlDirective,
  FormDirective,
  FormLabelDirective,
  FormSelectDirective,
  PageItemDirective,
  PageLinkDirective,
  PaginationComponent,
  RowComponent,
  SpinnerComponent,
  TableDirective,
} from '@coreui/angular';
import { NotificationService } from '../../../core/services/notification.service';
import { HasPermissionDirective } from '../../../core/directives/has-permission.directive';
import { ReportDetailModalComponent } from '../components/report-detail-modal.component';
import { ReportReplyModalComponent } from '../components/report-reply-modal.component';
import { Report, ReportFilter, Status } from '../models/report.model';
import { ReportsService } from '../services/reports.service';

@Component({
  selector: 'app-report-list-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    RowComponent,
    ColComponent,
    FormDirective,
    FormLabelDirective,
    FormControlDirective,
    FormSelectDirective,
    ButtonDirective,
    TableDirective,
    PaginationComponent,
    PageItemDirective,
    PageLinkDirective,
    SpinnerComponent,
    BadgeComponent,
    HasPermissionDirective,
    ReportDetailModalComponent,
    ReportReplyModalComponent,
  ],
  templateUrl: './report-list.page.html',
})
export class ReportListPage implements OnInit {
  private readonly reportsService = inject(ReportsService);
  private readonly notifications = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly reports = signal<Report[]>([]);
  readonly statuses = signal<Status[]>([]);
  readonly totalElements = signal(0);
  readonly totalPages = signal(1);
  readonly page = signal(0);
  readonly size = 10;

  readonly detailVisible = signal(false);
  readonly replyVisible = signal(false);
  readonly currentReportId = signal<number | null>(null);
  readonly currentReport = signal<Report | null>(null);

  readonly filterForm = this.fb.nonNullable.group({
    reference: '',
    reportTypeId: '' as string | number,
    priority: '',
    statusId: '' as string | number,
  });

  ngOnInit(): void {
    this.loadStatuses();
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const raw = this.filterForm.getRawValue();
    const reportTypeId = raw.reportTypeId === '' ? undefined : Number(raw.reportTypeId);
    const statusId = raw.statusId === '' ? undefined : Number(raw.statusId);
    const filter: ReportFilter = {
      reference: raw.reference,
      priority: raw.priority,
      reportTypeId: reportTypeId && reportTypeId > 0 ? reportTypeId : undefined,
      statusId: statusId && statusId > 0 ? statusId : undefined,
    };
    this.reportsService.getReports(this.page(), this.size, filter).subscribe({
      next: (res) => {
        this.reports.set(res.content);
        this.totalElements.set(res.totalElements);
        this.totalPages.set(res.totalPages);
        this.page.set(res.page);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  search(): void {
    this.page.set(0);
    this.load();
  }

  resetFilters(): void {
    this.filterForm.reset({ reference: '', reportTypeId: '', priority: '', statusId: '' });
    this.page.set(0);
    this.load();
  }

  private loadStatuses(): void {
    this.reportsService.getStatuses().subscribe({
      next: (statuses) => this.statuses.set(statuses),
      error: () => {},
    });
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages()) {
      return;
    }
    this.page.set(page);
    this.load();
  }

  openView(reportId: number): void {
    this.currentReportId.set(reportId);
    this.detailVisible.set(true);
  }

  reply(report: Report): void {
    this.currentReport.set(report);
    this.currentReportId.set(report.reportId);
    this.replyVisible.set(true);
  }

  pages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i);
  }
}
