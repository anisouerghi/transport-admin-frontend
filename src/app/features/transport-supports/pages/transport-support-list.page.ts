import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
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
import { DistrictsService } from '../services/districts.service';
import { District } from '../models/district.model';
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
  private readonly districtsService = inject(DistrictsService);
  private readonly notifications = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly actionBusy = signal(false);
  readonly items = signal<TransportSupport[]>([]);
  readonly supportTypes = signal<SupportType[]>([]);
  readonly districts = signal<District[]>([]);
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
    districtId: '' as '' | string,
  });

  ngOnInit(): void {
    this.supportTypesService.getAll().subscribe((t) => this.supportTypes.set(t));
    this.districtsService.getAll().subscribe((d) => this.districts.set(d));
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
      supportTypeId: raw.supportTypeId ? Number(raw.supportTypeId) : undefined,
      districtId: raw.districtId ? Number(raw.districtId) : undefined,
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
    this.filterForm.reset({ reference: '', label: '', uuid: '', supportStatus: '', qrStatus: '', supportTypeId: '', districtId: '' });
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

  private qrPrintMessageMarkup(): string {
    return `
      <div class="message-block">
        <div class="message large">Une réclamation ?</div>
        <div class="message large">la TRANSTU est à votre écoute!</div>
        <div class="message small">exprimez-vous librement via notre formulaire de réclamation sécurisé.</div>
        <div class="message small">c'est simple et vous recevez des réponses pour suivre votre requete.</div>
      </div>
    `;
  }

  printQr(item: TransportSupport): void {
    this.service.getQrImageBlob(item.transportSupportId).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const printWindow = window.open('', '_blank', 'width=800,height=800');

        if (!printWindow) {
          this.notifications.error('Please allow popups to print the QR code.');
          URL.revokeObjectURL(objectUrl);
          return;
        }

        printWindow.document.write(`
          <html>
            <head>
              <title>QR Code - ${item.reference}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
                .wrap { text-align: center; padding: 24px; }
                .message-block { margin-bottom: 18px; }
                .message { line-height: 1.4; }
                .message.large { font-size: 18px; font-weight: 700; margin-bottom: 6px; }
                .message.small { font-size: 12px; font-weight: 400; margin-bottom: 4px; }
                img { max-width: 100%; height: auto; width: 320px; }
                .label { margin-top: 16px; font-size: 16px; }
              </style>
            </head>
            <body>
              <div class="wrap">
                ${this.qrPrintMessageMarkup()}
                <img src="${objectUrl}" alt="QR Code" />
                <div class="label">${item.supportTypeLabel ?? 'Support type'} - ${item.label}</div>
              </div>
              <script>
                window.onload = function () {
                  window.print();
                  window.setTimeout(function () { window.close(); }, 500);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
      },
      error: () => this.notifications.error('Unable to load the QR code for printing.'),
    });
  }

  printAllQr(): void {
    const items = this.items();
    if (!items.length) {
      this.notifications.info('No transport supports to print.');
      return;
    }

    this.actionBusy.set(true);
    const qrRequests = items.map((item) => this.service.getQrImageBlob(item.transportSupportId));

    forkJoin(qrRequests).subscribe({
      next: (blobs) => {
        const objectUrls = blobs.map((blob) => URL.createObjectURL(blob));
        const printWindow = window.open('', '_blank', 'width=1200,height=1000');

        if (!printWindow) {
          objectUrls.forEach((url) => URL.revokeObjectURL(url));
          this.actionBusy.set(false);
          this.notifications.error('Please allow popups to print all QR codes.');
          return;
        }

        const cards = items
          .map((item, index) => {
            const objectUrl = objectUrls[index];
            return `
              <div class="page-break">
                <div class="card">
                  ${this.qrPrintMessageMarkup()}
                  <img src="${objectUrl}" alt="QR Code" />
                  <div class="label">${item.label} - ${item.supportTypeLabel ?? 'Support type'}</div>
                </div>
              </div>
            `;
          })
          .join('');

        printWindow.document.write(`
          <html>
            <head>
              <title>All QR Codes</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 16px; }
                .page-break { page-break-after: always; margin-bottom: 24px; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
                .page-break:last-child { page-break-after: auto; }
                .card { text-align: center; padding: 24px; border: 1px solid #ddd; border-radius: 8px; display: inline-block; min-width: 320px; }
                .message-block { margin-bottom: 18px; }
                .message { line-height: 1.4; }
                .message.large { font-size: 18px; font-weight: 700; margin-bottom: 6px; }
                .message.small { font-size: 12px; font-weight: 400; margin-bottom: 4px; }
                img { max-width: 100%; height: auto; width: 360px; }
                .label { margin-top: 16px; font-size: 16px; font-weight: 600; }
              </style>
            </head>
            <body>
              ${cards}
              <script>
                window.onload = function () {
                  window.print();
                  window.setTimeout(function () { window.close(); }, 500);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
        window.setTimeout(() => objectUrls.forEach((url) => URL.revokeObjectURL(url)), 2000);
        this.actionBusy.set(false);
        this.notifications.success('Printing started for the current QR codes.');
      },
      error: () => {
        this.actionBusy.set(false);
        this.notifications.error('Unable to load the QR codes for printing.');
      },
    });
  }

  regenerateAllQr(): void {
    this.actionBusy.set(true);
    this.service.regenerateAllQr().subscribe({
      next: () => {
        this.notifications.success('All QR codes regenerated');
        this.actionBusy.set(false);
        this.load();
      },
      error: () => this.actionBusy.set(false),
    });
  }

  pages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i);
  }
}
