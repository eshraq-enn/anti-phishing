import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../core/services/notification.service';

interface Question {
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

@Component({
  selector: 'app-training',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.scss']
})
export class TrainingComponent implements OnInit {
  questions: Question[] = [
    {
      text: 'Qu\'est-ce que le phishing ?',
      options: [
        'Une technique de pêche',
        'Une tentative de vol d\'informations personnelles',
        'Un type de virus informatique',
        'Une méthode de cryptage'
      ],
      correctAnswer: 1,
      explanation: 'Le phishing est une technique de fraude en ligne qui consiste à se faire passer pour une entité de confiance pour obtenir des informations personnelles.'
    },
    {
      text: 'Quel est le signe le plus évident d\'un email de phishing ?',
      options: [
        'L\'adresse email de l\'expéditeur',
        'La présence d\'un logo',
        'La longueur du message',
        'La couleur du texte'
      ],
      correctAnswer: 0,
      explanation: 'L\'adresse email de l\'expéditeur est souvent le premier indice. Les fraudeurs utilisent des adresses qui ressemblent à celles d\'entreprises légitimes mais qui contiennent des différences subtiles.'
    },
    {
      text: 'Que devez-vous faire si vous recevez un email suspect ?',
      options: [
        'Cliquer sur tous les liens pour vérifier',
        'Répondre immédiatement',
        'Supprimer l\'email sans l\'ouvrir',
        'Transférer l\'email à tous vos contacts'
      ],
      correctAnswer: 2,
      explanation: 'La meilleure action est de supprimer l\'email suspect sans l\'ouvrir. Si vous l\'avez déjà ouvert, ne cliquez sur aucun lien et ne téléchargez aucune pièce jointe.'
    },
    {
      text: "Vrai ou faux : Un email provenant de votre banque vous demandant de confirmer vos informations personnelles est toujours légitime.",
      options: [
        "Vrai",
        "Faux"
      ],
      correctAnswer: 1,
      explanation: "Les banques ne demandent jamais de confirmer vos informations personnelles par email. C'est un signe classique de phishing."
    },
    {
      text: "Quel comportement est le plus sûr face à une pièce jointe inattendue ?",
      options: [
        "L'ouvrir pour vérifier son contenu",
        "La transférer à un collègue",
        "La supprimer ou demander confirmation à l'expéditeur",
        "L'enregistrer sur le bureau"
      ],
      correctAnswer: 2,
      explanation: "Il ne faut jamais ouvrir une pièce jointe inattendue. Demandez confirmation à l'expéditeur ou supprimez-la."
    },
    {
      text: "Analysez cet email : 'Votre compte sera suspendu si vous ne cliquez pas sur ce lien immédiatement.' Que devez-vous faire ?",
      options: [
        "Cliquer sur le lien pour éviter la suspension",
        "Ignorer l'email et contacter l'entreprise via un canal officiel",
        "Répondre à l'email pour demander plus d'informations",
        "Transférer l'email à vos contacts pour les prévenir"
      ],
      correctAnswer: 1,
      explanation: "Il ne faut jamais cliquer sur un lien dans un email suspect. Contactez l'entreprise via un canal officiel pour vérifier la demande."
    }
  ];

  currentQuestionIndex = 0;
  selectedAnswer: number | null = null;
  showExplanation = false;
  quizCompleted = false;
  score = 0;
  progress = 0;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.updateProgress();
  }

  get currentQuestion(): Question {
    return this.questions[this.currentQuestionIndex];
  }

  selectAnswer(index: number): void {
    if (!this.showExplanation) {
      this.selectedAnswer = index;
    }
  }

  checkAnswer(): void {
    if (this.selectedAnswer === null) {
      this.notificationService.showWarning('Attention', 'Veuillez sélectionner une réponse');
      return;
    }

    this.showExplanation = true;
    if (this.selectedAnswer === this.currentQuestion.correctAnswer) {
      this.score++;
      this.notificationService.showSuccess('Bonne réponse', 'Félicitations !');
    } else {
      this.notificationService.showError('Mauvaise réponse', 'Réfléchissez à l\'explication.');
    }
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.selectedAnswer = null;
      this.showExplanation = false;
      this.updateProgress();
    } else {
      this.quizCompleted = true;
      this.notificationService.showSuccess('Quiz terminé', `Votre score : ${this.score}/${this.questions.length}`);
    }
  }

  restartQuiz(): void {
    this.currentQuestionIndex = 0;
    this.selectedAnswer = null;
    this.showExplanation = false;
    this.quizCompleted = false;
    this.score = 0;
    this.updateProgress();
  }

  private updateProgress(): void {
    this.progress = ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
  }
} 