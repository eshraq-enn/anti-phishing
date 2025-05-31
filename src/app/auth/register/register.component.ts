import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h3 class="text-center">Inscription</h3>
            </div>
            <div class="card-body">
              <form (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label for="firstName" class="form-label">Prénom</label>
                  <input
                    type="text"
                    class="form-control"
                    id="firstName"
                    [(ngModel)]="user.firstName"
                    name="firstName"
                    required
                  >
                </div>
                <div class="mb-3">
                  <label for="lastName" class="form-label">Nom</label>
                  <input
                    type="text"
                    class="form-control"
                    id="lastName"
                    [(ngModel)]="user.lastName"
                    name="lastName"
                    required
                  >
                </div>
                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input
                    type="email"
                    class="form-control"
                    id="email"
                    [(ngModel)]="user.email"
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
                    [(ngModel)]="user.password"
                    name="password"
                    required
                  >
                </div>
                <div class="d-grid">
                  <button type="submit" class="btn btn-primary">S'inscrire</button>
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
  user = {
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.authService.register(this.user).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Erreur d\'inscription:', error);
        // TODO: Afficher un message d'erreur à l'utilisateur
      }
    });
  }
} 