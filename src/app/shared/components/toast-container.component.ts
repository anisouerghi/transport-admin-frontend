import { Component, inject } from '@angular/core';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="toast-stack" aria-live="polite" aria-atomic="true">
      @for (n of notifications.items(); track n.id) {
        <div
          class="toast-item"
          [class.toast-success]="n.tone === 'success'"
          [class.toast-error]="n.tone === 'error'"
          [class.toast-info]="n.tone === 'info'"
          role="alert"
        >
          <span>{{ n.message }}</span>
          <button type="button" class="btn-close btn-close-white btn-sm" (click)="notifications.dismiss(n.id)"></button>
        </div>
      }
    </div>
  `,
  styles: `
    .toast-stack {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 1080;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-width: 360px;
    }
    .toast-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 0.375rem;
      color: #fff;
      box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.15);
      font-size: 0.9rem;
    }
    .toast-success { background: #198754; }
    .toast-error { background: #dc3545; }
    .toast-info { background: #0d6efd; }
  `,
})
export class ToastContainerComponent {
  readonly notifications = inject(NotificationService);
}
