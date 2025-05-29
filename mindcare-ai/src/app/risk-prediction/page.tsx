'use client'

import { useState } from 'react'
import QuestionnaireCarousel from '@/components/QuestionnaireCarousel'
import PredictionChart from '@/components/PredictionChart' // we'll create this

export default function RiskPredictionPage() {
  const [probabilities, setProbabilities] = useState<Record<string, number> | null>(null)

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <QuestionnaireCarousel setProbabilities={setProbabilities} />
      
      {/* Space for the plot */}
      <div className="mt-12 max-w-4xl mx-auto">
        {probabilities ? (
          <PredictionChart probabilities={probabilities} />
        ) : (
          <p className="text-center text-gray-500">Your prediction results will appear here after submission.</p>
        )}
      </div>
    </div>
  )
}
