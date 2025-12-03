import { Scenario } from '../lib/api'
import { XIcon, UserIcon, RobotIcon, TargetIcon, BookOpenIcon, RocketLaunchIcon, WarningCircleIcon } from '@phosphor-icons/react'

interface ScenarioModalProps {
  scenario: Scenario
  onClose: () => void
  onStart: () => void
}

export default function ScenarioModal({ scenario, onClose, onStart }: ScenarioModalProps) {
  
  const getDifficultyColor = (diff: string) => {
    switch(diff) {
        case 'beginner': return 'bg-green-400 text-green-950';
        case 'intermediate': return 'bg-yellow-400 text-yellow-950';
        case 'advanced': return 'bg-red-400 text-red-950';
        default: return 'bg-gray-200';
    }
  }

  return (
    <div className="fixed inset-0 bg-naija-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-[#F9F7F2] rounded-[2.5rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-[6px] border-white relative">
        
        {/* Decorative Top Pattern */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-naija-primary bg-ankara-pattern opacity-10 rounded-t-[2rem] pointer-events-none"></div>

        {/* Header */}
        <div className="relative p-8 pb-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm ${getDifficultyColor(scenario.difficulty)}`}>
                  {scenario.difficulty}
                </span>
                {scenario.category && (
                  <span className="px-3 py-1 bg-white border border-gray-200 text-gray-500 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                    {scenario.category}
                  </span>
                )}
              </div>
              <h2 className="text-3xl font-display font-bold text-naija-dark leading-tight">
                {scenario.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full p-2 transition shadow-sm border border-gray-100"
            >
              <XIcon size={24} weight="bold" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-8 space-y-8">
          
          {/* Scenario Description */}
          <div className="text-gray-600 text-lg leading-relaxed font-medium">
            {scenario.description}
          </div>

          {/* Roles - Split Card Design */}
          {scenario.roles && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* User Role */}
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <UserIcon size={64} weight="fill" className="text-naija-primary" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2 text-naija-primary font-bold font-display uppercase tracking-wide text-sm">
                        <UserIcon size={18} weight="bold" />
                        You
                    </div>
                    <p className="text-naija-dark font-medium leading-snug">{scenario.roles.user}</p>
                </div>
              </div>

              {/* AI Role */}
              <div className="bg-naija-adire p-5 rounded-3xl shadow-sm relative overflow-hidden text-white group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <RobotIcon size={64} weight="fill" className="text-white" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2 text-indigo-200 font-bold font-display uppercase tracking-wide text-sm">
                        <RobotIcon size={18} weight="bold" />
                        The AI
                    </div>
                    <p className="text-indigo-50 font-medium leading-snug">{scenario.roles.ai}</p>
                </div>
              </div>
            </div>
          )}

          {/* Mission Ticket */}
          {scenario.mission && (
            <div className="relative bg-amber-50 rounded-3xl border-2 border-dashed border-amber-200 p-6">
              <div className="absolute -top-3 left-6 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 border border-amber-200">
                <TargetIcon size={16} weight="fill" />
                Mission Objective
              </div>
              
              <div className="space-y-4 pt-2">
                <div>
                  <h4 className="font-bold text-naija-dark mb-1">Your Goal</h4>
                  <p className="text-gray-700">{scenario.mission.objective}</p>
                </div>
                
                <div className="flex gap-3 items-start bg-white/50 p-3 rounded-xl border border-amber-100">
                    <div className="mt-0.5 text-amber-600">
                        <WarningCircleIcon size={20} weight="duotone" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-amber-600 uppercase">Win Condition</span>
                        <p className="text-sm text-gray-600 leading-snug">{scenario.mission.success_condition}</p>
                    </div>
                </div>
              </div>
            </div>
          )}

          {/* Cheat Sheet */}
          {scenario.key_vocabulary && scenario.key_vocabulary.length > 0 && (
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-4 text-gray-400 font-bold uppercase tracking-widest text-xs">
                <BookOpenIcon size={18} weight="duotone" />
                Cheat Sheet
              </div>
              <div className="grid gap-3">
                {scenario.key_vocabulary.map((vocab, index) => (
                  <div key={index} className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                    <span className="font-bold text-naija-dark">{vocab.word}</span>
                    <span className="text-sm text-gray-500">{vocab.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="p-6 pt-0 bg-gradient-to-t from-[#F9F7F2] to-transparent sticky bottom-0 z-20">
            <button
                onClick={onStart}
                className="w-full py-4 bg-naija-primary hover:bg-green-800 text-white rounded-2xl font-bold font-display text-lg shadow-xl shadow-green-900/20 transform transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
            >
                <RocketLaunchIcon size={24} weight="fill" />
                Start Mission
            </button>
        </div>
      </div>
    </div>
  )
}