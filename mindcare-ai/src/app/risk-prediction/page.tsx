'use client'

import { useState } from 'react'
import QuestionnaireCarousel from '@/components/QuestionnaireCarousel'
import PredictionChart from '@/components/PredictionChart'

export default function RiskPredictionPage() {
  const [probabilities, setProbabilities] = useState<Record<string, number> | null>(null)

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-100 via-emerald-200 to-green-300 p-6 md:p-12 flex flex-col items-center justify-center">
      
      {/* Glassmorphism container for questionnaire */}
      <div className="backdrop-blur-md bg-white/30 border border-white/40 rounded-2xl shadow-xl w-full max-w-5xl p-6 md:p-10 mb-12">
        <h1 className="text-3xl md:text-4xl font-semibold text-emerald-800 text-center mb-6">
          Mental Health Risk Prediction
        </h1>
        <QuestionnaireCarousel setProbabilities={setProbabilities} />
      </div>

      {/* Glassmorphism container for chart */}
      <div className="backdrop-blur-md bg-white/30 border border-white/40 rounded-2xl shadow-xl w-full max-w-4xl p-6 md:p-10">
        {probabilities ? (
          <>
            <h2 className="text-2xl font-semibold text-emerald-800 text-center mb-4">Prediction Results</h2>
            <PredictionChart probabilities={probabilities} />
          </>
        ) : (
          <p className="text-center text-gray-700 text-lg">
            Your prediction results will appear here after submission.
          </p>
        )}
      </div>
    </div>
  )
}
