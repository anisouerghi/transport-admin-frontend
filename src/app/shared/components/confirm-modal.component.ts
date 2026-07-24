import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  ButtonCloseDirective,
  ButtonDirective,
  ModalBodyComponent,
  ModalComponent,
  ModalFooterComponent,
  ModalHeaderComponent,
  ModalTitleDirective,
} from '@coreui/angular';

@Component({
  selector: 'app-confirm-modal',
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
    <c-modal alignment="center" [visible]="visible" (visibleChange)="visibleChange.emit($event)">
      <c-modal-header>
        <h5 cModalTitle>{{ title }}</h5>
        <button cButtonClose (click)="cancel()"></button>
      </c-modal-header>
      <c-modal-body>
        <p class="mb-0">{{ message }}</p>
      </c-modal-body>
      <c-modal-footer>
        <button cButton color="secondary" variant="outline" type="button" (click)="cancel()">
          {{ cancelLabel }}
        </button>
        <button cButton [color]="confirmColor" type="button" [disabled]="busy" (click)="confirm.emit()">
          {{ busy ? 'Please wait…' : confirmLabel }}
        </button>
      </c-modal-footer>
    </c-modal>
  `,
})
export class ConfirmModalComponent {
  @Input() visible = false;
  @Input() title = 'Confirm';
  @Input() message = '';
  @Input() confirmLabel = 'Confirm';
  @Input() cancelLabel = 'Cancel';
  @Input() confirmColor: 'primary' | 'danger' | 'warning' | 'success' = 'primary';
  @Input() busy = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() confirm = new EventEmitter<void>();

  cancel(): void {
    this.visibleChange.emit(false);
  }
}
