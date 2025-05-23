'use client'
import React, { useState, useRef, useEffect } from "react";

const emotionToEmoji: Record<string, string> = {
  joy: "😊",
  sadness: "😢",
  anger: "😠",
  surprise: "😲",
  neutral: "😐",
  fear: "😨",
  disgust: "🤢",
};

const EmotionDetector: React.FC = () => {
  const [messages, setMessages] = useState<{ from: "user" | "bot"; text: string }[]>([
    { from: "bot", text: "Hi! How are you feeling today?" },
  ]);
  const [input, setInput] = useState("");
  const [currentEmotion, setCurrentEmotion] = useState<string>("neutral");
  const [isLoading, setIsLoading] = useState(false);
  const [emojiAnimate, setEmojiAnimate] = useState(false);
  const [inputShake, setInputShake] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Animate emoji on emotion change
  useEffect(() => {
    if (!emojiAnimate) {
      setEmojiAnimate(true);
      const timer = setTimeout(() => setEmojiAnimate(false), 600);
      return () => clearTimeout(timer);
    }
  }, [currentEmotion]);

  const handleSend = async () => {
    if (!input.trim()) {
      setInputShake(true);
      setTimeout(() => setInputShake(false), 500);
      inputRef.current?.focus();
      return;
    }

    const userMessage = input.trim();

    // Add user message to chat
    setMessages((prev) => [...prev, { from: "user", text: userMessage }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/detect_emotion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userMessage }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch emotion");
      }

      const data = await response.json();
      const { emotion, confidence } = data;

      setCurrentEmotion(emotion.toLowerCase());

      // Add bot message with detected emotion
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: `I detect your emotion as "${emotion}" with confidence ${(confidence * 100).toFixed(1)}%.`,
        },
      ]);

      // If the emotion is one of these, add a supportive message
      if (["sadness", "anger", "fear", "disgust"].includes(emotion.toLowerCase())) {
        setMessages((prev) => [
          ...prev,
          {
            from: "bot",
            text: "It seems you might be feeling upset. Feel free to share more here — I'm here to listen and help.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Sorry, I couldn't detect your emotion right now." },
      ]);
      setCurrentEmotion("neutral");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading) {
      handleSend();
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 via-green-50 to-green-100 text-green-900 p-4 overflow-hidden">
      {/* Background decorations */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute bg-green-300 rounded-full opacity-20 w-48 h-48 top-10 left-8 animate-floatSlow"></div>
        <div className="absolute bg-green-400 rounded-full opacity-15 w-36 h-36 top-40 right-12 animate-float"></div>
        <div className="absolute bg-green-200 rounded-full opacity-25 w-64 h-64 bottom-20 left-1/3 animate-floatDelay"></div>
        <div className="absolute bg-green-300 rounded-full opacity-10 w-40 h-40 bottom-32 right-1/4 animate-floatSlow"></div>
        <div className="absolute bg-green-400 rounded-full opacity-20 w-20 h-20 top-1/2 left-1/2 animate-float"></div>
      </div>

      <div className="w-full max-w-md flex flex-col border border-green-300 rounded-lg shadow-lg bg-white relative z-10">
        <header className="px-6 py-4 border-b border-green-200 font-bold text-xl bg-green-100 rounded-t-lg select-none">
          Emotion Detector Chatbot
        </header>

        <div
          className={`text-8xl text-center mt-6 mb-4 transition-transform duration-500 ${
            emojiAnimate ? "animate-bounce scale-110 drop-shadow-[0_0_10px_rgba(34,197,94,0.7)]" : ""
          }`}
          aria-live="polite"
        >
          {emotionToEmoji[currentEmotion] || "❓"}
        </div>

        <div
          className="flex-1 px-6 py-4 overflow-y-auto space-y-4 max-h-[60vh]"
          style={{ scrollbarWidth: "thin" }}
          aria-live="polite"
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`max-w-[80%] px-5 py-3 rounded-lg break-words transition-opacity duration-500 ${
                msg.from === "user"
                  ? "bg-green-300 text-green-900 self-end shadow-md"
                  : "bg-green-100 text-green-800 self-start shadow-sm"
              }`}
              style={{ opacity: 1, animation: "fadeIn 0.5s ease forwards" }}
            >
              {msg.text}
            </div>
          ))}

          {isLoading && (
            <div className="max-w-[80%] px-5 py-3 rounded-lg bg-green-100 text-green-800 self-start italic shadow-sm animate-pulse">
              Detecting emotion...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="flex border-t border-green-200 rounded-b-lg bg-green-50 p-4">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type your message..."
            className={`flex-1 rounded-md border border-green-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 transition ${
              inputShake ? "animate-shake border-red-500" : ""
            }`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            aria-label="Message input"
            autoFocus
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className={`ml-4 text-white font-semibold rounded-md px-5 py-2 transition-colors duration-300 ${
              isLoading
                ? "bg-green-300 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600 active:bg-green-700"
            } select-none`}
            aria-label="Send message"
          >
            Send
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          20%, 60% {
            transform: translateX(-8px);
          }
          40%, 80% {
            transform: translateX(8px);
          }
        }
        .animate-shake {
          animation: shake 0.5s;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        @keyframes floatSlow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        @keyframes floatDelay {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-12px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-floatSlow {
          animation: floatSlow 8s ease-in-out infinite;
        }
        .animate-floatDelay {
          animation: floatDelay 7s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
};

export default EmotionDetector;
