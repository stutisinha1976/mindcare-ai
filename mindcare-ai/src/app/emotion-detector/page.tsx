'use client'
import React, { useState, useRef, useEffect } from "react";

const EmotionDetector: React.FC = () => {
  const [messages, setMessages] = useState<{ from: "user" | "bot"; text: string }[]>([
    { from: "bot", text: "Hi! How are you feeling today?" },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();

    // Add user message
    setMessages((prev) => [...prev, { from: "user", text: userMessage }]);
    setInput("");
    setIsLoading(true);

    try {
      // Call backend API
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

      // Add bot message with detected emotion
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: `I detect your emotion as "${emotion}" with confidence ${(confidence * 100).toFixed(
            1
          )}%.`,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Sorry, I couldn't detect your emotion right now." },
      ]);
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
    <main className="min-h-screen flex flex-col items-center justify-center bg-green-50 text-green-900 p-4">
      <div className="w-full max-w-md flex flex-col border border-green-300 rounded-lg shadow-lg bg-white">
        <header className="px-6 py-4 border-b border-green-200 font-bold text-xl bg-green-100 rounded-t-lg">
          Emotion Detector Chatbot
        </header>

        {/* Messages Area */}
        <div
          className="flex-1 px-6 py-4 overflow-y-auto space-y-3 max-h-[60vh]"
          style={{ scrollbarWidth: "thin" }}
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`max-w-[80%] px-4 py-2 rounded-lg break-words ${
                msg.from === "user"
                  ? "bg-green-300 text-green-900 self-end"
                  : "bg-green-100 text-green-800 self-start"
              }`}
            >
              {msg.text}
            </div>
          ))}
          {isLoading && (
            <div className="max-w-[80%] px-4 py-2 rounded-lg bg-green-100 text-green-800 self-start italic">
              Detecting emotion...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex border-t border-green-200 rounded-b-lg bg-green-50 p-3">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 rounded-md border border-green-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className={`ml-3 text-white font-semibold rounded-md px-4 py-2 ${
              isLoading ? "bg-green-300 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
};

export default EmotionDetector;
