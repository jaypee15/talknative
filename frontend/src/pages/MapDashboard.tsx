import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getScenarios, getUserProgress } from '../lib/api'

// Simple SVG Icons
const Icons = {
  Lock: () => <span className="text-2xl">🔒</span>,
  Star: ({ filled }: { filled: boolean }) => <span className={`text-sm ${filled ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>,
  Airport: () => <span className="text-3xl">✈️</span>,
  Bus: () => <span className="text-3xl">🚌</span>,
  Market: () => <span className="text-3xl">🧺</span>,
  Village: () => <span className="text-3xl">🛖</span>,
}

export default function MapDashboard() {
  const [scenarios, setScenarios] = useState<any[]>([])
  const [progress, setProgress] = useState<any>({})
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([getScenarios(), getUserProgress()]).then(([sData, pData]) => {
      // Sort scenarios by level
      const sorted = sData.sort((a: any, b: any) => a.level - b.level)
      setScenarios(sorted)
      
      // Map progress array to object
      const pMap = pData.reduce((acc: any, curr: any) => ({
        ...acc, [curr.scenario_id]: curr.stars
      }), {})
      setProgress(pMap)
    })
  }, [])

  const isUnlocked = (index: number) => {
    if (index === 0) return true
    const prevId = scenarios[index - 1].id
    return (progress[prevId] || 0) >= 1 // Need at least 1 star to unlock next
  }

  return (
    <div className="min-h-screen bg-[#FDF6E3] pb-20">
      <div className="bg-green-800 text-white p-4 shadow-md sticky top-0 z-10 flex justify-between items-center">
        <h1 className="font-bold text-lg">🇳🇬 Naija Tour</h1>
        <button onClick={() => navigate('/deck')} className="text-sm bg-green-700 px-3 py-1 rounded-full">
          🃏 Wisdom Deck
        </button>
      </div>

      <div className="max-w-md mx-auto p-8 relative">
        {/* Road Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-gray-200 -ml-1 z-0"></div>

        {scenarios.map((scenario, index) => {
          const locked = !isUnlocked(index)
          const stars = progress[scenario.id] || 0
          
          return (
            <div key={scenario.id} className="relative z-10 mb-16 flex flex-col items-center">
              {/* Level Node */}
              <button
                disabled={locked}
                onClick={() => navigate(`/chat/${scenario.id}`, { state: { scenarioId: scenario.id } })}
                className={`
                  w-20 h-20 rounded-full border-4 flex items-center justify-center shadow-xl transition-transform hover:scale-105
                  ${locked 
                    ? 'bg-gray-300 border-gray-400 grayscale cursor-not-allowed' 
                    : 'bg-white border-green-600 cursor-pointer'}
                `}
              >
                {locked ? <Icons.Lock /> : (
                  scenario.level === 1 ? <Icons.Airport /> :
                  scenario.level === 2 ? <Icons.Bus /> :
                  scenario.level === 3 ? <Icons.Market /> : <Icons.Village />
                )}
              </button>

              {/* Info Label */}
              <div className="mt-3 bg-white px-4 py-2 rounded-xl shadow-sm text-center border border-gray-100">
                <div className="font-bold text-gray-800">{scenario.title}</div>
                {!locked && (
                  <div className="flex justify-center mt-1 space-x-1">
                    {[1, 2, 3].map(i => <Icons.Star key={i} filled={i <= stars} />)}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}