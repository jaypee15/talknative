import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getWisdomDeck } from '../lib/api'

export default function WisdomDeckPage() {
  const [cards, setCards] = useState<any[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    getWisdomDeck().then(setCards)
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif text-yellow-500">Ancient Wisdom</h1>
        <button onClick={() => navigate('/dashboard')} className="text-gray-400">Back</button>
      </div>

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
    </div>
  )
}