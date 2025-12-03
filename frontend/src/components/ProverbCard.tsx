interface Proverb {
    content: string
    literal_translation: string
    meaning: string
    rarity: 'common' | 'rare' | 'legendary'
}
  
export default function ProverbCard({ proverb, onClose }: { proverb: Proverb, onClose: () => void }) {
    const getColors = () => {
      if (proverb.rarity === 'legendary') return 'from-yellow-400 via-yellow-500 to-yellow-600 shadow-yellow-500/50'
      if (proverb.rarity === 'rare') return 'from-purple-400 via-purple-500 to-purple-600 shadow-purple-500/50'
      return 'from-gray-200 via-gray-300 to-gray-400 text-gray-800'
    }
  
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
        <div className={`w-full max-w-sm bg-gradient-to-br ${getColors()} p-1.5 rounded-[2.5rem] shadow-2xl transform transition-all animate-card-reveal rotate-1 hover:rotate-0`}>
          
          {/* Inner Content - Physical Card Look */}
          <div className="bg-[#FAF9F6] rounded-[2.2rem] p-8 h-full text-center relative overflow-hidden border-[6px] border-white/40 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] shadow-inner">
            
            {/* Decorative Corner Patterns */}
            <div className="absolute top-0 left-0 w-20 h-20 border-t-[8px] border-l-[8px] border-naija-primary/20 rounded-tl-[1.8rem]"></div>
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b-[8px] border-r-[8px] border-naija-primary/20 rounded-br-[1.8rem]"></div>

            {/* Rarity Badge */}
            <div className={`absolute top-6 right-6 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm
                ${proverb.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-600'}
            `}>
              {proverb.rarity}
            </div>
  
            <div className="mt-12 mb-8 relative z-10">
              <i className="ph-fill ph-quotes text-4xl text-naija-accent/20 mb-4 block mx-auto"></i>
              <h2 className="text-3xl font-display font-bold mb-6 text-naija-dark leading-tight">
                {proverb.content}
              </h2>
              <p className="text-sm font-medium text-gray-500 italic mb-6 font-serif">
                "{proverb.literal_translation}"
              </p>
            </div>
  
            <div className="bg-naija-adire/5 p-5 rounded-2xl mb-8 border border-naija-adire/10 relative z-10">
              <p className="text-xs uppercase font-bold text-naija-adire mb-2 tracking-widest">Ancient Wisdom</p>
              <p className="text-naija-dark font-medium leading-relaxed">{proverb.meaning}</p>
            </div>
  
            <button 
              onClick={onClose}
              className="w-full bg-naija-dark text-white py-4 rounded-2xl font-bold hover:bg-black transition shadow-lg shadow-black/20 flex items-center justify-center gap-2 group"
            >
              <span>Collect Wisdom</span>
              <i className="ph-bold ph-check-circle text-xl group-hover:scale-110 transition-transform"></i>
            </button>
          </div>
        </div>
        <style>{`
          @keyframes card-reveal {
            0% { opacity: 0; transform: translateY(100px) rotateY(90deg) scale(0.8); }
            100% { opacity: 1; transform: translateY(0) rotateY(0) scale(1); }
          }
          .animate-card-reveal { animation: card-reveal 0.8s cubic-bezier(0.2, 0.8, 0.2, 1); }
        `}</style>
      </div>
    )
  }