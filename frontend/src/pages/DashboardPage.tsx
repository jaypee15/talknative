import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getScenarios, startConversation, Scenario } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

export default function DashboardPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [starting, setStarting] = useState<string | null>(null)
  
  const { signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    loadScenarios()
  }, [])

  const loadScenarios = async () => {
    try {
      const data = await getScenarios()
      setScenarios(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load scenarios')
    } finally {
      setLoading(false)
    }
  }

  const handleStartScenario = async (scenarioId: string) => {
    setStarting(scenarioId)
    try {
      const conversation = await startConversation(scenarioId)
      navigate(`/chat/${conversation.conversation_id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to start conversation')
      setStarting(null)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading scenarios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">TalkNative Dashboard</h1>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Choose a Scenario</h2>
          <p className="text-gray-600">Select a conversation scenario to practice your language skills</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-800">
            {error}
          </div>
        )}

        {scenarios.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No scenarios available. Please complete your onboarding first.
            </p>
            <button
              onClick={() => navigate('/onboarding')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Complete Onboarding
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {scenario.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(scenario.difficulty)}`}>
                      {scenario.difficulty}
                    </span>
                  </div>
                  
                  {scenario.description && (
                    <p className="text-gray-600 text-sm mb-4">
                      {scenario.description}
                    </p>
                  )}
                  
                  <button
                    onClick={() => handleStartScenario(scenario.id)}
                    disabled={starting === scenario.id}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                  >
                    {starting === scenario.id ? 'Starting...' : 'Start Conversation'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
