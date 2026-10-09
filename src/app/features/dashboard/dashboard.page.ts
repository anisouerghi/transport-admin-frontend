import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  RowComponent,
  SpinnerComponent,
} from '@coreui/angular';
import { Chart } from 'chart.js/auto';
import { Config } from '../../helpers/config';
import { reportTypeIcon } from '../report-types/report-type-icons';
import { ReportStatusCount, ReportTypeCount } from './models/dashboard.model';
import { DashboardService } from './services/dashboard.service';

/** Couleurs des parts du camembert « par statut ». */
const STATUS_COLORS = ['#3399ff', '#f9b115', '#2eb85c', '#e55353', '#6c757d', '#8e44ad'];

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    ButtonDirective,
    RouterLink,
    RowComponent,
    ColComponent,
    SpinnerComponent,
  ],
  template: `
    <c-card class="mb-4">
      <c-card-header class="d-flex justify-content-between align-items-center">
        <strong>Signalements par type</strong>
        <button
          cButton
          color="secondary"
          variant="outline"
          size="sm"
          type="button"
          (click)="load()"
          [disabled]="loading()"
        >
          Actualiser
        </button>
      </c-card-header>
      <c-card-body>
        @if (loading()) {
          <div class="text-center py-4"><c-spinner></c-spinner></div>
        } @else if (reportsByType().length) {
          <c-row class="g-3">
            @for (item of reportsByType(); track item.reportTypeId) {
              <c-col xs="12" sm="6" lg="2">
                <c-card class="h-100 kpi-card">
                  <c-card-body class="d-flex align-items-center gap-3">
                    <span
                      [class]="'material-symbols-outlined kpi-icon kpi-icon--' + toneFor(item.code)"
                      aria-hidden="true"
                    >
                      {{ iconFor(item.code) }}
                    </span>
                    <div class="min-w-0">
                      <div class="fs-4 fw-semibold lh-1">{{ item.count }}</div>
                      <div class="text-body-secondary small text-truncate">{{ item.label }}</div>
                    </div>
                  </c-card-body>
                </c-card>
              </c-col>
            }
          </c-row>
          <div class="text-body-secondary small mt-3">
            {{ totalReports() }} signalement(s) au total
          </div>
        } @else {
          <p class="text-body-secondary mb-0">Aucun signalement à afficher.</p>
        }
      </c-card-body>
    </c-card>

    <c-row class="g-3">
      <c-col xs="12" lg="4"></c-col>
      <c-col xs="12" lg="4"></c-col>
      <c-col xs="12" lg="4">
        <c-card class="h-100">
          <c-card-header><strong>Signalements par statut</strong></c-card-header>
          <c-card-body>
            @if (statusLoading()) {
              <div class="text-center py-4"><c-spinner></c-spinner></div>
            } @else if (reportsByStatus().length) {
              <div class="chart-container">
                <canvas #statusChart></canvas>
              </div>
            } @else {
              <p class="text-body-secondary mb-0">Aucun signalement à afficher.</p>
            }
          </c-card-body>
        </c-card>
      </c-col>
    </c-row>
  `,
  styles: [
    `
      .kpi-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 3rem;
        height: 3rem;
        flex: 0 0 3rem;
        border-radius: 0.75rem;
        font-size: 1.6rem;
        background: rgba(108, 117, 125, 0.12);
        color: #6c757d;
      }

      .kpi-icon--primary {
        background: rgba(var(--cui-primary-rgb), 0.12);
        color: var(--cui-primary);
      }

      .kpi-icon--info {
        background: rgba(51, 153, 255, 0.12);
        color: #3399ff;
      }

      .kpi-icon--danger {
        background: rgba(231, 76, 60, 0.12);
        color: #e74c3c;
      }

      .kpi-icon--success {
        background: rgba(46, 184, 92, 0.12);
        color: #2eb85c;
      }

      .kpi-icon--warning {
        background: rgba(var(--cui-accent-rgb), 0.16);
        color: #b8860b;
      }

      .chart-container {
        position: relative;
        height: 260px;
      }
    `,
  ],
})
export class DashboardPage implements OnInit, OnDestroy {
  private readonly dashboardService = inject(DashboardService);

  readonly title = Config.APP_TITLE;
  readonly version = Config.APP_VERSION;

  readonly loading = signal(false);
  readonly reportsByType = signal<ReportTypeCount[]>([]);
  readonly statusLoading = signal(false);
  readonly reportsByStatus = signal<ReportStatusCount[]>([]);
  readonly iconFor = reportTypeIcon;

  private readonly statusCanvas = viewChild<ElementRef<HTMLCanvasElement>>('statusChart');
  private statusChart?: Chart;

  readonly totalReports = computed(() =>
    this.reportsByType().reduce((sum, item) => sum + item.count, 0)
  );

  constructor() {
    // (Re)dessine le camembert dès que les données ou le canvas sont disponibles.
    effect(() => {
      const canvas = this.statusCanvas()?.nativeElement;
      const data = this.reportsByStatus();
      if (!canvas) {
        return;
      }
      this.statusChart?.destroy();
      if (!data.length) {
        this.statusChart = undefined;
        return;
      }
      this.statusChart = new Chart(canvas, {
        type: 'pie',
        data: {
          labels: data.map((item) => item.label),
          datasets: [
            {
              data: data.map((item) => item.count),
              backgroundColor: data.map((_, index) => STATUS_COLORS[index % STATUS_COLORS.length]),
              borderColor: '#fff',
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' },
          },
        },
      });
    });
  }

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.statusChart?.destroy();
  }

  load(): void {
    this.loading.set(true);
    this.statusLoading.set(true);
    this.dashboardService.getReportsByType().subscribe({
      next: (data) => {
        this.reportsByType.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
    this.dashboardService.getReportsByStatus().subscribe({
      next: (data) => {
        this.reportsByStatus.set(data);
        this.statusLoading.set(false);
      },
      error: () => this.statusLoading.set(false),
    });
  }

  /** Couleur d'accent associée au type de signalement. */
  toneFor(code?: string | null): string {
    switch ((code ?? '').trim().toUpperCase()) {
      case 'URGENCE':
      case 'ASSAULT':
        return 'danger';
      case 'INCIDENT':
        return 'primary';
      case 'SUGGESTION':
        return 'info';
      case 'THANKS':
        return 'success';
      case 'COMPLAINT':
        return 'warning';
      default:
        return 'secondary';
    }
  }
}
