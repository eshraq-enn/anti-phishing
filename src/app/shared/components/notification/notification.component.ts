import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';

interface Notification {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
      <div *ngIf="notification" 
           class="toast show" 
           role="alert" 
           aria-live="assertive" 
           aria-atomic="true"
           [class.bg-success]="notification.type === 'success'"
           [class.bg-danger]="notification.type === 'error'"
           [class.bg-warning]="notification.type === 'warning'"
           [class.bg-info]="notification.type === 'info'">
        <div class="toast-header">
          <strong class="me-auto">{{ notification.title }}</strong>
          <button type="button" class="btn-close" (click)="closeNotification()"></button>
        </div>
        <div class="toast-body text-white">
          {{ notification.message }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      z-index: 1050;
    }
    .toast {
      min-width: 300px;
    }
  `]
})
export class NotificationComponent implements OnInit {
  notification: Notification | null = null;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.notificationService.notification$.subscribe(notification => {
      this.notification = notification;
      if (notification) {
        setTimeout(() => this.closeNotification(), 5000);
      }
    });
  }

  closeNotification() {
    this.notification = null;
  }
} 