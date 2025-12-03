import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { updateUserProfile, Language, Proficiency } from '../lib/api'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [language, setLanguage] = useState<Language | null>(null)
  const [proficiency, setProficiency] = useState<Proficiency | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const navigate = useNavigate()
  const { user } = useAuth()

  const languages: { value: Language; label: string; flag: string }[] = [
    { value: 'yoruba', label: 'Yoruba', flag: '🇳🇬' },
    { value: 'hausa', label: 'Hausa', flag: '🇳🇬' },
    { value: 'igbo', label: 'Igbo', flag: '🇳🇬' },
  ]

  const levels: { value: Proficiency; label: string; description: string }[] = [
    { value: 'beginner', label: 'Beginner', description: 'Just starting out' },
    { value: 'intermediate', label: 'Intermediate', description: 'Can hold basic conversations' },
    { value: 'advanced', label: 'Advanced', description: 'Fluent speaker' },
  ]

  const handleSubmit = async () => {
    if (!language || !proficiency) return
    
    setLoading(true)
    setError(null)

    try {
      await updateUserProfile(language, proficiency)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-naija-paper bg-ankara-pattern">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <header className="flex items-center justify-between mb-12">
          <h1 className="text-2xl font-display font-bold text-naija-dark">TalkNative</h1>
          <button
            onClick={() => navigate(user ? '/dashboard' : '/')}
            className="px-4 py-2 rounded-lg bg-naija-primary text-white font-semibold hover:bg-green-700 transition"
          >
            {user ? 'Dashboard' : 'Home'}
          </button>
        </header>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-naija-dark mb-2">
              Welcome to TalkNative!
            </h1>
            <p className="text-gray-700">
              Let's personalize your learning experience
            </p>
          </div>

        {/* Progress indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`w-12 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-center mb-6">
              What language do you want to learn?
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {languages.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => setLanguage(lang.value)}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    language === lang.value
                      ? 'border-naija-adire bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-4xl">{lang.flag}</span>
                    <span className="text-xl font-semibold">{lang.label}</span>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!language}
              className="w-full mt-6 bg-naija-adire text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-center mb-6">
              What's your current level?
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {levels.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setProficiency(level.value)}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    proficiency === level.value
                      ? 'border-naija-adire bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-lg">{level.label}</div>
                  <div className="text-gray-600 text-sm">{level.description}</div>
                </button>
              ))}
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-red-50 text-red-800 text-sm">
                {error}
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!proficiency || loading}
                className="flex-1 bg-naija-adire text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Saving...' : 'Get Started'}
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
