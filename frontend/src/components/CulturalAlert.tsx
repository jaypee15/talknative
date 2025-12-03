import { useEffect, useState } from 'react'

export default function CulturalAlert({ feedback }: { feedback: string | null }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (feedback) {
      setVisible(true)
      const timer = setTimeout(() => setVisible(false), 6000)
      return () => clearTimeout(timer)
    }
  }, [feedback])

  if (!visible || !feedback) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none p-4">
      <div className="bg-red-600 text-white p-6 rounded-3xl shadow-[0_20px_60px_-15px_rgba(220,38,38,0.5)] animate-bounce-in max-w-sm text-center border-8 border-yellow-400 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/zigzag.png')]"></div>
        
        <div className="relative z-10">
            <div className="text-6xl mb-2 filter drop-shadow-md">🚩</div>
            <div className="text-2xl font-display font-bold mb-2 uppercase tracking-wide">Culture Penalty!</div>
            <div className="w-16 h-1 bg-yellow-400 mx-auto mb-4 rounded-full"></div>
            <p className="text-red-100 font-medium text-lg leading-snug">{feedback}</p>
        </div>
      </div>
      <style>{`
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); opacity: 1; }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        .animate-bounce-in { animation: bounce-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
      `}</style>
    </div>
  )
}