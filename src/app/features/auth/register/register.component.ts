import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h3 class="text-center">Inscription</h3>
            </div>
            <div class="card-body">
              <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
                <div class="mb-3">
                  <label for="firstName" class="form-label">Prénom</label>
                  <input
                    type="text"
                    class="form-control"
                    id="firstName"
                    [(ngModel)]="firstName"
                    name="firstName"
                    required
                    #firstNameCtrl="ngModel"
                  >
                  <div class="text-danger" *ngIf="firstNameCtrl.invalid && firstNameCtrl.touched">
                    Le prénom est requis.
                  </div>
                </div>
                <div class="mb-3">
                  <label for="lastName" class="form-label">Nom</label>
                  <input
                    type="text"
                    class="form-control"
                    id="lastName"
                    [(ngModel)]="lastName"
                    name="lastName"
                    required
                    #lastNameCtrl="ngModel"
                  >
                  <div class="text-danger" *ngIf="lastNameCtrl.invalid && lastNameCtrl.touched">
                    Le nom est requis.
                  </div>
                </div>
                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input
                    type="email"
                    class="form-control"
                    id="email"
                    [(ngModel)]="email"
                    name="email"
                    required
                    pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                    #emailCtrl="ngModel"
                  >
                  <div class="text-danger" *ngIf="emailCtrl.errors?.['required'] && emailCtrl.touched">
                    L'email est requis.
                  </div>
                  <div class="text-danger" *ngIf="emailCtrl.errors?.['pattern'] && emailCtrl.touched">
                    L'email doit être au format complet (ex: nom&#64;domaine.com).
                  </div>
                </div>
                <div class="mb-3">
                  <label for="password" class="form-label">Mot de passe</label>
                  <input
                    type="password"
                    class="form-control"
                    id="password"
                    [(ngModel)]="password"
                    name="password"
                    required
                    minlength="6"
                    pattern="^(?=.*[A-Z]).{6,}$"
                    #passwordCtrl="ngModel"
                  >
                  <div class="text-danger" *ngIf="passwordCtrl.errors?.['required'] && passwordCtrl.touched">
                    Le mot de passe est requis.
                  </div>
                  <div class="text-danger" *ngIf="passwordCtrl.errors?.['minlength'] && passwordCtrl.touched">
                    Le mot de passe doit contenir au moins 6 caractères.
                  </div>
                  <div class="text-danger" *ngIf="passwordCtrl.errors?.['pattern'] && passwordCtrl.touched">
                    Le mot de passe doit contenir au moins une lettre majuscule.
                  </div>
                </div>
                <div class="d-grid">
                  <button type="submit" class="btn btn-primary" [disabled]="registerForm.invalid">S'inscrire</button>
                </div>
              </form>
              <div class="mt-3 text-center">
                <p>Déjà un compte ? <a routerLink="/login">Se connecter</a></p>
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
export class RegisterComponent {
  firstName = '';
  lastName = '';
  email = '';
  password = '';

  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  onSubmit(): void {
    if (this.firstName && this.lastName && this.email && this.password) {
      this.authService.register({
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        password: this.password
      }).subscribe({
        next: () => {
          this.notificationService.showSuccess('Inscription réussie', 'Bienvenue !');
          this.router.navigate(['/login']);
        },
        error: (error: { error: { message: string } }) => {
          this.notificationService.showError('Erreur d\'inscription', error.error?.message || 'Une erreur est survenue');
        }
      });
    }
  }
} 