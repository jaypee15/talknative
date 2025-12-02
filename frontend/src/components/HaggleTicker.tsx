interface HaggleTickerProps {
    currentPrice: number
    startPrice: number
    targetPrice: number
    currencySymbol?: string
  }
  
  export default function HaggleTicker({ 
    currentPrice, 
    startPrice, 
    targetPrice, 
    currencySymbol = '₦' 
  }: HaggleTickerProps) {
    
    // Calculate progress towards target (inverse logic: lower price is better)
    const totalRange = startPrice - targetPrice
    const currentProgress = startPrice - currentPrice
    const percentage = Math.min(100, Math.max(0, (currentProgress / totalRange) * 100))
  
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 rounded-xl shadow-lg border border-gray-700 mb-4 transform transition-all">
        <div className="flex justify-between items-end mb-2">
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-widest">Current Price</p>
            <div className="text-4xl font-mono font-bold text-green-400">
              {currencySymbol}{currentPrice.toLocaleString()}
            </div>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs uppercase">Target</p>
            <p className="text-xl font-mono text-white">{currencySymbol}{targetPrice.toLocaleString()}</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500 transition-all duration-1000 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {currentPrice <= targetPrice && (
          <div className="mt-2 text-center text-xs bg-green-900 text-green-200 py-1 rounded animate-bounce">
            🎉 DEAL REACHED!
          </div>
        )}
      </div>
    )
  }