'use client'

import { useState, useRef, useEffect } from 'react'

export default function ChatbotPage() {
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = input.trim()
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }])
    setInput('')
    setLoading(true)

    try {
      // NOTE: Replace GEMINI_API_KEY with your actual key in URL
      // Also adjust the body to match Gemini API specs
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyChe24hPzBZOyFegpNB33MEHAuPetzRr_AY',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Authorization header usually not needed if key is in URL
          },
          body: JSON.stringify({
            prompt: {
              text: userMessage,
            },
            // add other params Gemini needs here
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      // Example: Gemini may respond with something like data.candidates[0].content
      // Adjust this based on actual response format:
      const botReply =
        data.candidates && data.candidates[0]?.content
          ? data.candidates[0].content
          : 'No reply'

      setMessages((prev) => [...prev, { role: 'bot', text: botReply }])
    } catch (err) {
      console.error(err)
      setMessages((prev) => [...prev, { role: 'bot', text: 'Error getting response.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage()
  }

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center py-12 px-4">
      <h1 className="text-4xl font-bold text-green-800 mb-6">MindCare AI Chatbot</h1>

      <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-6 flex flex-col space-y-4">
        <div className="flex-1 overflow-y-auto space-y-3 flex flex-col">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg max-w-[75%] ${
                msg.role === 'user'
                  ? 'bg-green-200 self-end text-green-900'
                  : 'bg-green-100 self-start text-green-900'
              }`}
            >
              {msg.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            className="flex-1 border border-green-400 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}
