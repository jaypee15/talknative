import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getWisdomDeck } from '../lib/api'

export default function WisdomDeckPage() {
  const [cards, setCards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    setError(null)
    getWisdomDeck()
      .then(setCards)
      .catch((e: any) => setError(e?.message || 'Failed to load deck'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif text-yellow-500">Ancient Wisdom</h1>
        <button onClick={() => navigate('/dashboard')} className="text-gray-400">Back</button>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-40 text-gray-400">Loading deck...</div>
      )}

      {!loading && error && (
        <div className="bg-red-800 text-red-100 p-4 rounded-lg">{error}</div>
      )}

      {!loading && !error && cards.length === 0 && (
        <div className="max-w-xl mx-auto text-center bg-gray-800 border border-gray-700 p-8 rounded-2xl">
          <div className="text-4xl mb-2">🃏</div>
          <div className="text-yellow-400 font-bold text-lg mb-1">No wisdom cards yet</div>
          <p className="text-gray-300 mb-4">Finish scenarios with at least 2 stars to earn proverbs.</p>
          <button onClick={() => navigate('/dashboard')} className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-4 py-2 rounded-lg">Find a scenario</button>
        </div>
      )}

      {!loading && !error && cards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div key={card.id} className="bg-gray-800 border border-gray-700 p-6 rounded-xl">
              <div className="text-xs uppercase tracking-widest text-gray-500 mb-2">{card.rarity}</div>
              <h3 className="text-xl font-bold mb-2 text-yellow-100">{card.content}</h3>
              <p className="text-sm italic text-gray-400 mb-4">"{card.literal_translation}"</p>
              <div className="bg-black/30 p-3 rounded">
                <p className="text-sm text-gray-300">{card.meaning}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
