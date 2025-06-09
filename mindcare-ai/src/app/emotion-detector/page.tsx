'use client';
import React, { useState, useRef, useEffect } from 'react';

const emotionToEmoji: Record<string, string> = {
  joy: '😊',
  sadness: '😢',
  anger: '😠',
  surprise: '😲',
  neutral: '😐',
  fear: '😨',
  disgust: '🤢',
};

const EmotionDetector: React.FC = () => {
  const [messages, setMessages] = useState<{ from: 'user' | 'bot'; text: string }[]>([
    { from: 'bot', text: 'Hi! How are you feeling today?' },
  ]);
  const [input, setInput] = useState('');
  const [currentEmotion, setCurrentEmotion] = useState<string>('neutral');
  const [isLoading, setIsLoading] = useState(false);
  const [emojiAnimate, setEmojiAnimate] = useState(false);
  const [inputShake, setInputShake] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    setMessages((prev) => [...prev, { from: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/detect_emotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userMessage }),
      });

      if (!response.ok) throw new Error('Failed to fetch emotion');

      const data = await response.json();
      const { emotion, confidence } = data;

      setCurrentEmotion(emotion.toLowerCase());

      setMessages((prev) => [
        ...prev,
        {
          from: 'bot',
          text: `I detect your emotion as "${emotion}" with confidence ${(confidence * 100).toFixed(1)}%.`,
        },
      ]);

      if (['sadness', 'anger', 'fear', 'disgust'].includes(emotion.toLowerCase())) {
        setMessages((prev) => [
          ...prev,
          {
            from: 'bot',
            text: 'It seems you might be feeling upset. Feel free to share more here — I\'m here to listen and help.',
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { from: 'bot', text: "Sorry, I couldn't detect your emotion right now." },
      ]);
      setCurrentEmotion('neutral');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSend();
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center text-green-900 overflow-hidden">
      {/* Moving diagonal gradient background */}
      <div className="absolute inset-0 z-0 animate-diagonalGradient" />

      {/* Chatbot container */}
      <div className="w-full max-w-screen-sm mx-auto flex flex-col h-[90vh] border border-white/20 rounded-2xl shadow-2xl backdrop-blur-lg bg-white/10 relative z-10 overflow-hidden">
        <header className="px-6 py-4 border-b border-white/20 font-bold text-xl text-white bg-white/10 backdrop-blur-sm rounded-t-2xl select-none">
          Emotion Detector Chatbot
        </header>

        <div
          className={`text-8xl text-center mt-4 transition-transform duration-500 ${
            emojiAnimate ? 'animate-bounce scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]' : ''
          }`}
          aria-live="polite"
        >
          {emotionToEmoji[currentEmotion] || '❓'}
        </div>

        <div className="flex-1 px-6 py-4 overflow-y-auto space-y-4" aria-live="polite">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`max-w-[80%] px-5 py-3 rounded-lg break-words transition-opacity duration-500 ${
                msg.from === 'user'
                  ? 'bg-green-200 text-green-900 self-end ml-auto shadow-md'
                  : 'bg-white/30 text-white self-start shadow-sm'
              }`}
              style={{ opacity: 1, animation: 'fadeIn 0.5s ease forwards' }}
            >
              {msg.text}
            </div>
          ))}

          {isLoading && (
            <div className="max-w-[80%] px-5 py-3 rounded-lg bg-white/30 text-white self-start italic shadow-sm animate-pulse">
              Detecting emotion...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex border-t border-white/20 bg-white/10 backdrop-blur-md p-4 rounded-b-2xl">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type your message..."
            className={`flex-1 rounded-md border border-white/30 px-4 py-2 bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-green-300 transition ${
              inputShake ? 'animate-shake border-red-500' : ''
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
            className={`ml-4 font-semibold rounded-md px-5 py-2 transition-colors duration-300 text-white ${
              isLoading
                ? 'bg-green-300 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 active:bg-green-700'
            }`}
            aria-label="Send message"
          >
            Send
          </button>
        </div>
      </div>

      {/* CSS Styles */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.5s;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes diagonalGradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animate-diagonalGradient {
          background: linear-gradient(
            135deg,
            #a8e6cf,
            #dcedc1,
            #aed581,
            #81c784,
            #66bb6a,
            #a5d6a7
          );
          background-size: 400% 400%;
          animation: diagonalGradient 20s ease infinite;
          filter: blur(30px);
        }
      `}</style>
    </main>
  );
};

export default EmotionDetector;
