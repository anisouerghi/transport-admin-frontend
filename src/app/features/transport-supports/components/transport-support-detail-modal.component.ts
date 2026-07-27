import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
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
    <c-modal alignment="center" size="lg" [visible]="visible" (visibleChange)="visibleChange.emit($event)">
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
            <dt class="col-sm-4">Support status</dt><dd class="col-sm-8">{{ item.supportStatus }}</dd>
            <dt class="col-sm-4">QR status</dt><dd class="col-sm-8">{{ item.qrStatus ?? '—' }}</dd>
            <dt class="col-sm-4">QR URL</dt><dd class="col-sm-8 text-break"><a [href]="item.qrCodeUrl" target="_blank" rel="noopener">{{ item.qrCodeUrl }}</a></dd>
            <dt class="col-sm-4">Created at</dt><dd class="col-sm-8">{{ item.createdAt ?? '—' }}</dd>
            <dt class="col-sm-4">Updated at</dt><dd class="col-sm-8">{{ item.updatedAt ?? '—' }}</dd>
          </dl>
          @if (item.transportSupportId) {
            <div class="mt-3 text-center">
              <img [src]="qrUrl" alt="QR Code" class="border rounded" width="200" height="200" />
            </div>
          }
        }
      </c-modal-body>
      <c-modal-footer>
        <button cButton color="secondary" variant="outline" type="button" (click)="close()">Close</button>
      </c-modal-footer>
    </c-modal>
  `,
})
export class TransportSupportDetailModalComponent {
  private readonly service = inject(TransportSupportsService);

  @Input() visible = false;
  @Input() item: TransportSupport | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();

  get qrUrl(): string {
    return this.item ? this.service.getQrImageUrl(this.item.transportSupportId) : '';
  }

  close(): void {
    this.visibleChange.emit(false);
  }
}
