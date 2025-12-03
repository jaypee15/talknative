import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getScenarios, getUserProgress, getUserProfile, Scenario } from '../lib/api'
import ScenarioModal from '../components/ScenarioModal'
import { LockIcon, StarIcon, AirplaneIcon, BusIcon, BasketIcon, HouseIcon, CardsIcon, MapPinIcon } from '@phosphor-icons/react'


export default function MapDashboard() {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [progress, setProgress] = useState<any>({})
  const [selected, setSelected] = useState<Scenario | null>(null)
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    getUserProfile().then((profile) => {
      if (!profile.target_language || !profile.proficiency_level) {
        navigate('/onboarding', { replace: true })
      }
    }).catch(() => {})
  }, [])

  useEffect(() => {
    Promise.all([getScenarios(), getUserProgress()]).then(([sData, pData]) => {
      // Sort: Ensure scenarios with undefined levels go to the end, then sort by level
      const sorted = sData.sort((a: any, b: any) => (a.level || 99) - (b.level || 99))
      setScenarios(sorted)
      
      const pMap = pData.reduce((acc: any, curr: any) => ({
        ...acc, [curr.scenario_id]: curr.stars
      }), {})
      setProgress(pMap)
    })
  }, [])

  const isUnlocked = (index: number) => {
    if (index === 0) return true
    const prevId = scenarios[index - 1].id
    return (progress[prevId] || 0) >= 1
  }

  // Icons Helper
  const renderIcon = (level: number, locked: boolean) => {
    if (locked) return <LockIcon size={32} weight="fill" className="text-gray-400" />
    switch(level) {
        case 1: return <AirplaneIcon size={32} weight="fill" className="text-naija-primary" />
        case 2: return <BusIcon size={32} weight="fill" className="text-naija-primary" />
        case 3: return <BasketIcon size={32} weight="fill" className="text-naija-primary" />
        case 4: return <HouseIcon size={32} weight="fill" className="text-naija-primary" />
        case 5: return <HouseIcon size={32} weight="fill" className="text-naija-primary" />
        default: return <MapPinIcon size={32} weight="fill" className="text-naija-primary" />
    }
  }

  return (
    <div className="min-h-screen bg-naija-paper bg-ankara-pattern pb-24 overflow-x-hidden relative">
      {/* Header */}
      <div className="bg-naija-primary text-white p-6 shadow-xl rounded-b-[2.5rem] sticky top-0 z-20 border-b-4 border-naija-secondary">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <div>
            <h1 className="text-2xl font-bold font-display tracking-wide">Naija Tour 🇳🇬</h1>
            <p className="text-naija-secondary text-sm font-medium opacity-90">
              Level {Object.keys(progress).length + 1} Traveler
            </p>
          </div>
          <button 
            onClick={() => navigate('/wisdom')} 
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 border border-white/20 transition-all active:scale-95"
          >
            <CardsIcon size={24} weight="fill" className="text-naija-secondary" />
            <span className="font-medium text-sm">Loot</span>
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto p-8 relative mt-8">
        {/* Winding Road SVG Background - Tweaked Curve */}
        <svg className="absolute left-0 top-0 w-full h-full z-0 pointer-events-none opacity-10" preserveAspectRatio="none">
          <path 
            d="M50,0 C50,100 250,200 50,350 C-150,500 250,650 50,800 C-150,950 250,1100 50,1250" 
            stroke="#2E7D32" 
            strokeWidth="60" 
            fill="none" 
            strokeDasharray="20 20" 
            strokeLinecap="round"
          />
        </svg>

        <div className="relative z-10 flex flex-col items-center space-y-24 pt-4">
          {scenarios.map((scenario, index) => {
            const locked = !isUnlocked(index)
            const stars = progress[scenario.id] || 0
            // Zigzag logic
            const offsetClass = index % 2 === 0 ? 'translate-x-12' : '-translate-x-12'
            
            return (
              <div key={scenario.id} className={`flex flex-col items-center ${offsetClass} transition-all duration-500`}>
                
                {/* Scenario Node */}
                <button
                  disabled={locked}
                  onClick={() => { setSelected(scenario); setShowModal(true) }}
                  className={`
                    group relative w-24 h-24 rounded-3xl rotate-45 border-[6px] flex items-center justify-center shadow-2xl transition-all duration-300
                    ${locked 
                      ? 'bg-gray-200 border-gray-300 grayscale cursor-not-allowed' 
                      : 'bg-gradient-to-br from-white to-naija-paper border-naija-primary hover:scale-110 hover:rotate-[50deg] cursor-pointer ring-4 ring-naija-primary/20'}
                  `}
                >
                  {/* Un-rotate content */}
                  <div className="-rotate-45 flex flex-col items-center justify-center transform transition-transform group-hover:scale-110">
                    {renderIcon(scenario.level, locked)}
                  </div>
                  
                  {/* Completion Checkmark */}
                  {stars >= 1 && (
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-naija-secondary rounded-full flex items-center justify-center -rotate-45 border-2 border-white shadow-sm z-20">
                      <StarIcon size={16} weight="fill" className="text-naija-dark" />
                    </div>
                  )}
                </button>

                {/* Label Badge */}
                <div className={`
                  mt-8 px-5 py-3 bg-white rounded-2xl shadow-xl border border-gray-100 text-center min-w-[160px]
                  transition-all duration-300 transform relative z-20
                  ${locked ? 'opacity-50 grayscale' : 'hover:-translate-y-1'}
                `}>
                  {/* Little arrow pointing up to diamond */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-t border-l border-gray-100"></div>
                  
                  <div className="font-bold text-naija-dark text-sm mb-1 font-display leading-tight">{scenario.title}</div>
                  {!locked && (
                    <div className="flex justify-center gap-1 bg-gray-50 rounded-full py-1 px-2 w-fit mx-auto border border-gray-100">
                      {[1, 2, 3].map(i => (
                        <StarIcon key={i} size={12} weight="fill" className={i <= stars ? "text-naija-secondary" : "text-gray-200"} />
                      ))}
                  </div>
                )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      {showModal && selected && (
        <ScenarioModal 
          scenario={selected}
          onClose={() => setShowModal(false)}
          onStart={() => { setShowModal(false); navigate(`/chat/${selected.id}`, { state: { scenarioId: selected.id } }) }}
        />
      )}
    </div>
  )
}
