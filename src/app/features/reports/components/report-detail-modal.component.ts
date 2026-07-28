import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalBodyComponent, ModalComponent, ModalFooterComponent, ModalHeaderComponent, ModalTitleDirective, ButtonCloseDirective, ButtonDirective } from '@coreui/angular';
import { SpinnerComponent } from '@coreui/angular';
import { ReportsService } from '../services/reports.service';
import { Report } from '../models/report.model';

@Component({
  selector: 'app-report-detail-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent, ModalHeaderComponent, ModalTitleDirective, ModalBodyComponent, ModalFooterComponent, ButtonCloseDirective, ButtonDirective, SpinnerComponent],
  templateUrl: './report-detail-modal.component.html',
})
export class ReportDetailModalComponent implements OnChanges {
  private readonly reportsService = inject(ReportsService);

  @Input() visible = false;
  @Input() reportId: number | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();

  readonly loading = signal(false);
  readonly report = signal<Report | null>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && !this.visible) {
      this.report.set(null);
    }
    if (this.visible && this.reportId != null) {
      this.load(this.reportId);
    }
  }

  close(): void {
    this.visibleChange.emit(false);
  }

  private load(id: number): void {
    this.loading.set(true);
    this.reportsService.getReportById(id).subscribe({
      next: (r) => {
        this.report.set(r);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
