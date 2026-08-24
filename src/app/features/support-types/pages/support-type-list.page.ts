import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  FormControlDirective,
  FormDirective,
  FormLabelDirective,
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
import { SupportTypeFormModalComponent } from '../components/support-type-form-modal.component';
import { SupportType, SupportTypeFilter } from '../models/support-type.model';
import { SupportTypesService } from '../services/support-types.service';

/**
 * Page liste Support Types.
 * - Filtres code/label + pagination serveur (POST /search)
 * - Tri colonnes via toggleSort
 * - Modal create/edit + confirmation delete
 */
@Component({
  selector: 'app-support-type-list-page',
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
    ButtonDirective,
    TableDirective,
    PaginationComponent,
    PageItemDirective,
    PageLinkDirective,
    SpinnerComponent,
    IconDirective,
    HasPermissionDirective,
    SupportTypeFormModalComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './support-type-list.page.html',
})
export class SupportTypeListPage implements OnInit {
  private readonly service = inject(SupportTypesService);
  private readonly notifications = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly actionBusy = signal(false);
  readonly items = signal<SupportType[]>([]);
  readonly totalElements = signal(0);
  readonly totalPages = signal(1);
  readonly page = signal(0);
  readonly pageSize = 10;
  readonly sortBy = signal('code');
  readonly sortDirection = signal<'ASC' | 'DESC'>('ASC');

  readonly formModalVisible = signal(false);
  readonly editingItem = signal<SupportType | null>(null);
  readonly confirmVisible = signal(false);
  readonly confirmItem = signal<SupportType | null>(null);

  readonly filterForm = this.fb.nonNullable.group({ code: '', label: '' });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const filter: SupportTypeFilter = this.filterForm.getRawValue();
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
    this.filterForm.reset({ code: '', label: '' });
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

  openEdit(item: SupportType): void {
    this.editingItem.set(item);
    this.formModalVisible.set(true);
  }

  askDelete(item: SupportType): void {
    this.confirmItem.set(item);
    this.confirmVisible.set(true);
  }

  onConfirmDelete(): void {
    const item = this.confirmItem();
    if (!item) return;
    this.actionBusy.set(true);
    this.service.delete(item.supportTypeId).subscribe({
      next: () => {
        this.notifications.success('Support type deleted');
        this.actionBusy.set(false);
        this.confirmVisible.set(false);
        this.confirmItem.set(null);
        this.load();
      },
      error: () => this.actionBusy.set(false),
    });
  }

  pages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i);
  }
}
