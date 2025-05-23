from flask import Flask, request, jsonify
from transformers import pipeline

app = Flask(__name__)

# Load the emotion classification model once at startup
emotion_classifier = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    return_all_scores=True,
)

@app.route("/detect_emotion", methods=["POST"])
def detect_emotion():
    data = request.get_json()
    if not data or "text" not in data:
        return jsonify({"error": "Missing 'text' in request body"}), 400
    
    text = data["text"]
    if not text.strip():
        return jsonify({"error": "Empty text provided"}), 400

    # Run model prediction
    result = emotion_classifier(text)
    # Sort results by confidence descending
    sorted_result = sorted(result[0], key=lambda x: x["score"], reverse=True)
    
    # Top emotion label and confidence score
    top_emotion = sorted_result[0]["label"]
    confidence = sorted_result[0]["score"]

    return jsonify({
        "emotion": top_emotion,
        "confidence": confidence
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
