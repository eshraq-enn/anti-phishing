import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home-container text-center mt-5">
      <img src="assets/logo _anti-phishing_  sur le phishing.jpg" alt="Logo Anti-Phishing" class="home-logo mb-4">
      <h1 class="mb-3">Bienvenue sur Anti-Phishing</h1>
      <p class="lead mb-4">
        Protégez-vous contre les emails frauduleux grâce à notre plateforme complète&nbsp;:
      </p>
      <div class="row justify-content-center mb-4">
        <div class="col-md-3 mb-3">
          <div class="card h-100 shadow-sm">
            <div class="card-body">
              <h5 class="card-title">Analyse d'Email</h5>
              <p class="card-text">Analysez le contenu ou les fichiers d'email pour détecter les tentatives de phishing.</p>
              <a routerLink="/analyze" class="btn btn-primary">Analyser un email</a>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="card h-100 shadow-sm">
            <div class="card-body">
              <h5 class="card-title">Rapports</h5>
              <p class="card-text">Consultez l'historique de vos analyses et exportez les résultats.</p>
              <a routerLink="/reports" class="btn btn-info">Voir les rapports</a>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="card h-100 shadow-sm">
            <div class="card-body">
              <h5 class="card-title">Quiz Anti-Phishing</h5>
              <p class="card-text">Testez vos connaissances et formez-vous à la détection du phishing.</p>
              <a routerLink="/training" class="btn btn-success">Lancer le quiz</a>
            </div>
          </div>
        </div>
      </div>
      <footer class="mt-5 text-muted small">Notre projet universitaire</footer>
    </div>
  `,
  styles: [`
    .home-logo {
      width: 120px;
      height: 120px;
      object-fit: cover;
      border-radius: 50%;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      border: 4px solid #0d6efd;
      background: #fff;
    }
    .home-container {
      max-width: 900px;
      margin: auto;
    }
    .card {
      border-radius: 1rem;
      transition: transform 0.2s;
    }
    .card:hover {
      transform: translateY(-5px) scale(1.03);
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    }
    .btn {
      border-radius: 2rem;
    }
  `]
})
export class HomeComponent {} 