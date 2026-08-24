import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  BadgeComponent,
  ButtonCloseDirective,
  ButtonDirective,
  ModalBodyComponent,
  ModalComponent,
  ModalFooterComponent,
  ModalHeaderComponent,
  ModalTitleDirective,
  SpinnerComponent,
} from '@coreui/angular';
import { AuditLogsService } from '../services/audit-logs.service';
import { AuditLog } from '../models/audit-log.model';

@Component({
  selector: 'app-audit-log-detail-modal',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    ModalComponent,
    ModalHeaderComponent,
    ModalTitleDirective,
    ModalBodyComponent,
    ModalFooterComponent,
    ButtonCloseDirective,
    ButtonDirective,
    SpinnerComponent,
    BadgeComponent,
  ],
  templateUrl: './audit-log-detail-modal.component.html',
})
export class AuditLogDetailModalComponent implements OnChanges {
  private readonly service = inject(AuditLogsService);

  @Input() visible = false;
  @Input() auditLogId: number | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();

  readonly loading = signal(false);
  readonly item = signal<AuditLog | null>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && !this.visible) {
      this.item.set(null);
    }
    if (this.visible && this.auditLogId != null) {
      this.load(this.auditLogId);
    }
  }

  close(): void {
    this.visibleChange.emit(false);
  }

  private load(id: number): void {
    this.loading.set(true);
    this.service.getById(id).subscribe({
      next: (log) => {
        this.item.set(log);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
