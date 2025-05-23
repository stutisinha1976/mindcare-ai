
'use client'
import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white p-4 flex gap-6">
      <Link href="/">Home</Link>
      <Link href="/emotion-detector">Emotion Detector</Link>
      <Link href="/chatbot">Chatbot</Link>
      <Link href="/risk-prediction">Risk Prediction</Link>
      <Link href="/recommendations">Recommendations</Link>
      <Link href="/voice-text">Voice/Text</Link>
    </nav>
  )
}
