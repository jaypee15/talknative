import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getUserProfile } from '../lib/api'

export default function LandingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [onboarded, setOnboarded] = useState<boolean | null>(null)

  useEffect(() => {
    if (!user) {
      setOnboarded(null)
      return
    }
    getUserProfile()
      .then(p => setOnboarded(Boolean(p.target_language && p.proficiency_level)))
      .catch(() => setOnboarded(null))
  }, [user])

  return (
    <div className="min-h-screen bg-naija-paper bg-ankara-pattern">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <header className="flex items-center justify-between mb-16">
          <h1 className="text-2xl font-display font-bold text-naija-dark">TalkNative</h1>
          <button
            onClick={() => navigate(user ? (onboarded ? '/dashboard' : '/onboarding') : '/login')}
            className="px-4 py-2 rounded-lg bg-naija-primary text-white font-semibold hover:bg-green-700 transition"
          >
            {user ? (onboarded ? 'Dashboard' : 'Onboarding') : 'Sign In'}
          </button>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-naija-dark leading-tight mb-4">
              Learn Yoruba, Hausa, and Igbo through conversation
            </h2>
            <p className="text-gray-700 text-lg mb-8">
              Practice with culturally-aware scenarios, get instant feedback, and earn wisdom cards as you improve.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => navigate(user ? (onboarded ? '/dashboard' : '/onboarding') : '/login')}
                className="px-6 py-3 rounded-xl bg-naija-adire text-white font-bold hover:opacity-90 transition"
              >
                {user ? (onboarded ? 'Dashboard' : 'Onboarding') : 'Get Started'}
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 rounded-xl bg-white border border-gray-200 text-naija-dark font-semibold hover:bg-gray-50 transition"
              >
                Browse Scenarios
              </button>
            </div>
          </div>
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
                <div className="text-sm font-bold text-green-800">Live Practice</div>
                <div className="text-gray-700 text-sm">Speak and get corrections instantly</div>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                <div className="text-sm font-bold text-amber-800">Cultural Cues</div>
                <div className="text-gray-700 text-sm">Learn local etiquette</div>
              </div>
              <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4">
                <div className="text-sm font-bold text-purple-800">Wisdom Deck</div>
                <div className="text-gray-700 text-sm">Collect proverbs as you progress</div>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                <div className="text-sm font-bold text-blue-800">Guided Goals</div>
                <div className="text-gray-700 text-sm">Scenario-based missions</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
