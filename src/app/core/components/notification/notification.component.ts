import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="notificationService.notification$ | async as notification" 
         class="notification"
         [ngClass]="notification.type">
      <div class="notification-content">
        <h4>{{ notification.title }}</h4>
        <p>{{ notification.message }}</p>
      </div>
    </div>
  `,
  styles: [`
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px;
      border-radius: 4px;
      z-index: 1000;
      min-width: 300px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }

    .notification-content {
      color: white;
    }

    .notification h4 {
      margin: 0 0 5px 0;
    }

    .notification p {
      margin: 0;
    }

    .success {
      background-color: #28a745;
    }

    .error {
      background-color: #dc3545;
    }

    .info {
      background-color: #17a2b8;
    }

    .warning {
      background-color: #ffc107;
      color: #000;
    }
  `]
})
export class NotificationComponent {
  notificationService = inject(NotificationService);
} 