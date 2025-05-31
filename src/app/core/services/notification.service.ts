import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<Notification | null>(null);
  notification$ = this.notificationSubject.asObservable();

  showSuccess(title: string, message: string): void {
    this.showNotification({ type: 'success', title, message });
  }

  showError(title: string, message: string): void {
    this.showNotification({ type: 'error', title, message });
  }

  showInfo(title: string, message: string): void {
    this.showNotification({ type: 'info', title, message });
  }

  showWarning(title: string, message: string): void {
    this.showNotification({ type: 'warning', title, message });
  }

  private showNotification(notification: Notification): void {
    this.notificationSubject.next(notification);
    setTimeout(() => {
      this.clearNotification();
    }, 5000);
  }

  clearNotification(): void {
    this.notificationSubject.next(null);
  }
} 