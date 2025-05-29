from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import traceback

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load your pre-trained model and scaler once at startup
try:
    model = joblib.load('model/classifier.pkl')
    scaler = joblib.load('model/scaler.pkl')
    print("Model and scaler loaded successfully.")
except Exception as e:
    print(f"Error loading model/scaler: {e}")
    model = None
    scaler = None

disorders = ['Depression', 'Anxiety', 'PTSD', 'Bipolar', 'OCD', 'ADHD', 'Schizophrenia', 'Eating Disorder', 'Substance Use', 'BPD']

@app.route('/predict', methods=['POST'])
def predict():
    if model is None or scaler is None:
        return jsonify({"error": "Model or scaler not loaded"}), 500

    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON data received"}), 400

    try:
        # Extract questionnaire answers q1 to q10
        answers = []
        for i in range(1, 11):
            key = f"q{i}"
            if key not in data:
                return jsonify({"error": f"Missing answer for {key}"}), 400
            answers.append(float(data[key]))

        # Map questionnaire answers to model features
        # You need to adjust these mappings according to your domain knowledge
        # For example:
        age = data.get("age", 30)  # optionally passed from frontend or default
        gender = data.get("gender", 1)  # 0=female, 1=male, default 1

        sleep_hours = max(0, 8 - answers[2])  # q3 trouble sleeping
        physical_activity_days = data.get("physical_activity_days", 3)  # default 3
        stress_score = (answers[0] + answers[1]) / 2  # q1 & q2 related to stress/depression
        anxiety_score = (answers[7] + answers[8]) / 2  # q8 & q9 anxiety related
        depression_score = (answers[0] + answers[1]) / 2  # q1 & q2 depression related
        impulsivity_score = answers[9]  # q10 impulsivity proxy
        hallucinations_score = 0  # no data, assume 0
        mood_swings_score = answers[3]  # q4 tired = mood swings proxy
        eating_habits_score = 0  # no data
        substance_use_score = 0  # no data
        trauma_experience_score = 0  # no data
        adhd_score = 0  # no data

        features = [
            age, gender, sleep_hours, physical_activity_days, stress_score,
            anxiety_score, depression_score, impulsivity_score,
            hallucinations_score, mood_swings_score, eating_habits_score,
            substance_use_score, trauma_experience_score, adhd_score
        ]

        X = np.array(features).reshape(1, -1)

        # Pad if scaler expects more features
        if X.shape[1] < scaler.n_features_in_:
            pad_len = scaler.n_features_in_ - X.shape[1]
            X = np.hstack([X, np.zeros((1, pad_len))])

        # Scale features
        X_scaled = scaler.transform(X)

        # Predict probabilities (adjust if your model uses predict or predict_proba)
        # If using sklearn classifiers: model.predict_proba
        # If using keras/tf: model.predict returns probabilities directly
        if hasattr(model, "predict_proba"):
            prediction_probs = model.predict_proba(X_scaled)
        else:
            prediction_probs = model.predict(X_scaled)

        # Ensure output shape matches (1, number_of_disorders)
        if prediction_probs.shape[0] != 1 or prediction_probs.shape[1] != len(disorders):
            return jsonify({"error": "Prediction output shape mismatch"}), 500

        probs_dict = {disorder: float(prediction_probs[0][i]) for i, disorder in enumerate(disorders)}

        return jsonify({"probabilities": probs_dict})

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "Prediction failed", "details": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
