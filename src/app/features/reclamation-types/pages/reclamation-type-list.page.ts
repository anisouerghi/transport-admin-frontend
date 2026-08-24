import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  ButtonDirective, CardBodyComponent, CardComponent, CardHeaderComponent, SpinnerComponent,
  TableDirective,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { HasPermissionDirective } from '../../../core/directives/has-permission.directive';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal.component';
import { ReclamationTypeFormModalComponent } from '../components/reclamation-type-form-modal.component';
import { ReclamationType } from '../models/reclamation-type.model';
import { ReclamationTypesService } from '../services/reclamation-types.service';

@Component({
  selector: 'app-reclamation-type-list-page',
  standalone: true,
  imports: [
    ReactiveFormsModule, CardComponent, CardHeaderComponent, CardBodyComponent,
    ButtonDirective, TableDirective, SpinnerComponent, IconDirective,
    HasPermissionDirective, ReclamationTypeFormModalComponent, ConfirmModalComponent,
  ],
  templateUrl: './reclamation-type-list.page.html',
})
export class ReclamationTypeListPage implements OnInit {
  private readonly service = inject(ReclamationTypesService);
  private readonly notifications = inject(NotificationService);
  readonly loading = signal(false);
  readonly items = signal<ReclamationType[]>([]);
  readonly formModalVisible = signal(false);
  readonly editingItem = signal<ReclamationType | null>(null);
  readonly confirmVisible = signal(false);
  readonly confirmItem = signal<ReclamationType | null>(null);
  readonly actionBusy = signal(false);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.service.getAll().subscribe({
      next: (items) => { this.items.set(items); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openCreate(): void { this.editingItem.set(null); this.formModalVisible.set(true); }
  openEdit(item: ReclamationType): void { this.editingItem.set(item); this.formModalVisible.set(true); }
  askDelete(item: ReclamationType): void { this.confirmItem.set(item); this.confirmVisible.set(true); }

  onConfirmDelete(): void {
    const item = this.confirmItem();
    if (!item) return;
    this.actionBusy.set(true);
    this.service.delete(item.reclamationTypeId).subscribe({
      next: () => {
        this.notifications.success('Type de réclamation supprimé');
        this.actionBusy.set(false); this.confirmVisible.set(false); this.confirmItem.set(null); this.load();
      },
      error: () => this.actionBusy.set(false),
    });
  }
}