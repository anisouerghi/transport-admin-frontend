import { Component, OnInit, inject, signal } from '@angular/core';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  RowComponent,
  SpinnerComponent,
} from '@coreui/angular';
import { StatisticsOverview } from '../models/statistics.model';
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
  ],
  templateUrl: './statistics-overview.page.html',
})
export class StatisticsOverviewPage implements OnInit {
  private readonly statisticsService = inject(StatisticsService);

  readonly loading = signal(false);
  readonly overview = signal<StatisticsOverview | null>(null);

  ngOnInit(): void {
    this.load();
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
}
