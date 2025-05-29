"use client"

import { useState } from "react"
import dynamic from "next/dynamic"

// Lazy load Plotly for SSR compatibility
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false })

type Answers = { [key: string]: number }
type Props = {
  setProbabilities: React.Dispatch<React.SetStateAction<Record<string, number> | null>>
}

const questions = [
  // 🔹 Section 1: Demographics
  { id: "q1", label: "What is your age?", section: "Demographics", type: "number" },
  { id: "q2", label: "What is your gender?", section: "Demographics", type: "select", options: ["Male", "Female", "Non-binary", "Prefer not to say"] },

  // 🔹 Section 2: Lifestyle
  { id: "q3", label: "On average, how many hours do you sleep each night?", section: "Lifestyle", type: "number" },
  { id: "q4", label: "How many days per week do you engage in physical activity (e.g., walking, gym, yoga)?", section: "Lifestyle", type: "number" },

  // 🔹 Section 3: Mental Health Symptoms
  // 📌 Depression (PHQ-9 Based)
  { id: "q5", label: "Little interest or pleasure in doing things", section: "Depression" },
  { id: "q6", label: "Feeling down, depressed, or hopeless", section: "Depression" },
  { id: "q7", label: "Trouble falling/staying asleep, or sleeping too much", section: "Depression" },
  { id: "q8", label: "Feeling tired or having little energy", section: "Depression" },
  { id: "q9", label: "Poor appetite or overeating", section: "Depression" },
  { id: "q10", label: "Feeling bad about yourself — or that you are a failure", section: "Depression" },
  { id: "q11", label: "Trouble concentrating on things", section: "Depression" },
  { id: "q12", label: "Moving or speaking so slowly that others noticed — or being fidgety/restless", section: "Depression" },
  { id: "q13", label: "Thoughts that you would be better off dead or of hurting yourself", section: "Depression" },

  // 📌 Anxiety (GAD-7 Based)
  { id: "q14", label: "Feeling nervous, anxious, or on edge", section: "Anxiety" },
  { id: "q15", label: "Not being able to stop or control worrying", section: "Anxiety" },
  { id: "q16", label: "Worrying too much about different things", section: "Anxiety" },
  { id: "q17", label: "Trouble relaxing", section: "Anxiety" },
  { id: "q18", label: "Being so restless that it is hard to sit still", section: "Anxiety" },
  { id: "q19", label: "Becoming easily annoyed or irritable", section: "Anxiety" },
  { id: "q20", label: "Feeling afraid as if something awful might happen", section: "Anxiety" },

  // 📌 Stress (DASS-21 Based)
  { id: "q21", label: "I found it hard to wind down", section: "Stress" },
  { id: "q22", label: "I tended to over-react to situations", section: "Stress" },
  { id: "q23", label: "I felt that I was using a lot of nervous energy", section: "Stress" },
  { id: "q24", label: "I found it difficult to relax", section: "Stress" },
  { id: "q25", label: "I felt that I was rather touchy", section: "Stress" },
  { id: "q26", label: "I felt that I was intolerant of interruptions", section: "Stress" },

  // 📌 Other Conditions
  // ADHD
  { id: "q27", label: "I find it hard to focus on tasks or conversations.", section: "ADHD" },
  { id: "q28", label: "I often forget details or lose things.", section: "ADHD" },

  // Impulsivity/BPD
  { id: "q29", label: "I sometimes act without thinking about the consequences.", section: "BPD" },
  { id: "q30", label: "My moods change rapidly and unpredictably.", section: "BPD" },

  // Bipolar Disorder
  { id: "q31", label: "I sometimes feel extremely energetic and need little sleep.", section: "Bipolar" },
  { id: "q32", label: "I feel invincible or overconfident for no clear reason.", section: "Bipolar" },

  // PTSD
  { id: "q33", label: "I have had nightmares or flashbacks related to a traumatic event.", section: "PTSD" },
  { id: "q34", label: "I try to avoid thoughts or reminders of that event.", section: "PTSD" },

  // OCD
  { id: "q35", label: "I feel the need to perform certain routines repeatedly.", section: "OCD" },
  { id: "q36", label: "I experience intrusive thoughts that I can't control.", section: "OCD" },

  // Schizophrenia
  { id: "q37", label: "I sometimes hear voices or see things that others don't.", section: "Schizophrenia" },
  { id: "q38", label: "I find it hard to distinguish what is real from what isn’t.", section: "Schizophrenia" },

  // Eating Disorder
  { id: "q39", label: "I am preoccupied with food, body image, or weight.", section: "Eating Disorder" },
  { id: "q40", label: "I restrict, binge, or purge food due to body image concerns.", section: "Eating Disorder" },

  // Substance Use
  { id: "q41", label: "I often consume alcohol or drugs to cope with stress or emotions.", section: "Substance Use" },
  { id: "q42", label: "My use of alcohol/drugs has interfered with my responsibilities.", section: "Substance Use" },
]


const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000"

export default function QuestionnaireCarousel({ setProbabilities }: Props) {
  const [answers, setAnswers] = useState<Answers>(
    questions.reduce((acc, q) => ({ ...acc, [q.id]: 0 }), {})
  )
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleChange = (value: number) => {
    const qid = questions[index].id
    setAnswers((prev) => ({ ...prev, [qid]: value }))
  }

  const handlePrev = () => setIndex((prev) => (prev > 0 ? prev - 1 : prev))
  const handleNext = () => setIndex((prev) => (prev < questions.length - 1 ? prev + 1 : prev))

  const handleSubmit = async () => {
    setLoading(true)
    setResult(null)
    setProbabilities(null)

    try {
      const res = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      })

      if (!res.ok) throw new Error("Prediction failed")
      const data = await res.json()
      setResult(data)

      if (data.probabilities && typeof data.probabilities === "object") {
        setProbabilities(data.probabilities)
      } else {
        setProbabilities(null)
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Mental Health Prediction Questionnaire</h1>

      {/* Question Card */}
      <div className="mb-4 border rounded p-4 shadow">
        <p className="mb-2 font-semibold">
          Question {index + 1} of {questions.length}
        </p>
        <p className="mb-4">{questions[index].label}</p>

        {questions[index].type === "number" ? (
  <input
    type="number"
    value={answers[questions[index].id]}
    onChange={(e) => handleChange(Number(e.target.value))}
    className="border rounded px-3 py-2 w-full"
  />
) : questions[index].type === "select" ? (
  <select
    value={answers[questions[index].id]}
    onChange={(e) => handleChange(Number(e.target.value))}
    className="border rounded px-3 py-2 w-full"
  >
    <option value={0}>-- Select --</option>
    {questions[index].options?.map((option, i) => (
      <option key={i} value={i + 1}>{option}</option>
    ))}
  </select>
) : (
  <select
    value={answers[questions[index].id]}
    onChange={(e) => handleChange(Number(e.target.value))}
    className="border rounded px-3 py-2 w-full"
  >
    <option value={0}>Never / Not at all</option>
    <option value={1}>Rarely / A little</option>
    <option value={2}>Sometimes / Moderately</option>
    <option value={3}>Often / Severely</option>
    <option value={4}>Always / Extremely</option>
  </select>
)}

      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mb-6">
        <button
          onClick={handlePrev}
          disabled={index === 0}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Previous
        </button>
        {index === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
          >
            {loading ? "Predicting..." : "Submit"}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Next
          </button>
        )}
      </div>

      {/* Result Display */}
      {result && result.probabilities && (
        <div className="bg-green-50 border border-green-300 rounded p-4">
          <h2 className="text-xl font-semibold mb-2">Prediction Results</h2>

          {/* Textual List */}
          <ul className="list-disc list-inside space-y-1 mb-6">
            {Object.entries(result.probabilities)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .map(([disorder, prob]) => {
                const probability = prob as number
                const percentage = (probability * 100).toFixed(2)
                const isHigh = probability > 0.5
                return (
                  <li key={disorder} className={isHigh ? "font-semibold text-green-700" : ""}>
                    {disorder}: {percentage}%
                  </li>
                )
              })}
          </ul>

          {/* Plotly Bar Chart (Only for probabilities > 50%) */}
          {(() => {
            const highProbabilities = Object.entries(result.probabilities)
              .filter(([, prob]) => (prob as number) > 0.5)

            if (highProbabilities.length === 0) return null

            return (
              <Plot
                data={[
                  {
                    type: "bar",
                    x: highProbabilities.map(([, v]) => ((v as number) * 100).toFixed(2)),
                    y: highProbabilities.map(([k]) => k),
                    orientation: "h",
                    marker: {
                      color: highProbabilities.map(([, v]) => v as number),
                      colorscale: "Viridis",
                    },
                  },
                ]}
                layout={{
                  margin: { t: 20, l: 120 },
                  xaxis: { title: { text: "Likelihood (%)" }, range: [0, 100] },
                  yaxis: { automargin: true },
                  height: 300 + 40 * highProbabilities.length,
                }}
                style={{ width: "100%" }}
              />
            )
          })()}
        </div>
      )}
    </div>
  )
}
