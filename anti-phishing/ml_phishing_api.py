import joblib
from flask import Flask, request, jsonify
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
import os

app = Flask(__name__)

MODEL_PATH = 'phishing_model_simple.pkl'

# Entraînement et sauvegarde du modèle si besoin
if not os.path.exists(MODEL_PATH):
    X = [
        'Votre compte a été limité. Veuillez vérifier votre identité maintenant',
        'Cliquez ici pour vérifier votre compte. Urgent !',
        'Vous avez gagné un prix de 1000€ !',
        'Bonjour, voici le rapport demandé pour le projet',
        'Réunion demain à 10h concernant le budget',
        'Merci pour votre retour sur la présentation',
        'Vérification de sécurité requise - Action immédiate nécessaire',
        'Mise à jour de votre mot de passe - Sécurité compromise',
        'Nouvelle offre exclusive - Ne manquez pas cette chance !',
        "Rappel de réunion - Aujourd'hui à 14h",
    ]
    y = [1, 1, 1, 0, 0, 0, 1, 1, 1, 0]  # 1 = phishing, 0 = legit
    
    pipeline = make_pipeline(
        TfidfVectorizer(),
        MultinomialNB()
    )
    pipeline.fit(X, y)
    joblib.dump(pipeline, MODEL_PATH)

# Chargement du modèle
pipeline = joblib.load(MODEL_PATH)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        subject = data.get('subject', '').strip()
        content = data.get('content', '').strip()
        text = f"{subject} {content}"
        
        if not text:
            return jsonify({'error': 'Empty text'}), 400
            
        X = [text]
        proba = pipeline.predict_proba(X)[0][1]
        result = {
            'isPhishing': bool(proba > 0.5),
            'confidence': float(round(proba, 4)),
            'details': {
                'probability': float(proba)
            }
        }
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5005, debug=True)