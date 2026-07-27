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
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal.component';
import { SupportTypesService } from '../../support-types/services/support-types.service';
import { SupportType } from '../../support-types/models/support-type.model';
import { TransportSupportDetailModalComponent } from '../components/transport-support-detail-modal.component';
import { TransportSupportFormModalComponent } from '../components/transport-support-form-modal.component';
import { QR_STATUSES, SUPPORT_STATUSES, TransportSupport, TransportSupportFilter } from '../models/transport-support.model';
import { TransportSupportsService } from '../services/transport-supports.service';

/**
 * Page liste Transport Supports.
 * - Recherche serveur multicritere (reference, label, uuid, status, type)
 * - Modals : create/edit, detail (avec image QR), confirmation delete
 * - Action "QR" pour regenerer le code
 */
@Component({
  selector: 'app-transport-support-list-page',
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
    TransportSupportFormModalComponent,
    TransportSupportDetailModalComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './transport-support-list.page.html',
})
export class TransportSupportListPage implements OnInit {
  private readonly service = inject(TransportSupportsService);
  private readonly supportTypesService = inject(SupportTypesService);
  private readonly notifications = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly actionBusy = signal(false);
  readonly items = signal<TransportSupport[]>([]);
  readonly supportTypes = signal<SupportType[]>([]);
  readonly totalElements = signal(0);
  readonly totalPages = signal(1);
  readonly page = signal(0);
  readonly pageSize = 10;
  readonly sortBy = signal('reference');
  readonly sortDirection = signal<'ASC' | 'DESC'>('ASC');

  readonly formModalVisible = signal(false);
  readonly detailModalVisible = signal(false);
  readonly editingItem = signal<TransportSupport | null>(null);
  readonly detailItem = signal<TransportSupport | null>(null);
  readonly confirmVisible = signal(false);
  readonly confirmItem = signal<TransportSupport | null>(null);

  readonly supportStatuses = SUPPORT_STATUSES;
  readonly qrStatuses = QR_STATUSES;

  readonly filterForm = this.fb.nonNullable.group({
    reference: '',
    label: '',
    uuid: '',
    supportStatus: '',
    qrStatus: '',
    supportTypeId: '' as '' | string,
  });

  ngOnInit(): void {
    this.supportTypesService.getAll().subscribe((t) => this.supportTypes.set(t));
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const raw = this.filterForm.getRawValue();
    const filter: TransportSupportFilter = {
      reference: raw.reference,
      label: raw.label,
      uuid: raw.uuid,
      supportStatus: raw.supportStatus || undefined,
      qrStatus: raw.qrStatus || undefined,
      supportTypeId: raw.supportTypeId ? Number(raw.supportTypeId) : null,
    };
    this.service.search(this.page(), this.pageSize, filter, this.sortBy(), this.sortDirection()).subscribe({
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
    this.filterForm.reset({ reference: '', label: '', uuid: '', supportStatus: '', qrStatus: '', supportTypeId: '' });
    this.page.set(0);
    this.load();
  }

  toggleSort(field: string): void {
    if (this.sortBy() === field) {
      this.sortDirection.set(this.sortDirection() === 'ASC' ? 'DESC' : 'ASC');
    } else {
      this.sortBy.set(field);
      this.sortDirection.set('ASC');
    }
    this.load();
  }

  goToPage(p: number): void {
    if (p < 0 || p >= this.totalPages()) return;
    this.page.set(p);
    this.load();
  }

  openCreate(): void {
    this.editingItem.set(null);
    this.formModalVisible.set(true);
  }

  openEdit(item: TransportSupport): void {
    this.editingItem.set(item);
    this.formModalVisible.set(true);
  }

  openDetail(item: TransportSupport): void {
    this.detailItem.set(item);
    this.detailModalVisible.set(true);
  }

  askDelete(item: TransportSupport): void {
    this.confirmItem.set(item);
    this.confirmVisible.set(true);
  }

  onConfirmDelete(): void {
    const item = this.confirmItem();
    if (!item) return;
    this.actionBusy.set(true);
    this.service.delete(item.transportSupportId).subscribe({
      next: () => {
        this.notifications.success('Transport support deleted');
        this.actionBusy.set(false);
        this.confirmVisible.set(false);
        this.confirmItem.set(null);
        this.load();
      },
      error: () => this.actionBusy.set(false),
    });
  }

  regenerateQr(item: TransportSupport): void {
    this.service.regenerateQr(item.transportSupportId).subscribe({
      next: () => {
        this.notifications.success('QR code regenerated');
        this.load();
      },
    });
  }

  pages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i);
  }
}
