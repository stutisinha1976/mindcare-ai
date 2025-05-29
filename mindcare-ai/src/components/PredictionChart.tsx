'use client'

import Plot from 'react-plotly.js'

type Props = {
  probabilities: Record<string, number>
}

export default function PredictionChart({ probabilities }: Props) {
  const threshold = 0.1
  const filteredEntries = Object.entries(probabilities).filter(
    ([_, prob]) => prob > threshold
  )

  if (filteredEntries.length === 0) {
    return (
      <div className="text-center text-gray-700 text-lg">
        <p>No significant disorder likelihood detected.</p>
      </div>
    )
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
            colorscale: 'YlGnBu',
            line: {
              width: 1,
              color: 'rgba(0, 0, 0, 0.2)'
            },
          },
          text: values.map(v => `${(v * 100).toFixed(1)}%`),
          textposition: 'auto',
          hoverinfo: 'x+y',
          hoverlabel: {
            bgcolor: 'white',
            bordercolor: 'gray',
            font: { color: '#1F2937' }, // gray-800
          },
          opacity: 0.9,
        },
      ]}
      layout={{
        title: {
          text: 'Predicted Probability of Mental Health Disorders',
          font: {
            size: 22,
            color: '#065F46', // emerald-800
          },
          x: 0.5,
        },
        yaxis: {
          range: [0, 1],
          title: {
            text: 'Probability',
            font: { size: 16 },
          },
          gridcolor: 'rgba(200,200,200,0.2)',
        },
        xaxis: {
          title: {
            text: 'Disorders',
            font: { size: 16 },
          },
        },
        margin: { t: 60, b: 80, l: 60, r: 40 },
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)',
        transition: {
          duration: 500,
          easing: 'cubic-in-out',
        },
      }}
      config={{
        displayModeBar: false,
        responsive: true,
      }}
      style={{ width: '100%', height: '400px' }}
    />
  )
}
