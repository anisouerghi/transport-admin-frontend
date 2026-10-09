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
  TableDirective,
} from '@coreui/angular';
import { Chart } from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Config } from '../../helpers/config';
import {
  ReportAuthenticationCount,
  ReportStatusCount,
  ReportSupportTypeCount,
  ReportTypeCount,
} from './models/dashboard.model';
import { DashboardService } from './services/dashboard.service';

// Plugin d'affichage des pourcentages dans les parts.
Chart.register(ChartDataLabels);

/** Couleurs modernes des parts du donut « par type ». */
const CHART_COLORS = ['#4f46e5', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

/** Éclaircit une couleur hexadécimale (lighten) pour construire un dégradé. */
function lighten(hex: string, amount: number): string {
  const value = hex.replace('#', '');
  const num = parseInt(value, 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  const mix = (channel: number) => Math.round(channel + (255 - channel) * amount);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

/** Affiche le total au centre du donut. */
const centerTotalPlugin = {
  id: 'centerTotal',
  afterDraw(chart: Chart): void {
    const dataset = chart.data.datasets[0];
    if (!dataset) {
      return;
    }
    const meta = chart.getDatasetMeta(0);
    const arc = meta.data[0] as { x?: number; y?: number } | undefined;
    if (!arc || arc.x == null || arc.y == null) {
      return;
    }
    const total = (dataset.data as number[]).reduce((sum, value) => sum + (value ?? 0), 0);
    const { ctx } = chart;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#4b5563';
    ctx.font = '600 0.8rem system-ui, sans-serif';
    ctx.fillText('Total', arc.x, arc.y - 14);
    ctx.fillStyle = '#1f2937';
    ctx.font = '700 1.6rem system-ui, sans-serif';
    ctx.fillText(String(total), arc.x, arc.y + 8);
    ctx.restore();
  },
};

Chart.register(centerTotalPlugin);

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
    TableDirective,
  ],
  template: `
    <c-card class="mb-4">
      <c-card-header class="d-flex justify-content-between align-items-center">
        <strong>Signalements par statut</strong>
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
        } @else if (reportsByStatus().length) {
          <c-row class="g-3">
            @for (item of reportsByStatus(); track item.statusId) {
              <c-col xs="12" sm="6" lg="2">
                <c-card class="h-100 kpi-card">
                  <c-card-body class="d-flex align-items-center gap-3">
                    <span
                      [class]="'material-symbols-outlined kpi-icon kpi-icon--' + toneForStatus(item.code)"
                      aria-hidden="true"
                    >
                      {{ statusIcon(item.code) }}
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
            {{ totalStatusReports() }} signalement(s) au total
          </div>
        } @else {
          <p class="text-body-secondary mb-0">Aucun signalement à afficher.</p>
        }
      </c-card-body>
    </c-card>

    <c-row class="g-3">
      <c-col xs="12" lg="4">
        <c-card class="h-100">
          <c-card-header><strong>Signalements par authentification</strong></c-card-header>
          <c-card-body>
            @if (authLoading()) {
              <div class="text-center py-4"><c-spinner></c-spinner></div>
            } @else if (hasAuthData()) {
              <div class="chart-container">
                <canvas #authChart></canvas>
              </div>
            } @else {
              <p class="text-body-secondary mb-0">Aucun signalement à afficher.</p>
            }
          </c-card-body>
        </c-card>
      </c-col>
      <c-col xs="12" lg="4">
        <c-card class="h-100">
          <c-card-header><strong>Signalements par support</strong></c-card-header>
          <c-card-body>
            @if (supportLoading()) {
              <div class="text-center py-4"><c-spinner></c-spinner></div>
            } @else if (reportsBySupportType().length) {
              <div class="table-responsive">
                <table cTable hover align="middle" class="mb-0">
                  <thead>
                    <tr>
                      <th>Type de support</th>
                      <th class="text-end">Nombre</th>
                      <th class="text-end">Pourcentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (item of reportsBySupportType(); track item.code) {
                      <tr>
                        <td>{{ item.label }}</td>
                        <td class="text-end">{{ item.count }}</td>
                        <td class="text-end">{{ percentFor(item.count) }}%</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <p class="text-body-secondary mb-0">Aucun signalement à afficher.</p>
            }
          </c-card-body>
        </c-card>
      </c-col>
      <c-col xs="12" lg="4">
        <c-card class="h-100">
          <c-card-header><strong>Signalements par type</strong></c-card-header>
          <c-card-body>
            @if (chartLoading()) {
              <div class="text-center py-4"><c-spinner></c-spinner></div>
            } @else if (reportsByType().length) {
              <div class="chart-container">
                <canvas #typeChart></canvas>
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
        height: 320px;
      }
    `,
  ],
})
export class DashboardPage implements OnInit, OnDestroy {
  private readonly dashboardService = inject(DashboardService);

  readonly title = Config.APP_TITLE;
  readonly version = Config.APP_VERSION;

  readonly loading = signal(false);
  readonly reportsByStatus = signal<ReportStatusCount[]>([]);
  readonly chartLoading = signal(false);
  readonly reportsByType = signal<ReportTypeCount[]>([]);
  readonly supportLoading = signal(false);
  readonly reportsBySupportType = signal<ReportSupportTypeCount[]>([]);
  readonly authLoading = signal(false);
  readonly reportsByAuthentication = signal<ReportAuthenticationCount | null>(null);

  private readonly typeCanvas = viewChild<ElementRef<HTMLCanvasElement>>('typeChart');
  private typeChart?: Chart;
  private readonly authCanvas = viewChild<ElementRef<HTMLCanvasElement>>('authChart');
  private authChart?: Chart;

  readonly totalStatusReports = computed(() =>
    this.reportsByStatus().reduce((sum, item) => sum + item.count, 0)
  );

  readonly totalSupportReports = computed(() =>
    this.reportsBySupportType().reduce((sum, item) => sum + item.count, 0)
  );

  readonly hasAuthData = computed(() => (this.reportsByAuthentication()?.total ?? 0) > 0);

  constructor() {
    // (Re)dessine le donut dès que les données ou le canvas sont disponibles.
    effect(() => {
      const canvas = this.typeCanvas()?.nativeElement;
      const data = this.reportsByType();
      if (!canvas) {
        return;
      }
      this.typeChart?.destroy();
      if (!data.length) {
        this.typeChart = undefined;
        return;
      }
      this.typeChart = new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: data.map((item) => item.label),
          datasets: [
            {
              data: data.map((item) => item.count),
              backgroundColor: (context) => {
                const index = context.dataIndex % CHART_COLORS.length;
                const base = CHART_COLORS[index];
                const { chart } = context;
                if (!chart.chartArea) {
                  return base;
                }
                const gradient = chart.ctx.createLinearGradient(
                  0,
                  chart.chartArea.top,
                  0,
                  chart.chartArea.bottom
                );
                gradient.addColorStop(0, lighten(base, 0.32));
                gradient.addColorStop(1, base);
                return gradient;
              },
              borderColor: '#fff',
              borderWidth: 3,
              borderRadius: 8,
              spacing: 3,
              hoverOffset: 10,
              hoverBorderColor: '#fff',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '64%',
          layout: { padding: 8 },
          animation: { animateRotate: true, animateScale: true, duration: 700 },
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
                pointStyle: 'circle',
                boxWidth: 8,
                boxHeight: 8,
                padding: 14,
                color: '#4b5563',
                font: { size: 12 },
              },
            },
            tooltip: {
              backgroundColor: 'rgba(17, 24, 39, 0.9)',
              padding: 10,
              cornerRadius: 8,
              callbacks: {
                label: (item) => {
                  const total = (item.dataset.data as number[]).reduce(
                    (sum, value) => sum + (value ?? 0),
                    0
                  );
                  const value = item.parsed;
                  const percent = total ? Math.round((value / total) * 100) : 0;
                  return ` ${item.label} : ${value} (${percent}%)`;
                },
              },
            },
            datalabels: {
              color: '#fff',
              font: { weight: 'bold', size: 12 },
              formatter: (value: number, context) => {
                const values = context.dataset.data as number[];
                const total = values.reduce((sum, item) => sum + (item ?? 0), 0);
                if (!total) {
                  return '';
                }
                const percent = Math.round((value / total) * 100);
                return percent >= 6 ? `${percent}%` : '';
              },
            },
          },
        },
      });
    });

    // (Re)dessine le bar chart d'authentification dès que les données/canvas sont prêts.
    effect(() => {
      const canvas = this.authCanvas()?.nativeElement;
      const data = this.reportsByAuthentication();
      if (!canvas) {
        return;
      }
      this.authChart?.destroy();
      if (!data || data.total <= 0) {
        this.authChart = undefined;
        return;
      }
      this.authChart = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: ['Authentifié', 'Anonyme'],
          datasets: [
            {
              data: [data.authenticated, data.anonymous],
              backgroundColor: ['#007a4d', '#ffc107'],
              borderRadius: 8,
              maxBarThickness: 72,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 700 },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: '#4b5563', font: { size: 12, weight: 'bold' } },
            },
            y: {
              beginAtZero: true,
              ticks: { precision: 0, color: '#6b7280' },
              grid: { color: 'rgba(0, 0, 0, 0.06)' },
            },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(17, 24, 39, 0.9)',
              padding: 10,
              cornerRadius: 8,
              callbacks: {
                label: (item) => ` ${item.label} : ${item.parsed.y}`,
              },
            },
          },
        },
      });
    });
  }

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.typeChart?.destroy();
    this.authChart?.destroy();
  }

  load(): void {
    this.loading.set(true);
    this.chartLoading.set(true);
    this.supportLoading.set(true);
    this.authLoading.set(true);
    this.dashboardService.getReportsByStatus().subscribe({
      next: (data) => {
        this.reportsByStatus.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
    this.dashboardService.getReportsByType().subscribe({
      next: (data) => {
        this.reportsByType.set(data);
        this.chartLoading.set(false);
      },
      error: () => this.chartLoading.set(false),
    });
    this.dashboardService.getReportsBySupportType().subscribe({
      next: (data) => {
        this.reportsBySupportType.set(data);
        this.supportLoading.set(false);
      },
      error: () => this.supportLoading.set(false),
    });
    this.dashboardService.getReportsByAuthentication().subscribe({
      next: (data) => {
        this.reportsByAuthentication.set(data);
        this.authLoading.set(false);
      },
      error: () => this.authLoading.set(false),
    });
  }

  /** Pourcentage du total, arrondi à une décimale si nécessaire. */
  percentFor(count: number): string {
    const total = this.totalSupportReports();
    const percent = total ? (count / total) * 100 : 0;
    return Number.isInteger(percent) ? String(percent) : percent.toFixed(1);
  }

  /** Icône associée au statut du signalement. */
  statusIcon(code?: string | null): string {
    switch ((code ?? '').trim().toUpperCase()) {
      case 'NEW':
        return 'fiber_new';
      case 'IN_PROGRESS':
        return 'hourglass_top';
      case 'CLOSED':
        return 'task_alt';
      case 'REJECTED':
        return 'cancel';
      default:
        return 'label';
    }
  }

  /** Couleur d'accent associée au statut. */
  toneForStatus(code?: string | null): string {
    switch ((code ?? '').trim().toUpperCase()) {
      case 'NEW':
        return 'info';
      case 'IN_PROGRESS':
        return 'warning';
      case 'CLOSED':
        return 'success';
      case 'REJECTED':
        return 'danger';
      default:
        return 'secondary';
    }
  }
}
