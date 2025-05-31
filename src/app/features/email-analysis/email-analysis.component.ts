import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { NotificationService } from '../../core/services/notification.service';

// Add explicit component/directive imports
import { NgIf } from '@angular/common';
import { NgModel } from '@angular/forms';

interface AnalysisResult {
  isPhishing: boolean;
  confidence: number;
  riskScore: number;
  links: Array<{
    url: string;
    isSuspicious: boolean;
  }>;
  analysisDetails: string;
}

@Component({
  selector: 'app-email-analysis',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './email-analysis.component.html',
  styleUrl: './email-analysis.component.scss'
})
export class EmailAnalysisComponent implements OnInit {
  analysisForm: FormGroup;
  isAnalyzing: boolean = false;
  analysisResult: AnalysisResult | null = null;
  reasons: string[] = [];
  displayedTips: string[] = [];
  tips: string[] = [
    'Vérifiez toujours l\'adresse email de l\'expéditeur',
    'Ne cliquez jamais sur des liens suspects',
    'Méfiez-vous des emails demandant des informations personnelles',
    'Vérifiez les fautes d\'orthographe et la grammaire',
    'Ne répondez pas aux emails non sollicités',
    'Utilisez l\'authentification à deux facteurs',
    'Gardez vos logiciels à jour',
    'Vérifiez les URLs avant de cliquer',
    'Ne téléchargez pas de pièces jointes inattendues',
    'Utilisez un mot de passe fort et unique'
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private notificationService: NotificationService
  ) {
    this.analysisForm = this.fb.group({
      subject: ['', Validators.required],
      content: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.displayedTips = this.shuffleTips(this.tips).slice(0, 3);
  }

  shuffleTips(array: string[]): string[] {
    return array
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        this.analysisForm.patchValue({ content });
      };
      reader.readAsText(file);
    }
  }

  analyzeEmail(): void {
    if (this.analysisForm.invalid) {
      this.notificationService.showError('Erreur', 'Veuillez remplir tous les champs requis');
      return;
    }

    this.isAnalyzing = true;
    const { subject, content } = this.analysisForm.value;

    this.http.post<AnalysisResult>(`${environment.apiUrl}/api/email-analysis/analyze`, { subject, content })
      .subscribe({
        next: (result) => {
          this.analysisResult = result;
          this.reasons = this.generateReasons(result);
          this.notificationService.showSuccess('Succès', 'Analyse terminée avec succès');
        },
        error: (error) => {
          this.notificationService.showError('Erreur', 'Erreur lors de l\'analyse de l\'email');
          console.error('Erreur d\'analyse:', error);
        },
        complete: () => {
          this.isAnalyzing = false;
        }
      });
  }

  resetForm(): void {
    this.analysisForm.reset();
    this.analysisResult = null;
    this.reasons = [];
  }

  generateReasons(result: AnalysisResult): string[] {
    const reasons: string[] = [];
    
    if (result.isPhishing) {
      if (result.riskScore >= 75) {
        reasons.push('Score de risque élevé indiquant un email potentiellement dangereux');
      }
      if (result.links?.some(link => link.isSuspicious)) {
        reasons.push('Liens suspects détectés dans l\'email');
      }
      if (result.confidence > 0.8) {
        reasons.push('Fort niveau de confiance dans la détection de phishing');
      }
    } else {
      if (result.riskScore < 30) {
        reasons.push('Score de risque faible indiquant un email probablement sécurisé');
      }
      if (!result.links?.some(link => link.isSuspicious)) {
        reasons.push('Aucun lien suspect détecté');
      }
    }

    return reasons;
  }

  exportToPdf(): void {
    // TODO: Implémenter l'export PDF
    this.notificationService.showInfo('Info', 'Fonctionnalité d\'export PDF à venir');
  }

  exportToCsv(): void {
    // TODO: Implémenter l'export CSV
    this.notificationService.showInfo('Info', 'Fonctionnalité d\'export CSV à venir');
  }
}