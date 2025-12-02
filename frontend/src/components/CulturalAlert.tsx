import { useEffect, useState } from 'react'

export default function CulturalAlert({ feedback }: { feedback: string | null }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (feedback) {
      setVisible(true)
      const audio = new Audio('/sounds/vine_boom.mp3') // Optional: Add a dramatic sound effect
      audio.play().catch(() => {})
      setTimeout(() => setVisible(false), 5000)
    }
  }, [feedback])

  if (!visible || !feedback) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-red-600 text-white px-6 py-4 rounded-xl shadow-2xl animate-bounce-in max-w-sm text-center border-4 border-yellow-400">
        <div className="text-4xl mb-2">🚩 CULTURE FLAG!</div>
        <div className="text-xl font-bold mb-2">"No Respect!"</div>
        <p className="text-red-100">{feedback}</p>
      </div>
      <style>{`
        @keyframes bounce-in {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        .animate-bounce-in { animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
      `}</style>
    </div>
  )
}