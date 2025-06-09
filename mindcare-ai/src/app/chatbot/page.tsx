'use client'

import { useState, useRef, useEffect } from 'react'

const GEMINI_API_KEY = 'AIzaSyDKdARjGFLupnNPJNphZaPac-pTyzpih7w'

type Message = { role: 'user' | 'bot'; text: string }

type ChatSession = {
  id: string
  title: string
  messages: Message[]
}

export default function Chatbot() {
  // All chat sessions stored here
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  // Current active chat session id
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  // Current input and image for active chat
  const [input, setInput] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom on messages change for active session
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeSessionId, chatSessions])

  // Helper: convert image to base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  // Get messages of active session
  const activeMessages =
    chatSessions.find((session) => session.id === activeSessionId)?.messages || []

  // Add message to active chat session
  const addMessageToActiveSession = (message: Message) => {
    if (!activeSessionId) return

    setChatSessions((prev) =>
      prev.map((session) =>
        session.id === activeSessionId
          ? { ...session, messages: [...session.messages, message] }
          : session
      )
    )
  }

  // Create a new chat session and set active
  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
    }
    setChatSessions((prev) => [newSession, ...prev])
    setActiveSessionId(newSession.id)
    setInput('')
    setImage(null)
  }

  // Rename chat session based on first user message
  const renameSession = (id: string, newTitle: string) => {
    setChatSessions((prev) =>
      prev.map((session) =>
        session.id === id ? { ...session, title: newTitle } : session
      )
    )
  }

  const sendMessage = async () => {
    if (!input.trim() && !image) return
    if (!activeSessionId) {
      createNewSession()
    }

    const userMessage = input.trim()
    addMessageToActiveSession({ role: 'user', text: userMessage || '[Image]' })
    setInput('')
    setLoading(true)

    try {
      let parts: any[] = []
      if (userMessage) {
        parts.push({ text: userMessage })
      }
      if (image) {
        const base64String = await convertToBase64(image)
        const base64Data = base64String.split(',')[1]
        parts.push({
          inlineData: {
            mimeType: image.type,
            data: base64Data,
          },
        })
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text:
                      "You are a compassionate and empathetic mental health assistant. Always respond with kindness, understanding, and supportive language, keeping the user's emotional well-being in mind.",
                  },
                ],
              },
              {
                role: 'user',
                parts: parts,
              },
            ],
          }),
        }
      )

      if (!response.ok) {
        const errorBody = await response.text()
        throw new Error(`API error: ${response.status} - ${errorBody}`)
      }

      const data = await response.json()
      const botReply =
        data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini.'

      addMessageToActiveSession({ role: 'bot', text: botReply })
      setImage(null)

      // Rename session on first user message if it's new
      if (activeMessages.length === 0 && userMessage) {
        renameSession(activeSessionId!, userMessage.slice(0, 20) + '...')
      }
    } catch (error) {
      console.error(error)
      addMessageToActiveSession({
        role: 'bot',
        text: 'Error getting response from Gemini API.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage()
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0])
    }
  }

  return (
    <div className="min-h-screen flex bg-green-50 font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-green-200 flex flex-col">
        <div className="p-5 border-b border-green-200 flex items-center justify-between">
          <h2 className="font-extrabold text-green-900 text-lg select-none">
            Chat History
          </h2>
          <button
            onClick={createNewSession}
            className="text-green-700 hover:text-green-900 font-semibold px-3 py-1 rounded bg-green-100 hover:bg-green-200 transition"
            title="New Chat"
          >
            +
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chatSessions.length === 0 && (
            <p className="p-4 text-green-600 italic">No chats yet. Start new chat!</p>
          )}
          {chatSessions.map((session) => (
            <button
              key={session.id}
              onClick={() => setActiveSessionId(session.id)}
              className={`w-full text-left px-4 py-3 border-b border-green-100 hover:bg-green-100 transition
                ${
                  session.id === activeSessionId
                    ? 'bg-green-200 font-semibold text-green-900'
                    : 'text-green-700'
                }
              `}
            >
              {session.title}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col py-16 px-10">
        <h1 className="text-4xl font-extrabold text-green-900 mb-8 tracking-tight select-none">
          MindCare AI Chatbot
        </h1>

        <div className="flex-1 max-w-4xl flex flex-col bg-white shadow-lg rounded-2xl p-8 space-y-6">
          <div
            className="flex-1 overflow-y-auto space-y-5 flex flex-col max-h-[600px] scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-green-50"
            style={{ scrollbarWidth: 'thin' }}
          >
            {activeMessages.length === 0 && (
              <p className="text-green-600 italic select-none">
                No messages yet. Type something to start.
              </p>
            )}

            {activeMessages.map((msg, index) => (
              <div
                key={index}
                className={`px-5 py-3 rounded-2xl max-w-[70%] break-words whitespace-pre-line
                ${
                  msg.role === 'user'
                    ? 'bg-green-300 self-end text-green-900 shadow-md'
                    : 'bg-green-100 self-start text-green-800 shadow-sm'
                }`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              className="flex-1 border border-green-400 rounded-xl px-5 py-3 focus:outline-none focus:ring-4 focus:ring-green-300 transition-shadow text-green-900 placeholder-green-600 font-medium shadow-sm"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              spellCheck={false}
              autoComplete="off"
            />

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={loading}
              className="border border-green-400 rounded-xl px-4 py-2 cursor-pointer text-green-800 hover:bg-green-100 transition-colors shadow-sm"
            />

            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-green-700 text-white px-6 py-3 rounded-xl hover:bg-green-800 transition disabled:opacity-60 font-semibold shadow-md"
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>

          {image && (
            <div className="text-green-900 font-medium text-sm mt-1 select-text">
              Selected Image: <span className="underline">{image.name}</span>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
