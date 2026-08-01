import { Component, OnInit, computed, inject, signal } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { environment } from '../../../environments/environment';
import { NgScrollbar } from 'ngx-scrollbar';
import { ToastContainerComponent } from '../../shared/components/toast-container.component';
import { AuthService } from '../../core/services/auth.service';
import { INavData } from '@coreui/angular';

import {
  ContainerComponent,
  ShadowOnScrollDirective,
  SidebarBrandComponent,
  SidebarComponent,
  SidebarFooterComponent,
  SidebarHeaderComponent,
  SidebarNavComponent,
  SidebarToggleDirective,
  SidebarTogglerDirective,
} from '@coreui/angular';

import { DefaultFooterComponent, DefaultHeaderComponent } from './';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss'],
  imports: [
    SidebarComponent,
    SidebarHeaderComponent,
    SidebarBrandComponent,
    SidebarNavComponent,
    SidebarFooterComponent,
    SidebarToggleDirective,
    SidebarTogglerDirective,
    ContainerComponent,
    DefaultFooterComponent,
    DefaultHeaderComponent,
    NgScrollbar,
    RouterOutlet,
    RouterLink,
    ShadowOnScrollDirective,
    ToastContainerComponent,
  ],
})
export class DefaultLayoutComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly rtl = environment.rtl;
  readonly brandFull = 'transport signalement admin';
  readonly brandShort = 'TSA';
  readonly loadingLabel = 'Chargement…';
  readonly routeLoading = signal(false);

  /** Menu dynamique construit depuis les menus renvoyés au login. */
  readonly navItems = computed<INavData[]>(() => {
    const menus = this.auth.menus();
    if (!menus.length) {
      return [{ name: 'Dashboard', url: '/dashboard', iconComponent: { name: 'cilSpeedometer' } }];
    }
    return [
      { title: true, name: 'Administration' },
      ...menus.map((m) => ({
        name: m.label,
        url: m.url,
        iconComponent: { name: m.icon || 'cilList' },
      })),
    ];
  });

  ngOnInit(): void {
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationStart) {
        this.routeLoading.set(true);
      }
      if (
        e instanceof NavigationEnd ||
        e instanceof NavigationCancel ||
        e instanceof NavigationError
      ) {
        this.routeLoading.set(false);
      }
    });
  }
}
