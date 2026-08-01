import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import {
  BadgeComponent,
  ButtonCloseDirective,
  ButtonDirective,
  ModalBodyComponent,
  ModalComponent,
  ModalFooterComponent,
  ModalHeaderComponent,
  ModalTitleDirective,
  SpinnerComponent,
} from '@coreui/angular';
import { PassengersService } from '../services/passengers.service';
import { Passenger } from '../models/passenger.model';

/** Modal de consultation détaillée d'un voyageur. */
@Component({
  selector: 'app-passenger-detail-modal',
  standalone: true,
  imports: [
    ModalComponent,
    ModalHeaderComponent,
    ModalTitleDirective,
    ModalBodyComponent,
    ModalFooterComponent,
    ButtonCloseDirective,
    ButtonDirective,
    SpinnerComponent,
    BadgeComponent,
  ],
  templateUrl: './passenger-detail-modal.component.html',
})
export class PassengerDetailModalComponent implements OnChanges {
  private readonly service = inject(PassengersService);

  @Input() visible = false;
  @Input() passengerId: number | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();

  readonly loading = signal(false);
  readonly item = signal<Passenger | null>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && !this.visible) {
      this.item.set(null);
    }
    if (this.visible && this.passengerId != null) {
      this.load(this.passengerId);
    }
  }

  close(): void {
    this.visibleChange.emit(false);
  }

  private load(id: number): void {
    this.loading.set(true);
    this.service.getById(id).subscribe({
      next: (passenger) => {
        this.item.set(passenger);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
