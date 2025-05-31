import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmailAnalysisService } from '../../core/services/email-analysis.service';

@Component({
  selector: 'app-analyze',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-5">
      <h2>Analyse d'Email</h2>
      <form (ngSubmit)="analyzeText()" class="mb-4">
        <div class="mb-3">
          <label for="content" class="form-label">Contenu de l'email</label>
          <textarea id="content" class="form-control" [(ngModel)]="emailContent" name="content" rows="5"></textarea>
        </div>
        <button type="submit" class="btn btn-primary">Analyser le texte</button>
      </form>

      <form (ngSubmit)="analyzeFile()" enctype="multipart/form-data">
        <div class="mb-3">
          <label for="file" class="form-label">Ou importer un fichier email (.eml, .txt...)</label>
          <input type="file" id="file" (change)="onFileSelected($event)" class="form-control" />
        </div>
        <button type="submit" class="btn btn-secondary" [disabled]="!selectedFile">Analyser le fichier</button>
      </form>

      <div *ngIf="result" class="mt-4 alert" [ngClass]="result.isPhishing ? 'alert-danger' : 'alert-success'">
        <h4>Rapport d'analyse</h4>
        <p><strong>Score de risque :</strong> {{ result.riskScore | number:'1.2-2' }}</p>
        <p><strong>Phishing détecté :</strong> <span [ngClass]="result.isPhishing ? 'text-danger' : 'text-success'">{{ result.isPhishing ? 'Oui' : 'Non' }}</span></p>
        <p><strong>Sujet :</strong> {{ result.subject }}</p>
        <p><strong>Adresses email détectées :</strong></p>
        <ul>
          <li *ngFor="let email of result.emails">{{ email }}</li>
        </ul>
        <p><strong>Liens détectés :</strong></p>
        <ul>
          <li *ngFor="let link of result.links">
            <span>{{ link.url || link }}</span>
            <span class="badge ms-2" [ngClass]="link.isSuspicious ? 'bg-danger' : 'bg-success'">
              {{ link.isSuspicious ? 'Suspect' : 'Sûr' }}
            </span>
          </li>
        </ul>
        <div *ngIf="iaPrediction" class="mb-3">
          <span class="fw-bold">Prédiction IA :</span>
          <span class="badge" [ngClass]="iaPrediction.isPhishing ? 'bg-danger' : 'bg-success'">
            {{ iaPrediction.isPhishing ? 'Phishing' : 'Sûr' }}
          </span>
          <span class="ms-2">(confiance : {{ iaPrediction.confidence | number:'1.2-2' }})</span>
        </div>
        <pre class="bg-light p-2">{{ analysisDetailsWithoutIa }}</pre>
        <div class="mt-3 d-flex gap-2">
          <button class="btn btn-outline-primary" (click)="exportPdf()">Exporter en PDF</button>
          <button class="btn btn-outline-secondary" (click)="exportCsv()">Exporter en CSV</button>
        </div>
      </div>
    </div>
  `
})
export class AnalyzeComponent {
  emailContent = '';
  selectedFile: File | null = null;
  result: any = null;
  iaPrediction: { isPhishing: boolean, confidence: number } | null = null;
  analysisDetailsWithoutIa = '';

  constructor(private emailAnalysisService: EmailAnalysisService) {}

  analyzeText() {
    if (!this.emailContent.trim()) return;
    this.emailAnalysisService.analyzeEmail({
      content: this.emailContent,
      subject: 'Analyse via formulaire'
    }).subscribe({
      next: res => this.handleResult(res),
      error: err => this.result = { erreur: err.error || err.message }
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  analyzeFile() {
    if (!this.selectedFile) return;
    this.emailAnalysisService.analyzeEmailFile(this.selectedFile)
      .subscribe({
        next: res => this.handleResult(res),
        error: err => this.result = { erreur: err.error || err.message }
      });
  }

  handleResult(res: any) {
    this.result = res;
    this.iaPrediction = null;
    this.analysisDetailsWithoutIa = res.analysisDetails;
    if (res.analysisDetails) {
      const iaMatch = res.analysisDetails.match(/\[IA\] Prédiction IA : (Phishing|Sûr) \(confiance : ([0-9.]+)\)/);
      if (iaMatch) {
        this.iaPrediction = {
          isPhishing: iaMatch[1] === 'Phishing',
          confidence: parseFloat(iaMatch[2])
        };
        this.analysisDetailsWithoutIa = res.analysisDetails.replace(/\[IA\] Prédiction IA : (Phishing|Sûr) \(confiance : [0-9.]+\)/, '').trim();
      }
    }
  }

  exportPdf() {
    if (!this.result || !this.result.id) return;
    this.emailAnalysisService.exportToPdfById(this.result.id).subscribe({
      next: blob => this.downloadFile(blob, 'rapport-analyse.pdf'),
      error: () => alert('Erreur lors de l\'export PDF')
    });
  }

  exportCsv() {
    if (!this.result || !this.result.id) return;
    this.emailAnalysisService.exportToCsvById(this.result.id).subscribe({
      next: blob => this.downloadFile(blob, 'rapport-analyse.csv'),
      error: () => alert('Erreur lors de l\'export CSV')
    });
  }

  private downloadFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
} 