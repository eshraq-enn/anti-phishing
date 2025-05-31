import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface EmailAnalysis {
  id: number;
  subject: string;
  content: string;
  isPhishing: boolean;
  riskScore: number;
  reasons: string[];
  createdAt: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-4">
      <h2>Historique des analyses</h2>
      <div class="table-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Date</th>
              <th>Sujet</th>
              <th>Risque</th>
              <th>Score</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let analysis of analyses">
              <td>{{ analysis.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
              <td>{{ analysis.subject }}</td>
              <td>
                <span [class]="analysis.isPhishing ? 'text-danger' : 'text-success'">
                  {{ analysis.isPhishing ? 'Phishing' : 'Sûr' }}
                </span>
              </td>
              <td>{{ analysis.riskScore }}%</td>
              <td>
                <button class="btn btn-sm btn-info" (click)="showDetails(analysis)">
                  Détails
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal pour les détails -->
      <div class="modal fade" id="detailsModal" tabindex="-1" #detailsModal>
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Détails de l'analyse</h5>
              <button type="button" class="btn-close" (click)="closeDetails()"></button>
            </div>
            <div class="modal-body" *ngIf="selectedAnalysis">
              <h6>Sujet</h6>
              <p>{{ selectedAnalysis.subject }}</p>
              <h6>Contenu</h6>
              <p>{{ selectedAnalysis.content }}</p>
              <h6>Résultat</h6>
              <p [class]="selectedAnalysis.isPhishing ? 'text-danger' : 'text-success'">
                {{ selectedAnalysis.isPhishing ? 'Email suspect de phishing' : 'Email sûr' }}
              </p>
              <h6>Score de risque</h6>
              <div class="progress">
                <div class="progress-bar" 
                     [class.bg-danger]="selectedAnalysis.riskScore > 70"
                     [class.bg-warning]="selectedAnalysis.riskScore > 30 && selectedAnalysis.riskScore <= 70"
                     [class.bg-success]="selectedAnalysis.riskScore <= 30"
                     [style.width.%]="selectedAnalysis.riskScore">
                  {{ selectedAnalysis.riskScore }}%
                </div>
              </div>
              <h6 class="mt-3">Raisons</h6>
              <ul>
                <li *ngFor="let reason of selectedAnalysis.reasons">{{ reason }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .progress {
      height: 25px;
    }
    .progress-bar {
      line-height: 25px;
    }
  `]
})
export class ReportsComponent implements OnInit {
  analyses: EmailAnalysis[] = [];
  selectedAnalysis: EmailAnalysis | null = null;
  @ViewChild('detailsModal') detailsModal!: ElementRef;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadAnalyses();
  }

  loadAnalyses() {
    this.http.get<EmailAnalysis[]>(`${environment.apiUrl}/api/email-analysis/history`)
      .subscribe({
        next: (data) => {
          this.analyses = data;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des analyses:', error);
          // TODO: Afficher un message d'erreur à l'utilisateur
        }
      });
  }

  extractReasons(details: string, riskScore: number, isPhishing: boolean): string[] {
    const reasons: string[] = [];
    if (!details) return reasons;
    if (/urgence|urgent|immédiatement|immediate/i.test(details)) reasons.push('Présence d’indicateurs d’urgence');
    if (/mot[- ]?clé suspect|suspicious keyword|mot suspect|phishing/i.test(details)) reasons.push('Contient des mots-clés suspects');
    if (/lien suspect|suspicious link|http.*suspicious/i.test(details)) reasons.push('Lien suspect détecté');
    if (/classification.*phishing|phishing probable|prédiction ia.*phishing/i.test(details)) reasons.push('Classification IA : Phishing probable');
    if (reasons.length === 0 && (riskScore >= 75 || isPhishing)) {
      reasons.push("Score de risque élevé détecté par l’IA.");
    }
    return reasons;
  }

  showDetails(analysis: EmailAnalysis) {
    const details = (analysis as any).analysisDetails || '';
    const reasons = this.extractReasons(details, analysis.riskScore, analysis.isPhishing);
    this.selectedAnalysis = { ...analysis, reasons };
    setTimeout(() => {
      const modal = new (window as any).bootstrap.Modal(this.detailsModal.nativeElement);
      modal.show();
    });
  }

  closeDetails() {
    if (this.detailsModal) {
      const modal = new (window as any).bootstrap.Modal(this.detailsModal.nativeElement);
      modal.hide();
    }
    this.selectedAnalysis = null;
  }
} 