import { Scenario } from '../lib/api'

interface ScenarioModalProps {
  scenario: Scenario
  onClose: () => void
  onStart: () => void
}

export default function ScenarioModal({ scenario, onClose, onStart }: ScenarioModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs font-medium">
                  {scenario.difficulty}
                </span>
                {scenario.category && (
                  <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs font-medium">
                    {scenario.category}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold">{scenario.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Scenario Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📖 Scenario</h3>
            <p className="text-gray-700">{scenario.description}</p>
          </div>

          {/* Roles */}
          {scenario.roles && (
            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🎭 Your Roles</h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-blue-700">You:</span>
                  <span className="text-gray-700 ml-2">{scenario.roles.user}</span>
                </div>
                <div>
                  <span className="font-medium text-purple-700">AI Character:</span>
                  <span className="text-gray-700 ml-2">{scenario.roles.ai}</span>
                </div>
              </div>
            </div>
          )}

          {/* Mission */}
          {scenario.mission && (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🎯 Your Mission</h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-amber-700">Objective:</span>
                  <p className="text-gray-700 mt-1">{scenario.mission.objective}</p>
                </div>
                <div>
                  <span className="font-medium text-amber-700">Success Condition:</span>
                  <p className="text-gray-700 mt-1">{scenario.mission.success_condition}</p>
                </div>
              </div>
            </div>
          )}

          {/* Key Vocabulary */}
          {scenario.key_vocabulary && scenario.key_vocabulary.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">📚 Cheat Sheet</h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                {scenario.key_vocabulary.map((vocab, index) => (
                  <div key={index} className="flex justify-between items-start py-2 border-b border-gray-200 last:border-0">
                    <span className="font-medium text-gray-900">{vocab.word}</span>
                    <span className="text-gray-600 text-sm text-right ml-4">{vocab.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 rounded-b-2xl flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={onStart}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition shadow-lg"
          >
            🚀 Start Mission
          </button>
        </div>
      </div>
    </div>
  )
}

