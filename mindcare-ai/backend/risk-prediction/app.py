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

# List of disorders that the model predicts probabilities for
disorders = [
    'Depression', 'Anxiety', 'PTSD', 'Bipolar', 'OCD', 
    'ADHD', 'Schizophrenia', 'Eating Disorder', 'Substance Use', 'BPD'
]

@app.route('/predict', methods=['POST'])
def predict():
    if model is None or scaler is None:
        return jsonify({"error": "Model or scaler not loaded"}), 500

    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON data received"}), 400

    try:
        # Validate all required question keys q1 to q42 are present and convert to float
        answers = []
        for i in range(1, 43):
            key = f"q{i}"
            if key not in data:
                return jsonify({"error": f"Missing answer for {key}"}), 400
            answers.append(float(data[key]))

        # Optional demographic data
        age = answers[0]  # default age = 30
        gender_raw = data.get("gender", "Male")
        gender_map = {"Female": 0, "Male": 1, "Non-binary": 2, "Prefer not to say": -1}
        gender = answers[1]

        # Calculate features        # Sleep disturbance from q5, q6 (index 4, 5)
        sleep_disturbance = (answers[4] + answers[5]) / 2  
        sleep_hours = max(0, 8 - (sleep_disturbance * 1.5))  # 0 to 8 range
        sleep_hours = (sleep_hours / 8) * 25  # Normalize to 25

        # Physical activity days - q7 (index 6) => scale of 0 to 7
        physical_activity_days = (answers[6] / 7) * 25

        # Stress score from q8 to q15 (8 questions, scale 0–5)
        stress_score = (sum(answers[7:15]) / (8 * 5)) * 25

        # Anxiety score q16 to q22 (7 questions, scale 0–5)
        anxiety_score = (sum(answers[15:22]) / (7 * 5)) * 25

        # Depression score q23 to q31 (9 questions)
        depression_score = (sum(answers[22:31]) / (9 * 5)) * 25

        # Impulsivity score q32 to q34 (3 questions)
        impulsivity_score = (sum(answers[31:34]) / (3 * 5)) * 25

        # Hallucinations score q35 to q36 (2 questions)
        hallucinations_score = (sum(answers[34:36]) / (2 * 5)) * 25

        # Mood swings score q37 to q38 (2 questions)
        mood_swings_score = (sum(answers[36:38]) / (2 * 5)) * 25

        # Eating habits score q39 to q40 (2 questions)
        eating_habits_score = (sum(answers[38:40]) / (2 * 5)) * 25

        # Substance use score - q41 (index 40), single question scale 0–5
        substance_use_score = (answers[40] / 5) * 25

        # Trauma experience score - q42 (index 41), single question
        trauma_experience_score = (answers[41] / 5) * 25

        # ADHD score assumed q28 and q29 (answers[27:29])
        adhd_score = (sum(answers[27:29]) / (2 * 5)) * 25


        features = [
            age,
            gender,
            sleep_hours,
            physical_activity_days,
            stress_score,
            anxiety_score,
            depression_score,
            impulsivity_score,
            hallucinations_score,
            mood_swings_score,
            eating_habits_score,
            substance_use_score,
            trauma_experience_score,
            adhd_score,
        ]

        X = np.array(features).reshape(1, -1)

        # Pad features if scaler expects more inputs
        if X.shape[1] < scaler.n_features_in_:
            pad_len = scaler.n_features_in_ - X.shape[1]
            X = np.hstack([X, np.zeros((1, pad_len))])

        # Scale features
        X_scaled = scaler.transform(X)

        # Predict probabilities
        if hasattr(model, "predict_proba"):
            prediction_probs = model.predict_proba(X_scaled)
        else:
            # If no predict_proba, fallback to predict
            prediction_probs = model.predict(X_scaled)
            # reshape for uniformity
            if prediction_probs.ndim == 1:
                prediction_probs = prediction_probs.reshape(1, -1)

        # Validate prediction shape
        if prediction_probs.shape[0] != 1 or prediction_probs.shape[1] != len(disorders):
            return jsonify({"error": "Prediction output shape mismatch"}), 500

        # Map disorder names to predicted probabilities
        probs_dict = {disorder: float(prediction_probs[0][i]) for i, disorder in enumerate(disorders)}

        return jsonify({"probabilities": probs_dict})

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "Prediction failed", "details": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
