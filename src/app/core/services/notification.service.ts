import { Injectable, signal } from '@angular/core';

export type NotificationTone = 'success' | 'error' | 'info';

export interface AppNotification {
  id: number;
  tone: NotificationTone;
  message: string;
}

/** Service léger de notifications UI (toast). */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private seq = 0;
  readonly items = signal<AppNotification[]>([]);

  success(message: string): void {
    this.push('success', message);
  }

  error(message: string): void {
    this.push('error', message);
  }

  info(message: string): void {
    this.push('info', message);
  }

  dismiss(id: number): void {
    this.items.update((list) => list.filter((n) => n.id !== id));
  }

  private push(tone: NotificationTone, message: string): void {
    const id = ++this.seq;
    this.items.update((list) => [...list, { id, tone, message }]);
    window.setTimeout(() => this.dismiss(id), 4500);
  }
}
