import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h3 class="text-center">Connexion</h3>
            </div>
            <div class="card-body">
              <form (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input
                    type="email"
                    class="form-control"
                    id="email"
                    [(ngModel)]="credentials.email"
                    name="email"
                    required
                  >
                </div>
                <div class="mb-3">
                  <label for="password" class="form-label">Mot de passe</label>
                  <input
                    type="password"
                    class="form-control"
                    id="password"
                    [(ngModel)]="credentials.password"
                    name="password"
                    required
                  >
                </div>
                <div class="d-grid">
                  <button type="submit" class="btn btn-primary">Se connecter</button>
                </div>
              </form>
              <div class="mt-3 text-center">
                <p>Pas encore de compte ? <a routerLink="/register">S'inscrire</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
  `]
})
export class LoginComponent {
  credentials = {
    email: '',
    password: ''
  };

  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  onSubmit() {
    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.notificationService.showSuccess('Connexion réussie', 'Bienvenue !');
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.notificationService.showError('Erreur de connexion', error.error.message || 'Une erreur est survenue');
      }
    });
  }
} 