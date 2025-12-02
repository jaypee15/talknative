import { useEffect, useState } from 'react'

interface PatienceMeterProps {
  level: number // 0 to 100
  sentiment?: number | null // -1 to 1 (last AI reaction)
  isRecording: boolean
}

export default function PatienceMeter({ level, sentiment, isRecording }: PatienceMeterProps) {
  const [shake, setShake] = useState(false)

  // Trigger shake effect when sentiment drops or level is critical
  useEffect(() => {
    if ((sentiment && sentiment < -0.2) || level < 20) {
      setShake(true)
      const timer = setTimeout(() => setShake(false), 500)
      return () => clearTimeout(timer)
    }
  }, [sentiment, level])

  const getColor = () => {
    if (level > 60) return 'bg-green-500'
    if (level > 30) return 'bg-yellow-500'
    return 'bg-red-600'
  }

  return (
    <div className="w-full max-w-md mx-auto mb-4">
      <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-1 text-gray-500">
        <span>Seller Patience</span>
        <span className={level < 30 ? 'text-red-600 animate-pulse' : 'text-gray-600'}>
          {Math.round(level)}%
        </span>
      </div>
      <div className={`h-4 w-full bg-gray-200 rounded-full overflow-hidden border border-gray-300 ${shake ? 'animate-shake' : ''}`}>
        <div
          className={`h-full transition-all duration-500 ease-out ${getColor()} ${isRecording ? 'animate-pulse' : ''}`}
          style={{ width: `${level}%` }}
        />
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  )
}