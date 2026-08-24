import { Directive, Input, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Affiche le contenu uniquement si l'utilisateur possède la permission.
 * Usage : *appHasPermission="'REPORT_REPLY'"
 */
@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
export class HasPermissionDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly auth = inject(AuthService);

  private permission = '';

  constructor() {
    effect(() => {
      // re-évalue quand la session change
      this.auth.permissions();
      this.render();
    });
  }

  @Input()
  set appHasPermission(code: string) {
    this.permission = code;
    this.render();
  }

  private render(): void {
    this.viewContainer.clear();
    if (this.permission && this.auth.hasPermission(this.permission)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}
