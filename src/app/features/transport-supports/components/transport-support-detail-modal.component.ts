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
import {
  ButtonCloseDirective,
  ButtonDirective,
  ModalBodyComponent,
  ModalComponent,
  ModalFooterComponent,
  ModalHeaderComponent,
  ModalTitleDirective,
} from '@coreui/angular';
import { TransportSupport } from '../models/transport-support.model';
import { TransportSupportsService } from '../services/transport-supports.service';

@Component({
  selector: 'app-transport-support-detail-modal',
  standalone: true,
  imports: [
    ModalComponent,
    ModalHeaderComponent,
    ModalTitleDirective,
    ModalBodyComponent,
    ModalFooterComponent,
    ButtonCloseDirective,
    ButtonDirective,
  ],
  template: `
    <c-modal alignment="center" size="lg" [visible]="visible" (visibleChange)="onVisibleChange($event)">
      <c-modal-header>
        <h5 cModalTitle>Transport support details</h5>
        <button cButtonClose (click)="close()"></button>
      </c-modal-header>
      <c-modal-body>
        @if (item) {
          <dl class="row mb-0">
            <dt class="col-sm-4">Reference</dt><dd class="col-sm-8">{{ item.reference }}</dd>
            <dt class="col-sm-4">Label</dt><dd class="col-sm-8">{{ item.label }}</dd>
            <dt class="col-sm-4">UUID</dt><dd class="col-sm-8 text-break">{{ item.uuid }}</dd>
            <dt class="col-sm-4">Support type</dt><dd class="col-sm-8">{{ item.supportTypeCode }} — {{ item.supportTypeLabel }}</dd>
            <dt class="col-sm-4">District</dt><dd class="col-sm-8">{{ item.districtCode }} — {{ item.districtLabel }}</dd>
            <dt class="col-sm-4">Support status</dt><dd class="col-sm-8">{{ item.supportStatus }}</dd>
            <dt class="col-sm-4">QR status</dt><dd class="col-sm-8">{{ item.qrStatus ?? '—' }}</dd>
            <dt class="col-sm-4">QR URL</dt><dd class="col-sm-8 text-break"><a [href]="item.qrCodeUrl" target="_blank" rel="noopener">{{ item.qrCodeUrl }}</a></dd>
            <dt class="col-sm-4">Created at</dt><dd class="col-sm-8">{{ item.createdAt ?? '—' }}</dd>
            <dt class="col-sm-4">Updated at</dt><dd class="col-sm-8">{{ item.updatedAt ?? '—' }}</dd>
          </dl>
          <div class="mt-3 text-center">
            @if (qrLoading()) {
              <p class="text-body-secondary mb-0">Chargement du QR…</p>
            } @else if (qrObjectUrl()) {
              <img [src]="qrObjectUrl()!" alt="QR Code" class="border rounded" width="200" height="200" />
            } @else if (qrError()) {
              <p class="text-danger mb-0">{{ qrError() }}</p>
            }
          </div>
        }
      </c-modal-body>
      <c-modal-footer>
        <button cButton color="secondary" variant="outline" type="button" (click)="close()">Close</button>
      </c-modal-footer>
    </c-modal>
  `,
})
export class TransportSupportDetailModalComponent implements OnChanges, OnDestroy {
  private readonly service = inject(TransportSupportsService);

  @Input() visible = false;
  @Input() item: TransportSupport | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();

  readonly qrObjectUrl = signal<string | null>(null);
  readonly qrLoading = signal(false);
  readonly qrError = signal<string | null>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['item'] || changes['visible']) {
      if (this.visible && this.item?.transportSupportId) {
        this.loadQr(this.item.transportSupportId);
      } else {
        this.clearQr();
      }
    }
  }

  ngOnDestroy(): void {
    this.clearQr();
  }

  onVisibleChange(value: boolean): void {
    this.visibleChange.emit(value);
    if (!value) {
      this.clearQr();
    }
  }

  close(): void {
    this.visibleChange.emit(false);
    this.clearQr();
  }

  private loadQr(id: number): void {
    this.clearQr();
    this.qrLoading.set(true);
    this.qrError.set(null);
    this.service.getQrImageBlob(id).subscribe({
      next: (blob) => {
        this.qrObjectUrl.set(URL.createObjectURL(blob));
        this.qrLoading.set(false);
      },
      error: () => {
        this.qrError.set("Impossible de charger l'image QR.");
        this.qrLoading.set(false);
      },
    });
  }

  private clearQr(): void {
    const url = this.qrObjectUrl();
    if (url) {
      URL.revokeObjectURL(url);
    }
    this.qrObjectUrl.set(null);
    this.qrLoading.set(false);
    this.qrError.set(null);
  }
}
