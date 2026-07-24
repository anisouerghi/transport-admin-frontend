import { Component, OnInit, signal, inject } from '@angular/core';
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
import { navItems } from './_nav';

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

  readonly rtl = environment.rtl;
  readonly brandFull = 'transport signalement admin';
  readonly brandShort = 'TSA';
  readonly loadingLabel = 'Chargement…';
  public navItems = [...navItems];
  readonly routeLoading = signal(false);

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
