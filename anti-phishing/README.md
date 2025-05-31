# Détection d'emails frauduleux et tentatives de phishing

Une application web complète pour la détection et l'analyse des emails frauduleux et tentatives de phishing.

## Fonctionnalités

- Analyse d'emails en temps réel
- Détection de liens suspects
- Analyse du contenu et des en-têtes
- Vérification des fichiers joints
- Génération de rapports d'analyse
- Interface utilisateur moderne et intuitive
- API REST sécurisée
- Stockage des résultats d'analyse

## Prérequis

- Java 17 ou supérieur
- Maven
- MySQL 8.0 ou supérieur
- Node.js 14 ou supérieur (pour le frontend Angular)

## Installation

### Backend (Spring Boot)

1. Clonez le repository :
```bash
git clone [URL_DU_REPO]
cd anti-phishing
```

2. Configurez la base de données MySQL :
- Créez une base de données nommée `anti_phishing`
- Modifiez les paramètres de connexion dans `src/main/resources/application.properties` si nécessaire

3. Compilez et exécutez le backend :
```bash
mvn clean install
mvn spring-boot:run
```

Le serveur backend démarrera sur `http://localhost:8080`

### Frontend (Angular)

1. Naviguez vers le dossier frontend :
```bash
cd frontend
```

2. Installez les dépendances :
```bash
npm install
```

3. Démarrez le serveur de développement :
```bash
ng serve
```

L'application frontend sera accessible sur `http://localhost:4200`

## Utilisation

1. Accédez à l'application via votre navigateur à l'adresse `http://localhost:4200`
2. Créez un compte ou connectez-vous
3. Utilisez l'interface pour :
   - Soumettre des emails à analyser
   - Consulter l'historique des analyses
   - Générer des rapports
   - Gérer vos paramètres

## API Endpoints

### Analyse d'emails
- `POST /api/email-analysis/analyze` : Analyser un email en texte
- `POST /api/email-analysis/analyze-file` : Analyser un fichier email
- `GET /api/email-analysis/history` : Consulter l'historique des analyses
- `GET /api/email-analysis/{id}` : Obtenir les détails d'une analyse

## Sécurité

- Authentification JWT
- Protection contre les injections SQL
- Validation des entrées
- Chiffrement des données sensibles
- Protection CORS configurée

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails. 