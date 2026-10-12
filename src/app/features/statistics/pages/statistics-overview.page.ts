import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  FormControlDirective,
  FormLabelDirective,
  FormSelectDirective,
  RowComponent,
  SpinnerComponent,
  TableDirective,
} from '@coreui/angular';
import { ReportType } from '../../report-types/models/report-type.model';
import { ReportTypesService } from '../../report-types/services/report-types.service';
import { SatisfactionComment, SatisfactionSummary, StatisticsOverview } from '../models/statistics.model';
import { StatisticsService } from '../services/statistics.service';

/**
 * Page Rapports & Statistiques — squelette extensible.
 * Les indicateurs et tableaux de bord seront ajoutés progressivement.
 */
@Component({
  selector: 'app-statistics-overview-page',
  standalone: true,
  imports: [
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    RowComponent,
    ColComponent,
    ButtonDirective,
    SpinnerComponent,
    FormsModule,
    FormLabelDirective,
    FormControlDirective,
    FormSelectDirective,
    TableDirective,
  ],
  templateUrl: './statistics-overview.page.html',
})
export class StatisticsOverviewPage implements OnInit {
  private readonly statisticsService = inject(StatisticsService);
  private readonly reportTypesService = inject(ReportTypesService);

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

  ngOnInit(): void {
    this.load();
    this.reportTypesService.getActive().subscribe({
      next: (types) => this.reportTypes.set(types),
      error: () => this.reportTypes.set([]),
    });
    this.loadSatisfaction();
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
