import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ButtonDirective,
  FormControlDirective,
  FormLabelDirective,
  FormSelectDirective,
  SpinnerComponent,
} from '@coreui/angular';
import { NotificationService } from '../../../core/services/notification.service';
import { ReportType } from '../../report-types/models/report-type.model';
import { ReportTypesService } from '../../report-types/services/report-types.service';
import {
  ReportAnalysisGrouping,
  ReportAnalysisOption,
  ReportAnalysisResult,
  SatisfactionComment,
  SatisfactionSummary,
  StatisticsOverview,
} from '../models/statistics.model';
import { StatisticsService } from '../services/statistics.service';

/**
 * Page Rapports & Statistiques — squelette extensible.
 * Les indicateurs et tableaux de bord seront ajoutés progressivement.
 */
@Component({
  selector: 'app-statistics-overview-page',
  standalone: true,
  imports: [
    ButtonDirective,
    SpinnerComponent,
    FormsModule,
    FormLabelDirective,
    FormControlDirective,
    FormSelectDirective,
  ],
  templateUrl: './statistics-overview.page.html',
  styles: [
    `
      .stats-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
        margin-bottom: 1.25rem;
      }
      .stats-kicker {
        margin: 0;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #8a6a00;
      }
      .stats-title {
        margin: 0.15rem 0 0;
        font-size: 1.45rem;
        font-weight: 700;
        color: #003b7f;
      }
      .stats-lead {
        margin: 0.35rem 0 0;
        max-width: 42rem;
        color: #5c6770;
      }
      .panel {
        border: 1px solid #e4e7ec;
        border-radius: 0.9rem;
        background: #fff;
        box-shadow: 0 8px 24px rgba(0, 59, 127, 0.05);
      }
      .panel__head {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        padding: 0.9rem 1.1rem;
        border-bottom: 1px solid #eef1f4;
        font-weight: 700;
        color: #003b7f;
      }
      .panel__body {
        padding: 1.1rem;
      }
      .kpi-grid,
      .sat-grid {
        display: grid;
        gap: 0.85rem;
      }
      .kpi-grid {
        grid-template-columns: repeat(auto-fit, minmax(10.5rem, 1fr));
      }
      .sat-grid {
        grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
      }
      .kpi {
        position: relative;
        overflow: hidden;
        min-height: 6.4rem;
        padding: 0.95rem 1rem 0.9rem;
        border: 1px solid #e6ebf2;
        border-radius: 0.85rem;
        background: #fff;
      }
      .kpi::before {
        content: '';
        position: absolute;
        inset: 0 auto 0 0;
        width: 4px;
      }
      .kpi__icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2.2rem;
        height: 2.2rem;
        margin-bottom: 0.65rem;
        border-radius: 0.65rem;
        font-family: 'Material Symbols Outlined';
        font-size: 1.25rem;
        font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24;
        line-height: 1;
      }
      .kpi__label {
        color: #5c6770;
        font-size: 0.78rem;
        font-weight: 600;
      }
      .kpi__value {
        margin-top: 0.15rem;
        font-size: 1.55rem;
        font-weight: 700;
        line-height: 1.1;
        color: #1c2833;
      }
      .kpi__hint {
        margin-top: 0.2rem;
        color: #7b8794;
        font-size: 0.75rem;
      }
      .tone-navy::before { background: #003b7f; }
      .tone-navy .kpi__icon { background: rgba(0, 59, 127, 0.1); color: #003b7f; }
      .tone-teal::before { background: #0f766e; }
      .tone-teal .kpi__icon { background: rgba(15, 118, 110, 0.12); color: #0f766e; }
      .tone-gold::before { background: #f5bf00; }
      .tone-gold .kpi__icon { background: rgba(245, 191, 0, 0.22); color: #8a6a00; }
      .tone-ok::before { background: #1f8a4c; }
      .tone-ok .kpi__icon { background: rgba(31, 138, 76, 0.12); color: #1f8a4c; }
      .tone-mid::before { background: #d97706; }
      .tone-mid .kpi__icon { background: rgba(217, 119, 6, 0.14); color: #b45309; }
      .tone-bad::before { background: #c0392b; }
      .tone-bad .kpi__icon { background: rgba(192, 57, 43, 0.12); color: #c0392b; }
      .tone-slate::before { background: #64748b; }
      .tone-slate .kpi__icon { background: rgba(100, 116, 139, 0.14); color: #475569; }
      .filters {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr)) auto;
        gap: 0.75rem;
        align-items: end;
        margin-bottom: 1rem;
        padding: 0.9rem;
        border-radius: 0.8rem;
        background: #f7f9fc;
      }
      .mix {
        display: flex;
        height: 0.7rem;
        margin: 0.2rem 0 1rem;
        overflow: hidden;
        border-radius: 999px;
        background: #eef1f4;
      }
      .mix span { display: block; min-width: 0; }
      .mix__ok { background: #1f8a4c; }
      .mix__mid { background: #f5bf00; }
      .mix__bad { background: #c0392b; }
      .meter {
        height: 0.35rem;
        margin-top: 0.55rem;
        overflow: hidden;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.45);
      }
      .meter > span {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: currentColor;
      }
      .comments {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
      }
      .comments th {
        padding: 0.65rem 0.75rem;
        background: #f4f7fb;
        color: #003b7f;
        font-size: 0.75rem;
        letter-spacing: 0.03em;
        text-transform: uppercase;
      }
      .comments td {
        padding: 0.75rem;
        border-top: 1px solid #eef1f4;
        vertical-align: top;
      }
      .pill {
        display: inline-flex;
        align-items: center;
        padding: 0.2rem 0.55rem;
        border-radius: 999px;
        font-size: 0.75rem;
        font-weight: 700;
        white-space: nowrap;
      }
      .pill--ok { background: rgba(31, 138, 76, 0.12); color: #166534; }
      .pill--mid { background: rgba(245, 191, 0, 0.28); color: #7a5b00; }
      .pill--bad { background: rgba(192, 57, 43, 0.12); color: #9b2c20; }
      .empty {
        margin: 0;
        padding: 1rem;
        border-radius: 0.7rem;
        background: #f7f9fc;
        color: #5c6770;
      }
      .stats-split {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: 1rem;
        align-items: start;
      }
      .stats-split .filters {
        grid-template-columns: 1fr 1fr;
      }
      .stats-split .filters button {
        grid-column: 1 / -1;
      }
      .analysis-form {
        display: grid;
        gap: 0.65rem;
      }
      .analysis-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      .kind-subtotal td { font-weight: 700; color: #003b7f; background: #e8eef6; }
      .kind-total td { font-weight: 700; color: #fff; background: #003b7f; }
      @media (max-width: 1100px) {
        .stats-split { grid-template-columns: minmax(0, 1fr); }
      }
      @media (max-width: 900px) {
        .filters { grid-template-columns: 1fr 1fr; }
      }
    `,
  ],
})
export class StatisticsOverviewPage implements OnInit {
  private readonly statisticsService = inject(StatisticsService);
  private readonly reportTypesService = inject(ReportTypesService);
  private readonly notifications = inject(NotificationService);

  readonly loading = signal(false);
  readonly overview = signal<StatisticsOverview | null>(null);
  readonly satisfactionLoading = signal(false);
  readonly satisfaction = signal<SatisfactionSummary | null>(null);
  readonly comments = signal<SatisfactionComment[]>([]);
  readonly reportTypes = signal<ReportType[]>([]);
  from = '';
  to = '';
  reportTypeId = '';
  transportSupportId = '';

  readonly analysisLoading = signal(false);
  readonly exporting = signal<'pdf' | 'excel' | null>(null);
  readonly analysis = signal<ReportAnalysisResult | null>(null);
  readonly analysisError = signal('');
  readonly analysisReportTypes = signal<ReportAnalysisOption[]>([]);
  readonly analysisSupportTypes = signal<ReportAnalysisOption[]>([]);
  readonly analysisSupports = signal<ReportAnalysisOption[]>([]);
  readonly groupings: { value: ReportAnalysisGrouping; label: string }[] = [
    { value: 'NONE', label: 'Aucun regroupement' },
    { value: 'REPORT_TYPE', label: 'Type de signalement' },
    { value: 'SUPPORT_TYPE', label: 'Type de support' },
    { value: 'SUPPORT', label: 'Support précis' },
    { value: 'SUPPORT_TYPE_THEN_SUPPORT', label: 'Type de support puis support précis' },
    { value: 'REPORT_TYPE_THEN_SUPPORT_TYPE', label: 'Type de signalement puis type de support' },
    { value: 'SUPPORT_TYPE_THEN_REPORT_TYPE', label: 'Type de support puis type de signalement' },
  ];
  analysisTitle = "Rapport d'analyse des signalements – TRANSTU";
  analysisSubtitle = '';
  analysisFrom = '';
  analysisTo = '';
  analysisReportTypeId = '';
  analysisSupportTypeId = '';
  analysisSupportId = '';
  analysisSupportQuery = '';
  analysisGrouping: ReportAnalysisGrouping = 'SUPPORT_TYPE';

  ngOnInit(): void {
    this.load();
    this.reportTypesService.getActive().subscribe({
      next: (types) => this.reportTypes.set(types),
      error: () => this.reportTypes.set([]),
    });
    this.loadSatisfaction();
    this.statisticsService.analysisOptions().subscribe({
      next: (options) => {
        this.analysisReportTypes.set(options.reportTypes ?? []);
        this.analysisSupportTypes.set(options.supportTypes ?? []);
      },
      error: () => {
        this.analysisReportTypes.set([]);
        this.analysisSupportTypes.set([]);
      },
    });
    this.loadAnalysis();
  }

  load(): void {
    this.loading.set(true);
    this.statisticsService.getOverview().subscribe({
      next: (data) => {
        this.overview.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadSatisfaction(): void {
    this.satisfactionLoading.set(true);
    const filter = {
      from: this.from || undefined,
      to: this.to || undefined,
      reportTypeId: this.reportTypeId ? Number(this.reportTypeId) : undefined,
      transportSupportId: this.transportSupportId ? Number(this.transportSupportId) : undefined,
    };
    this.statisticsService.getSatisfaction(filter).subscribe({
      next: (data) => {
        this.satisfaction.set(data);
        this.satisfactionLoading.set(false);
      },
      error: () => {
        this.satisfaction.set(null);
        this.satisfactionLoading.set(false);
      },
    });
    this.statisticsService.getSatisfactionComments(filter).subscribe({
      next: (page) => this.comments.set(page.content ?? []),
      error: () => this.comments.set([]),
    });
  }

  loadAnalysis(): void {
    if (this.analysisFrom && this.analysisTo && this.analysisFrom > this.analysisTo) {
      this.analysisError.set('La date de début doit être antérieure ou égale à la date de fin.');
      return;
    }
    this.analysisError.set('');
    this.analysisLoading.set(true);
    this.statisticsService.analyze(this.analysisRequest()).subscribe({
      next: (data) => {
        this.analysis.set(data);
        this.analysisLoading.set(false);
      },
      error: (error) => {
        this.analysis.set(null);
        this.analysisError.set(error?.error?.message || "Impossible de charger l'analyse.");
        this.analysisLoading.set(false);
      },
    });
  }

  resetAnalysis(): void {
    this.analysisTitle = "Rapport d'analyse des signalements – TRANSTU";
    this.analysisSubtitle = '';
    this.analysisFrom = '';
    this.analysisTo = '';
    this.analysisReportTypeId = '';
    this.analysisSupportTypeId = '';
    this.analysisSupportId = '';
    this.analysisSupportQuery = '';
    this.analysisGrouping = 'SUPPORT_TYPE';
    this.analysisSupports.set([]);
    this.loadAnalysis();
  }

  onSupportTypeChange(): void {
    this.analysisSupportId = '';
    this.loadSupports();
  }

  loadSupports(): void {
    const typeId = this.analysisSupportTypeId ? Number(this.analysisSupportTypeId) : undefined;
    const query = this.analysisSupportQuery.trim();
    if (!typeId && query.length < 2) {
      this.analysisSupports.set([]);
      return;
    }
    this.statisticsService.analysisSupports(typeId, query || undefined).subscribe({
      next: (supports) => this.analysisSupports.set(supports),
      error: () => this.analysisSupports.set([]),
    });
  }

  exportAnalysis(format: 'pdf' | 'excel'): void {
    if (this.analysisFrom && this.analysisTo && this.analysisFrom > this.analysisTo) {
      this.notifications.error('La date de début doit être antérieure ou égale à la date de fin.');
      return;
    }
    this.exporting.set(format);
    this.statisticsService.exportAnalysis(this.analysisRequest(), format).subscribe({
      next: (response) => {
        const blob = response.body;
        if (!blob) {
          this.notifications.error("Le rapport n'a pas pu être généré.");
          this.exporting.set(null);
          return;
        }
        const header = response.headers.get('Content-Disposition') ?? '';
        const named = /filename="([^"]+)"/.exec(header)?.[1];
        const fallback = `rapport-analyse-signalements.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = named || fallback;
        link.click();
        URL.revokeObjectURL(url);
        this.exporting.set(null);
      },
      error: (error) => {
        this.readExportError(error).then((message) => this.notifications.error(message));
        this.exporting.set(null);
      },
    });
  }

  private analysisRequest() {
    return {
      title: this.analysisTitle.trim() || undefined,
      subtitle: this.analysisSubtitle.trim() || undefined,
      from: this.analysisFrom || undefined,
      to: this.analysisTo || undefined,
      reportTypeId: this.analysisReportTypeId ? Number(this.analysisReportTypeId) : undefined,
      supportTypeId: this.analysisSupportTypeId ? Number(this.analysisSupportTypeId) : undefined,
      transportSupportId: this.analysisSupportId ? Number(this.analysisSupportId) : undefined,
      grouping: this.analysisGrouping,
    };
  }

  private async readExportError(error: { error?: unknown }): Promise<string> {
    const fallback = "Le rapport n'a pas pu être généré.";
    if (error?.error instanceof Blob) {
      try {
        const parsed = JSON.parse(await error.error.text()) as { message?: string };
        return parsed.message || fallback;
      } catch {
        return fallback;
      }
    }
    return fallback;
  }

  levelClass(level: string): string {
    switch (level) {
      case 'SATISFAIT':
        return 'pill pill--ok';
      case 'MOYENNEMENT_SATISFAIT':
        return 'pill pill--mid';
      case 'NON_SATISFAIT':
        return 'pill pill--bad';
      default:
        return 'pill';
    }
  }

  levelLabel(level: string): string {
    switch (level) {
      case 'SATISFAIT':
        return 'Satisfait';
      case 'MOYENNEMENT_SATISFAIT':
        return 'Moyennement satisfait';
      case 'NON_SATISFAIT':
        return 'Non satisfait';
      default:
        return level;
    }
  }
}
