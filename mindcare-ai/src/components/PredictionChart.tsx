'use client'

import Plot from 'react-plotly.js'

type Props = {
  probabilities: Record<string, number>
}

export default function PredictionChart({ probabilities }: Props) {
  // Filter disorders with probability > threshold (e.g. 0.1)
  const threshold = 0.1
  const filteredEntries = Object.entries(probabilities).filter(
    ([_, prob]) => prob > threshold
  )

  // If none pass the threshold, show a friendly message or fallback to all
  if (filteredEntries.length === 0) {
    return <p>No significant disorder likelihood detected.</p>
  }

  const disorders = filteredEntries.map(([disorder]) => disorder)
  const values = filteredEntries.map(([_, prob]) => prob)

  return (
    <Plot
      data={[
        {
          x: disorders,
          y: values,
          type: 'bar',
          marker: {
            color: values,
            colorscale: 'Viridis',
          },
        },
      ]}
      layout={{
        title: { text: 'Predicted Probability of Mental Health Disorders' },
        yaxis: { range: [0, 1], title: { text: 'Probability' } },
        xaxis: { title: { text: 'Disorders' } },
        margin: { t: 40, b: 80 },
      }}
      style={{ width: '100%', height: '400px' }}
    />
  )
}
