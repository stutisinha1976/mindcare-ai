import Link from 'next/link'

interface FeatureCardProps {
  title: string
  description: string
  href: string
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, href }) => {
  return (
    <Link
      href={href}
      className="block bg-white/10 backdrop-blur-md rounded-xl shadow-md p-6 flex flex-col justify-between hover:shadow-lg transition border border-white/20"
    >
      <h2 className="text-2xl font-semibold text-white mb-4">{title}</h2>
      <p className="text-white/80">{description}</p>
    </Link>
  )
}

export default function Home() {
  return (
    <main
      className="relative w-screen h-screen overflow-auto flex flex-col items-center justify-center px-6 py-12"
      style={{
        backgroundImage: `url('/bg.gif')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Reduced opacity overlay for lighter feel */}
      <div className="absolute inset-0 bg-black/30 z-0" />

      <div className="relative z-10 flex flex-col items-center justify-center">
        <h1 className="text-5xl font-extrabold text-white drop-shadow mb-8 text-center">
          Welcome to MindCare AI
        </h1>
        <p className="max-w-2xl text-center text-white/80 text-lg mb-12">
          Your AI-powered mental health companion, offering smart emotion detection, chatbot
          support, personalized risk insights, and tailored self-care recommendations.
        </p>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl w-full">
          <FeatureCard
            title="Emotion Detection"
            description="Analyze your journal or chat inputs to understand your emotional state instantly."
            href="/emotion-detector"
          />
          <FeatureCard
            title="Mental Health Chatbot"
            description="Get empathetic conversational support anytime through our AI chatbot."
            href="/chatbot"
          />
          <FeatureCard
            title="Risk Prediction"
            description="Receive personalized predictions for anxiety, depression, and other risks based on your inputs."
            href="/risk-prediction"
          />
          <FeatureCard
            title="Personalized Recommendations"
            description="Discover self-care tips and resources tailored just for you."
            href="/recommendations"
          />
          <FeatureCard
            title="Voice & Text Emotion Detection"
            description="Analyze emotions from both your voice and text for deeper understanding."
            href="/voice-text"
          />
        </section>

        <Link
          href="/emotion-detector"
          className="mt-12 px-8 py-4 bg-green-600 bg-opacity-60 text-white rounded-lg font-semibold hover:bg-green-700 transition drop-shadow-md"
        >
          Try Emotion Detection Now
        </Link>
      </div>
    </main>
  )
}
