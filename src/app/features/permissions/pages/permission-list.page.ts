import { Component, OnInit, inject, signal } from '@angular/core';
import {
  BadgeComponent,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  SpinnerComponent,
  TableDirective,
} from '@coreui/angular';
import { Permission } from '../../roles/models/role.model';
import { RolesService } from '../../roles/services/roles.service';

@Component({
  selector: 'app-permission-list-page',
  standalone: true,
  imports: [CardComponent, CardHeaderComponent, CardBodyComponent, TableDirective, SpinnerComponent, BadgeComponent],
  templateUrl: './permission-list.page.html',
})
export class PermissionListPage implements OnInit {
  private readonly service = inject(RolesService);
  readonly loading = signal(false);
  readonly items = signal<Permission[]>([]);

  ngOnInit(): void {
    this.loading.set(true);
    this.service.getPermissions().subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
