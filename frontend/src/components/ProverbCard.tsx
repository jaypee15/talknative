interface Proverb {
    content: string
    literal_translation: string
    meaning: string
    rarity: 'common' | 'rare' | 'legendary'
  }
  
  export default function ProverbCard({ proverb, onClose }: { proverb: Proverb, onClose: () => void }) {
    const getColors = () => {
      if (proverb.rarity === 'legendary') return 'from-yellow-400 to-yellow-600 border-yellow-200'
      if (proverb.rarity === 'rare') return 'from-purple-400 to-purple-600 border-purple-200'
      return 'from-gray-100 to-gray-300 border-gray-400 text-gray-800'
    }
  
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
        <div className={`w-full max-w-sm bg-gradient-to-br ${getColors()} p-1 rounded-2xl shadow-2xl transform transition-all animate-card-reveal`}>
          <div className="bg-white/95 rounded-xl p-6 h-full text-center relative overflow-hidden">
            {/* Rarity Badge */}
            <div className="absolute top-4 right-4 text-xs font-bold uppercase tracking-widest opacity-50">
              {proverb.rarity}
            </div>
  
            <div className="mb-6 mt-4">
              <h2 className="text-3xl font-bold mb-4 font-serif text-gray-900">{proverb.content}</h2>
              <p className="text-sm text-gray-500 italic mb-6">"{proverb.literal_translation}"</p>
            </div>
  
            <div className="bg-black/5 p-4 rounded-lg mb-6">
              <p className="text-xs uppercase font-bold text-gray-500 mb-1">Deep Meaning</p>
              <p className="text-gray-800 font-medium">{proverb.meaning}</p>
            </div>
  
            <button 
              onClick={onClose}
              className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-900 transition"
            >
              Collect Wisdom
            </button>
          </div>
        </div>
        <style>{`
          @keyframes card-reveal {
            0% { opacity: 0; transform: translateY(50px) rotateY(90deg); }
            100% { opacity: 1; transform: translateY(0) rotateY(0); }
          }
          .animate-card-reveal { animation: card-reveal 0.8s ease-out; }
        `}</style>
      </div>
    )
  }