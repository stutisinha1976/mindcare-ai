# Backend: Flask app for analyzing audio & video
# Install with: pip install flask torchvision torchaudio transformers deepface openai-whisper

import os
import tempfile
import cv2
from flask import Flask, request, jsonify
import whisper
from deepface import DeepFace

# Ensure ffmpeg path is set if needed (especially on Windows)
os.environ["PATH"] += os.pathsep + r"C:\ffmpeg\bin"  # Adjust path as needed
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])



app = Flask(__name__)

# Load Whisper model once at server start
whisper_model = whisper.load_model("base")

@app.route('/analyze-journal', methods=['POST'])
def analyze():
    if 'video' not in request.files:
        return jsonify({"error": "No video uploaded"}), 400

    video_file = request.files['video']
    with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as temp_video:
        video_path = temp_video.name
        video_file.save(video_path)

    # Extract audio from video to WAV format
    audio_path = video_path.replace('.webm', '.wav')
    os.system(f"ffmpeg -i {video_path} -vn -acodec pcm_s16le -ar 16000 -ac 1 {audio_path} -y")

    # Transcribe audio using Whisper
    result = whisper_model.transcribe(audio_path)
    transcript = result['text']

    # Facial emotion analysis using DeepFace
    cap = cv2.VideoCapture(video_path)
    expressions = []
    frame_count = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        if frame_count % 10 == 0:  # Analyze every 10th frame
            try:
                analysis = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False)
                expressions.append({
                    "frame": frame_count,
                    "emotion": analysis[0]['dominant_emotion']
                })
            except Exception as e:
                print(f"Frame {frame_count} skipped: {e}")
        frame_count += 1

    cap.release()

    # Compute most frequent emotion
    emotion_counts = {}
    for e in expressions:
        emotion_counts[e['emotion']] = emotion_counts.get(e['emotion'], 0) + 1

    top_emotion = max(emotion_counts, key=emotion_counts.get) if emotion_counts else "neutral"

    # Basic advice engine
    advice = {
        "sad": "You seem low today. Consider writing about what's bothering you or try a mindfulness exercise.",
        "happy": "You're in a great mood! Keep reflecting on positive thoughts.",
        "angry": "Try some deep breathing or journaling to let go of frustration.",
        "fear": "You might be feeling anxious. Would you like to try a calming technique?",
        "neutral": "Consistency is key. Keep checking in daily."
    }.get(top_emotion, "Thank you for sharing. We're here for you.")
    print(f"Top emotion detected: {top_emotion}")
    print(f"Transcript: {transcript}")
    print(f"Expressions timeline: {expressions}")
    print(f"Advice: {advice}")
    return jsonify({
        "transcript": transcript,
        "top_emotion": top_emotion,
        "expression_timeline": expressions,
        "advice": advice
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
