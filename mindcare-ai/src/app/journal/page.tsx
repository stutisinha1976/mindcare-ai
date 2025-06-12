"use client";

import React, { useRef, useState } from "react";

export default function RecordJournal() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [result, setResult] = useState<any>(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (videoRef.current) videoRef.current.srcObject = stream;

    const mediaRecorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      setVideoBlob(blob);
      stream.getTracks().forEach((track) => track.stop());
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const uploadVideo = async () => {
    if (!videoBlob) return;
    const formData = new FormData();
    formData.append("video", videoBlob, "journal.webm");

   const response = await fetch("http://localhost:5000/analyze-journal", {
      method: "POST",
      body: formData,
    });

    const res = await response.json();
    console.log("Analysis Result:", res);
    setResult(res);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full max-h-[400px] rounded shadow border"
      />

      <div className="flex flex-wrap gap-4">
        {!recording ? (
          <button
            onClick={startRecording}
            className="bg-green-600 text-white py-2 px-4 rounded"
          >
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="bg-red-600 text-white py-2 px-4 rounded"
          >
            Stop Recording
          </button>
        )}
        {videoBlob && (
          <button
            onClick={uploadVideo}
            className="bg-blue-600 text-white py-2 px-4 rounded"
          >
            Upload & Analyze
          </button>
        )}
      </div>

      {result && (
        <div className="mt-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-100">Transcript</h2>
          <p className="bg-gray-800 p-4 rounded text-gray-200">{result.transcript}</p>

          <h2 className="text-xl font-semibold text-gray-100">Top Emotion</h2>
          <p className="text-yellow-400 text-lg">{result.top_emotion}</p>

          <h2 className="text-xl font-semibold text-gray-100">Advice</h2>
          <p className="bg-green-800 p-4 rounded text-white">{result.advice}</p>

          <h2 className="text-xl font-semibold text-gray-100">Emotion Chart</h2>
          <EmotionChart timeline={result.expression_timeline} />

          <h2 className="text-xl font-semibold text-gray-100">Emotion Timeline</h2>
          <ul className="space-y-1 text-sm text-gray-300">
            {result.expression_timeline.map((e: any, index: number) => (
              <li key={index}>
                Frame {e.frame}: <span className="text-orange-400">{e.emotion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function EmotionChart({ timeline }: { timeline: any[] }) {
  const emotionCounts = timeline.reduce((acc: any, e: any) => {
    acc[e.emotion] = (acc[e.emotion] || 0) + 1;
    return acc;
  }, {});

  const emotions = Object.keys(emotionCounts);
  const values = Object.values(emotionCounts);

  return (
    <div className="w-full bg-gray-900 p-4 rounded">
      {emotions.map((emotion, idx) => (
        <div key={emotion} className="flex items-center gap-2 mb-2">
          <span className="text-white w-24 capitalize">{emotion}</span>
          <div className="bg-blue-600 h-4 rounded w-full">
            <div
              className="bg-yellow-400 h-4 rounded"
              style={{ width: `${(Number(values[idx]) / timeline.length) * 100}%` }}
            />
          </div>
          <span className="text-white text-sm ml-2">{String(values[idx])}</span>
        </div>
      ))}
    </div>
  );
}
