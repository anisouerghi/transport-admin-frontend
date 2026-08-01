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
import { NotificationService } from '../../../core/services/notification.service';
import { HasPermissionDirective } from '../../../core/directives/has-permission.directive';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal.component';
import { PassengerDetailModalComponent } from '../components/passenger-detail-modal.component';
import { Passenger, PassengerFilter } from '../models/passenger.model';
import { PassengersService } from '../services/passengers.service';

type ConfirmAction = 'activate' | 'deactivate';

@Component({
  selector: 'app-passenger-list-page',
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
    BadgeComponent,
    HasPermissionDirective,
    ConfirmModalComponent,
    PassengerDetailModalComponent,
  ],
  templateUrl: './passenger-list.page.html',
})
export class PassengerListPage implements OnInit {
  private readonly passengersService = inject(PassengersService);
  private readonly notifications = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly actionBusy = signal(false);
  readonly passengers = signal<Passenger[]>([]);
  readonly totalElements = signal(0);
  readonly totalPages = signal(1);
  readonly page = signal(0);
  readonly size = 10;

  readonly detailVisible = signal(false);
  readonly detailPassengerId = signal<number | null>(null);

  readonly confirmVisible = signal(false);
  readonly confirmAction = signal<ConfirmAction>('activate');
  readonly confirmPassenger = signal<Passenger | null>(null);

  readonly filterForm = this.fb.nonNullable.group({
    name: '',
    email: '',
    phoneNumber: '',
    active: '' as '' | 'true' | 'false',
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const raw = this.filterForm.getRawValue();
    const filter: PassengerFilter = {
      name: raw.name || undefined,
      email: raw.email || undefined,
      phoneNumber: raw.phoneNumber || undefined,
      active: raw.active === '' ? null : raw.active === 'true',
    };
    this.passengersService.search(this.page(), this.size, filter).subscribe({
      next: (result) => {
        this.passengers.set(result.content ?? []);
        this.totalElements.set(result.totalElements);
        this.totalPages.set(Math.max(1, result.totalPages));
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
    this.filterForm.reset({ name: '', email: '', phoneNumber: '', active: '' });
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

  openView(passenger: Passenger): void {
    this.detailPassengerId.set(passenger.passengerId);
    this.detailVisible.set(true);
  }

  askActivate(passenger: Passenger): void {
    this.confirmPassenger.set(passenger);
    this.confirmAction.set('activate');
    this.confirmVisible.set(true);
  }

  askDeactivate(passenger: Passenger): void {
    this.confirmPassenger.set(passenger);
    this.confirmAction.set('deactivate');
    this.confirmVisible.set(true);
  }

  get confirmTitle(): string {
    return this.confirmAction() === 'activate' ? 'Activer le voyageur' : 'Désactiver le voyageur';
  }

  get confirmMessage(): string {
    const p = this.confirmPassenger();
    const label = p?.name || p?.email || `#${p?.passengerId ?? ''}`;
    return this.confirmAction() === 'activate'
      ? `Confirmer l'activation du voyageur « ${label} » ?`
      : `Confirmer la désactivation du voyageur « ${label} » ?`;
  }

  get confirmLabel(): string {
    return this.confirmAction() === 'activate' ? 'Activer' : 'Désactiver';
  }

  get confirmColor(): 'success' | 'warning' {
    return this.confirmAction() === 'activate' ? 'success' : 'warning';
  }

  onConfirm(): void {
    const passenger = this.confirmPassenger();
    if (!passenger) {
      return;
    }

    this.actionBusy.set(true);
    const action = this.confirmAction();
    const done = (message: string) => {
      this.notifications.success(message);
      this.actionBusy.set(false);
      this.confirmVisible.set(false);
      this.confirmPassenger.set(null);
      this.load();
    };
    const fail = () => this.actionBusy.set(false);

    if (action === 'activate') {
      this.passengersService.activate(passenger.passengerId).subscribe({
        next: () => done('Voyageur activé'),
        error: fail,
      });
      return;
    }

    this.passengersService.deactivate(passenger.passengerId).subscribe({
      next: () => done('Voyageur désactivé'),
      error: fail,
    });
  }

  pages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i);
  }
}
