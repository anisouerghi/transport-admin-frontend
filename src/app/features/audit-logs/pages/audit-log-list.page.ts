import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
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
import { AuditLogDetailModalComponent } from '../components/audit-log-detail-modal.component';
import {
  AUDIT_ACTIONS,
  AUDIT_MODULES,
  AuditLog,
  AuditLogFilter,
} from '../models/audit-log.model';
import { AuditLogsService } from '../services/audit-logs.service';

/**
 * Page liste Journal d'audit.
 * Filtres multicritères + pagination serveur + tri + détail modal.
 */
@Component({
  selector: 'app-audit-log-list-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePipe,
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
    IconDirective,
    AuditLogDetailModalComponent,
  ],
  templateUrl: './audit-log-list.page.html',
})
export class AuditLogListPage implements OnInit {
  private readonly service = inject(AuditLogsService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly items = signal<AuditLog[]>([]);
  readonly totalElements = signal(0);
  readonly totalPages = signal(1);
  readonly page = signal(0);
  readonly pageSize = 10;
  readonly sortBy = signal('actionDate');
  readonly sortDirection = signal<'ASC' | 'DESC'>('DESC');

  readonly detailVisible = signal(false);
  readonly selectedId = signal<number | null>(null);

  readonly actions = AUDIT_ACTIONS;
  readonly modules = AUDIT_MODULES;

  readonly filterForm = this.fb.nonNullable.group({
    user: '',
    module: '',
    actionType: '',
    actionDateFrom: '',
    actionDateTo: '',
    result: '',
    ipAddress: '',
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.service
      .search(this.page(), this.pageSize, this.buildFilter(), this.sortBy(), this.sortDirection())
      .subscribe({
        next: (result) => {
          this.items.set(result.content);
          this.totalElements.set(result.totalElements);
          this.totalPages.set(result.totalPages);
          this.page.set(result.page);
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
    this.filterForm.reset({
      user: '',
      module: '',
      actionType: '',
      actionDateFrom: '',
      actionDateTo: '',
      result: '',
      ipAddress: '',
    });
    this.page.set(0);
    this.load();
  }

  refresh(): void {
    this.load();
  }

  toggleSort(field: string): void {
    if (this.sortBy() === field) {
      this.sortDirection.set(this.sortDirection() === 'ASC' ? 'DESC' : 'ASC');
    } else {
      this.sortBy.set(field);
      this.sortDirection.set(field === 'actionDate' ? 'DESC' : 'ASC');
    }
    this.load();
  }

  goToPage(p: number): void {
    if (p < 0 || p >= this.totalPages()) return;
    this.page.set(p);
    this.load();
  }

  openDetail(item: AuditLog): void {
    this.selectedId.set(item.auditLogId);
    this.detailVisible.set(true);
  }

  pages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i);
  }

  private buildFilter(): AuditLogFilter {
    const raw = this.filterForm.getRawValue();
    const filter: AuditLogFilter = {};
    if (raw.user.trim()) filter.user = raw.user.trim();
    if (raw.module) filter.module = raw.module as AuditLogFilter['module'];
    if (raw.actionType) filter.actionType = raw.actionType as AuditLogFilter['actionType'];
    if (raw.result) filter.result = raw.result as AuditLogFilter['result'];
    if (raw.ipAddress.trim()) filter.ipAddress = raw.ipAddress.trim();
    if (raw.actionDateFrom) {
      filter.actionDateFrom = new Date(raw.actionDateFrom + 'T00:00:00').toISOString();
    }
    if (raw.actionDateTo) {
      filter.actionDateTo = new Date(raw.actionDateTo + 'T23:59:59').toISOString();
    }
    return filter;
  }
}
