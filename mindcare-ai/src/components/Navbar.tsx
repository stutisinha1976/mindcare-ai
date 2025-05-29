'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-green-300 backdrop-blur-md border border-green-200 px-6 py-4 flex flex-wrap items-center justify-between text-green-900 select-none shadow-lg">
      {/* Logo or Brand */}
      <div className="flex items-center space-x-4 font-semibold text-lg">
        <Link href="/" className="hover:text-yellow-600 transition-colors duration-300 flex items-center gap-2">
          🧠 Mental Health AI
        </Link>
      </div>

      {/* Hamburger button for mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-green-900 md:hidden focus:outline-none"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Links container */}
      <div
        className={`w-full md:w-auto md:flex md:items-center md:justify-center gap-8 mt-4 md:mt-0 ${
          isOpen ? 'block' : 'hidden'
        }`}
      >
        {[
          { href: '/', label: '🏠 Home' },
          { href: '/emotion-detector', label: '😊 Emotion Detector' },
          { href: '/chatbot', label: '🤖 Chatbot' },
          { href: '/risk-prediction', label: '📊 Risk Prediction' },
          { href: '/recommendations', label: '💡 Recommendations' },
          { href: '/voice-text', label: '🎤 Voice/Text' },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="block md:inline-block font-semibold text-lg px-3 py-2 rounded hover:text-yellow-600 hover:scale-110 transition-all duration-300"
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
