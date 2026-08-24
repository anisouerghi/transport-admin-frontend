import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  BadgeComponent,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  FormControlDirective,
  FormDirective,
  FormLabelDirective,
  FormSelectDirective,
  PageItemDirective,
  PageLinkDirective,
  PaginationComponent,
  RowComponent,
  SpinnerComponent,
  TableDirective,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { NotificationService } from '../../../core/services/notification.service';
import { HasPermissionDirective } from '../../../core/directives/has-permission.directive';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal.component';
import { ReportNatureFormModalComponent } from '../components/report-nature-form-modal.component';
import { ReportNature, ReportNatureFilter } from '../models/report-nature.model';
import { ReportNaturesService } from '../services/report-natures.service';

type ConfirmAction = 'delete' | 'activate' | 'deactivate';

@Component({
  selector: 'app-report-nature-list-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    RowComponent,
    ColComponent,
    FormDirective,
    FormLabelDirective,
    FormControlDirective,
    FormSelectDirective,
    ButtonDirective,
    TableDirective,
    PaginationComponent,
    PageItemDirective,
    PageLinkDirective,
    SpinnerComponent,
    IconDirective,
    BadgeComponent,
    HasPermissionDirective,
    ReportNatureFormModalComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './report-nature-list.page.html',
})
export class ReportNatureListPage implements OnInit {
  private readonly service = inject(ReportNaturesService);
  private readonly notifications = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly actionBusy = signal(false);
  readonly items = signal<ReportNature[]>([]);
  readonly totalElements = signal(0);
  readonly totalPages = signal(1);
  readonly page = signal(0);
  readonly pageSize = 10;
  readonly sortBy = signal('label');
  readonly sortDirection = signal<'ASC' | 'DESC'>('ASC');

  readonly formModalVisible = signal(false);
  readonly editingItem = signal<ReportNature | null>(null);
  readonly confirmVisible = signal(false);
  readonly confirmAction = signal<ConfirmAction>('delete');
  readonly confirmItem = signal<ReportNature | null>(null);

  readonly filterForm = this.fb.nonNullable.group({
    code: '',
    label: '',
    description: '',
    active: '' as '' | 'true' | 'false',
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const raw = this.filterForm.getRawValue();
    const filter: ReportNatureFilter = {
      code: raw.code,
      label: raw.label,
      description: raw.description,
      active: raw.active === '' ? null : raw.active === 'true',
    };
    this.service
      .search(this.page(), this.pageSize, filter, this.sortBy(), this.sortDirection())
      .subscribe({
        next: (result) => {
          this.items.set(result.content);
          this.totalElements.set(result.totalElements);
          this.totalPages.set(result.totalPages);
          this.page.set(result.page);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  search(): void {
    this.page.set(0);
    this.load();
  }

  resetFilters(): void {
    this.filterForm.reset({ code: '', label: '', description: '', active: '' });
    this.page.set(0);
    this.load();
  }

  toggleSort(field: string): void {
    if (this.sortBy() === field) {
      this.sortDirection.set(this.sortDirection() === 'ASC' ? 'DESC' : 'ASC');
    } else {
      this.sortBy.set(field);
      this.sortDirection.set('ASC');
    }
    this.load();
  }

  goToPage(p: number): void {
    if (p < 0 || p >= this.totalPages()) return;
    this.page.set(p);
    this.load();
  }

  openCreate(): void {
    this.editingItem.set(null);
    this.formModalVisible.set(true);
  }

  openEdit(item: ReportNature): void {
    this.editingItem.set(item);
    this.formModalVisible.set(true);
  }

  askDelete(item: ReportNature): void {
    this.confirmItem.set(item);
    this.confirmAction.set('delete');
    this.confirmVisible.set(true);
  }

  askActivate(item: ReportNature): void {
    this.confirmItem.set(item);
    this.confirmAction.set('activate');
    this.confirmVisible.set(true);
  }

  askDeactivate(item: ReportNature): void {
    this.confirmItem.set(item);
    this.confirmAction.set('deactivate');
    this.confirmVisible.set(true);
  }

  get confirmTitle(): string {
    switch (this.confirmAction()) {
      case 'activate':
        return 'Activer la nature';
      case 'deactivate':
        return 'Désactiver la nature';
      default:
        return 'Supprimer la nature';
    }
  }

  get confirmMessage(): string {
    const item = this.confirmItem();
    const name = item?.code ?? '';
    switch (this.confirmAction()) {
      case 'activate':
        return `Activer la nature « ${name} » ?`;
      case 'deactivate':
        return `Désactiver la nature « ${name} » ?`;
      default:
        return `Supprimer définitivement la nature « ${name} » ? Impossible si des signalements y sont rattachés.`;
    }
  }

  get confirmLabel(): string {
    switch (this.confirmAction()) {
      case 'activate':
        return 'Activer';
      case 'deactivate':
        return 'Désactiver';
      default:
        return 'Supprimer';
    }
  }

  get confirmColor(): 'primary' | 'danger' | 'warning' | 'success' {
    switch (this.confirmAction()) {
      case 'activate':
        return 'success';
      case 'deactivate':
        return 'warning';
      default:
        return 'danger';
    }
  }

  onConfirm(): void {
    const item = this.confirmItem();
    if (!item) return;

    this.actionBusy.set(true);
    const action = this.confirmAction();
    const done = (message: string) => {
      this.notifications.success(message);
      this.actionBusy.set(false);
      this.confirmVisible.set(false);
      this.confirmItem.set(null);
      this.load();
    };
    const fail = () => this.actionBusy.set(false);

    if (action === 'delete') {
      this.service.delete(item.reportNatureId).subscribe({
        next: () => done('Nature supprimée'),
        error: fail,
      });
      return;
    }
    if (action === 'activate') {
      this.service.activate(item.reportNatureId).subscribe({
        next: () => done('Nature activée'),
        error: fail,
      });
      return;
    }
    this.service.deactivate(item.reportNatureId).subscribe({
      next: () => done('Nature désactivée'),
      error: fail,
    });
  }

  pages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i);
  }
}
