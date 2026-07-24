import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
} from '@coreui/angular';
import { Config } from '../../helpers/config';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CardComponent, CardHeaderComponent, CardBodyComponent, ButtonDirective, RouterLink],
  template: `
    <c-card class="mb-4">
      <c-card-header><strong>Dashboard</strong></c-card-header>
      <c-card-body>
        <p class="mb-1"><strong>{{ title }}</strong> — version {{ version }}</p>
        <p class="mb-3 text-body-secondary">Admin console for transport incident reporting.</p>
        <a cButton color="primary" routerLink="/users">Manage users</a>
      </c-card-body>
    </c-card>
  `,
})
export class DashboardPage {
  readonly title = Config.APP_TITLE;
  readonly version = Config.APP_VERSION;
}
