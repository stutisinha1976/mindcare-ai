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
        # --- Extract demographics and lifestyle questions explicitly ---
        # Use .get() with fallback defaults
        age = float(data.get("q1", 30))  # q1: age
        gender_raw = data.get("q2", "Male")  # q2: gender string

        # Map gender string to numeric (example mapping)
        gender_map = {"Female": 0, "Male": 1, "Non-binary": 2, "Prefer not to say": -1}
        gender = gender_map.get(gender_raw, 1)  # default male=1 if unknown

        sleep_hours_raw = data.get("q3", 8)  # q3: hours sleep each night
        try:
            sleep_hours = float(sleep_hours_raw)
        except:
            sleep_hours = 8  # default 8 hours if invalid

        physical_activity_days_raw = data.get("q4", 3)  # q4: physical activity days/week
        try:
            physical_activity_days = float(physical_activity_days_raw)
        except:
            physical_activity_days = 3  # default

        # --- Extract symptom answers for mental health features ---
        # We'll use the symptom questions (q5 to q42) which are scored 0-4 from the frontend

        # Extract all other q5 to q42 as floats, default 0 if missing
        symptom_answers = []
        for i in range(5, 43):
            key = f"q{i}"
            val = data.get(key, 0)
            try:
                symptom_answers.append(float(val))
            except:
                symptom_answers.append(0)

        # Example: you can engineer features from symptom_answers based on domain knowledge
        # For now, let's create some aggregate scores:
        # Depression (q5-q13), Anxiety (q14-q20), Stress (q21-q26), ADHD (q27-q28),
        # BPD (q29-q30), Bipolar (q31-q32), PTSD (q33-q34), OCD (q35-q36),
        # Schizophrenia (q37-q38), Eating Disorder (q39-q40), Substance Use (q41-q42)

        def mean_score(indices):
            vals = [symptom_answers[i - 5] for i in indices if i - 5 < len(symptom_answers)]
            if not vals:
                return 0
            return sum(vals) / len(vals)

        depression_score = mean_score(range(5, 14))
        anxiety_score = mean_score(range(14, 21))
        stress_score = mean_score(range(21, 27))
        adhd_score = mean_score(range(27, 29))
        bpd_score = mean_score(range(29, 31))
        bipolar_score = mean_score(range(31, 33))
        ptsd_score = mean_score(range(33, 35))
        ocd_score = mean_score(range(35, 37))
        schizophrenia_score = mean_score(range(37, 39))
        eating_disorder_score = mean_score(range(39, 41))
        substance_use_score = mean_score(range(41, 43))

        # Impulsivity can be approximated by BPD score or specific questions:
        impulsivity_score = bpd_score

        # Mood swings proxy could be bipolar score
        mood_swings_score = bipolar_score

        # You can refine these features or add more based on model requirements
        features = [
            age,
            gender,
            sleep_hours,
            physical_activity_days,
            stress_score,
            anxiety_score,
            depression_score,
            impulsivity_score,
            schizophrenia_score,  # hallucinations proxy
            mood_swings_score,
            eating_disorder_score,
            substance_use_score,
            ptsd_score,
            adhd_score,
            ocd_score,
            bpd_score,
            bipolar_score,
        ]

        X = np.array(features).reshape(1, -1)

        # Pad if scaler expects more features
        if X.shape[1] < scaler.n_features_in_:
            pad_len = scaler.n_features_in_ - X.shape[1]
            X = np.hstack([X, np.zeros((1, pad_len))])

        # Scale features
        X_scaled = scaler.transform(X)

        # Predict probabilities
        if hasattr(model, "predict_proba"):
            prediction_probs = model.predict_proba(X_scaled)
        else:
            prediction_probs = model.predict(X_scaled)

        if prediction_probs.shape[0] != 1 or prediction_probs.shape[1] != len(disorders):
            return jsonify({"error": "Prediction output shape mismatch"}), 500

        probs_dict = {disorder: float(prediction_probs[0][i]) for i, disorder in enumerate(disorders)}

        return jsonify({"probabilities": probs_dict})

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "Prediction failed", "details": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
