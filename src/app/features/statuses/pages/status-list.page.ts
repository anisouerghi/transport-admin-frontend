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
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal.component';
import { StatusFormModalComponent } from '../components/status-form-modal.component';
import { Status, StatusFilter } from '../models/status.model';
import { StatusesService } from '../services/statuses.service';

@Component({
  selector: 'app-status-list-page',
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
    StatusFormModalComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './status-list.page.html',
})
export class StatusListPage implements OnInit {
  private readonly service = inject(StatusesService);
  private readonly notifications = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly actionBusy = signal(false);
  readonly items = signal<Status[]>([]);
  readonly totalElements = signal(0);
  readonly totalPages = signal(1);
  readonly page = signal(0);
  readonly pageSize = 10;

  readonly formModalVisible = signal(false);
  readonly editingItem = signal<Status | null>(null);

  readonly confirmVisible = signal(false);
  readonly confirmItem = signal<Status | null>(null);

  readonly filterForm = this.fb.nonNullable.group({
    code: '',
    label: '',
    displayOrder: '' as '' | number,
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const raw = this.filterForm.getRawValue();
    const filter: StatusFilter = {
      code: raw.code,
      label: raw.label,
      displayOrder: raw.displayOrder === '' ? undefined : Number(raw.displayOrder),
    };
    this.service.search(this.page(), this.pageSize, filter).subscribe({
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
    this.filterForm.reset({ code: '', label: '', displayOrder: '' });
    this.page.set(0);
    this.load();
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages()) {
      return;
    }
    this.page.set(page);
    this.load();
  }

  openCreate(): void {
    this.editingItem.set(null);
    this.formModalVisible.set(true);
  }

  openEdit(item: Status): void {
    this.editingItem.set(item);
    this.formModalVisible.set(true);
  }

  askDelete(item: Status): void {
    this.confirmItem.set(item);
    this.confirmVisible.set(true);
  }

  onConfirm(): void {
    const item = this.confirmItem();
    if (!item) {
      return;
    }

    this.actionBusy.set(true);
    this.service.delete(item.statusId).subscribe({
      next: () => {
        this.notifications.success('Status deleted');
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
