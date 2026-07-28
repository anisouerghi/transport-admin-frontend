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
import { IconDirective } from '@coreui/icons-angular';
import { NotificationService } from '../../../core/services/notification.service';
import { ReportDetailModalComponent } from '../components/report-detail-modal.component';
import { Report, ReportFilter } from '../models/report.model';
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
    IconDirective,
    BadgeComponent,
    ReportDetailModalComponent,
  ],
  templateUrl: './report-list.page.html',
})
export class ReportListPage implements OnInit {
  private readonly reportsService = inject(ReportsService);
  private readonly notifications = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly reports = signal<Report[]>([]);
  readonly totalElements = signal(0);
  readonly totalPages = signal(1);
  readonly page = signal(0);
  readonly size = 10;

  readonly detailVisible = signal(false);
  readonly currentReportId = signal<number | null>(null);

  readonly filterForm = this.fb.nonNullable.group({
    reference: '',
    reportType: '',
    priority: '',
    status: '',
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const raw = this.filterForm.getRawValue();
    const filter: ReportFilter = {
      reference: raw.reference,
      reportType: raw.reportType,
      priority: raw.priority,
      status: raw.status,
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
    this.filterForm.reset({ reference: '', reportType: '', priority: '', status: '' });
    this.page.set(0);
    this.load();
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
    this.notifications.info(`Reply to report ${report.reference}`);
  }

  share(report: Report): void {
    this.notifications.info(`Share report ${report.reference}`);
  }

  pages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i);
  }
}
