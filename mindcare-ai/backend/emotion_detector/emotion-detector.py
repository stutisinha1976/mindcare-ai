from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline

app = Flask(__name__)
CORS(app)

emotion_classifier = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    return_all_scores=True
)

def detect_emotion_from_text(text):
    result = emotion_classifier(text)
    sorted_result = sorted(result[0], key=lambda x: x['score'], reverse=True)
    top = sorted_result[0]
    return top['label'], float(top['score'])

@app.route("/detect_emotion", methods=["POST"])
def detect_emotion():
    data = request.get_json(force=True)
    text = data.get("text", "")
    if not text:
        return jsonify({"error": "No text provided"}), 400

    emotion, confidence = detect_emotion_from_text(text)
    return jsonify({"emotion": emotion, "confidence": confidence})

if __name__ == "__main__":
    app.run(debug=True)
