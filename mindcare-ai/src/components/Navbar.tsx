'use client'
import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-green-600 via-green-700 to-green-800 text-white px-10 py-5 flex justify-center gap-12 shadow-lg select-none">
      <Link
        href="/"
        className="hover:text-yellow-300 transition-colors duration-300 font-semibold text-lg hover:scale-110"
      >
        🏠 Home
      </Link>
      <Link
        href="/emotion-detector"
        className="hover:text-yellow-300 transition-colors duration-300 font-semibold text-lg hover:scale-110"
      >
        😊 Emotion Detector
      </Link>
      <Link
        href="/chatbot"
        className="hover:text-yellow-300 transition-colors duration-300 font-semibold text-lg hover:scale-110"
      >
        🤖 Chatbot
      </Link>
      <Link
        href="/risk-prediction"
        className="hover:text-yellow-300 transition-colors duration-300 font-semibold text-lg hover:scale-110"
      >
        📊 Risk Prediction
      </Link>
      <Link
        href="/recommendations"
        className="hover:text-yellow-300 transition-colors duration-300 font-semibold text-lg hover:scale-110"
      >
        💡 Recommendations
      </Link>
      <Link
        href="/voice-text"
        className="hover:text-yellow-300 transition-colors duration-300 font-semibold text-lg hover:scale-110"
      >
        🎤 Voice/Text
      </Link>
    </nav>
  )
}
