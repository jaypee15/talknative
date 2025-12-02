import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useReactMediaRecorder } from 'react-media-recorder'
import { sendTurn, getConversationTurns, saveWord, getScenarioById, Scenario, TurnResponse, finishScenario } from '../lib/api'
import PatienceMeter from '../components/PatienceMeter'
import HaggleTicker from '../components/HaggleTicker'
import CulturalAlert from '../components/CulturalAlert'
import ProverbCard from '../components/ProverbCard'

interface Turn {
  turn_number: number
  transcription: string
  ai_text: string
  ai_text_english: string | null
  ai_audio_url: string
  audio_available?: boolean | null
  audio_provider?: string | null
  audio_error?: string | null
  correction: string | null
  grammar_score: number | null
  user_audio_url?: string
  sentiment_score: number | null
  negotiated_price: number | null
}

export default function ChatPage() {
  const { id: conversationId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Data State
  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [turns, setTurns] = useState<Turn[]>([])
  
  // UI State
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [processingStage, setProcessingStage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [playingTurnNumber, setPlayingTurnNumber] = useState<number | null>(null)
  const [showTranslation, setShowTranslation] = useState<{[key: number]: boolean}>({})
  const [showCorrection, setShowCorrection] = useState<{[key: number]: boolean}>({})
  const [savingWord, setSavingWord] = useState<{[key: number]: boolean}>({})
  const [showHints, setShowHints] = useState(false)

  // Gamification State
  const [patience, setPatience] = useState(100)
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)
  const [lastSentiment, setLastSentiment] = useState<number | null>(null)
  const [gameStatus, setGameStatus] = useState<'active' | 'won' | 'lost'>('active')
  const [culturalFeedback, setCulturalFeedback] = useState<string | null>(null)
  const [wonLoot, setWonLoot] = useState<any | null>(null)
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)

  const { status, startRecording, stopRecording, mediaBlobUrl, clearBlobUrl } = useReactMediaRecorder({ 
    audio: true,
    mediaRecorderOptions: {
      mimeType: 'audio/webm;codecs=opus',
      audioBitsPerSecond: 32000,
    }
  })

  // 1. Load conversation history and scenario on mount
  useEffect(() => {
    const loadData = async () => {
      if (!conversationId) return
      
      try {
        setLoadingHistory(true)
        const history = await getConversationTurns(conversationId)
        // Cast the response to include gamification fields if they come from DB
        setTurns(history as Turn[])
        
        // Try to get scenario from location state or fetch it based on history/ID
        const stateScenarioId = (location.state as any)?.scenarioId
        
        if (stateScenarioId) {
          const scenarioData = await getScenarioById(stateScenarioId)
          setScenario(scenarioData)
        } else {
          // If we reloaded page, we might need a way to fetch scenario ID from the conversation
          // For MVP, we might rely on the user coming from dashboard, or add scenario_id to TurnResponse
          // This part assumes we can retrieve it or it was passed
        }
      } catch (err: any) {
        console.error('Failed to load history:', err)
        setError('Failed to load conversation history')
      } finally {
        setLoadingHistory(false)
      }
    }
    
    loadData()
  }, [conversationId, location.state])

  // 2. Initialize Gamification Settings when Scenario Loads
  useEffect(() => {
    if (scenario?.haggle_settings) {
      setCurrentPrice(scenario.haggle_settings.start_price)
    }
  }, [scenario])

  // 3. Patience Timer Logic
  useEffect(() => {
    if (gameStatus !== 'active') return

    const timer = setInterval(() => {
      setPatience(prev => {
        // Drain slower if recording (user is active), faster if idle
        const drain = status === 'recording' ? 0.2 : 0.5 
        const next = Math.max(0, prev - drain)
        
        if (next === 0) {
          setGameStatus('lost')
          clearInterval(timer)
        }
        return next
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [status, gameStatus])

  // 4. Handle AI Response updates (Gamification Logic)
  const handleTurnResponse = (response: TurnResponse) => {
    // Update Sentiment / Patience
    if (response.sentiment_score !== null && response.sentiment_score !== undefined) {
      setLastSentiment(response.sentiment_score)
      setPatience(prev => {
        // Sentiment -1.0 removes 15%, +1.0 adds 5%
        // If negative, damage is high. If positive, healing is small.
        const impact = response.sentiment_score! * (response.sentiment_score! < 0 ? 15 : 5)
        return Math.min(100, Math.max(0, prev + impact))
      })
    }

    // Update Price (For Market Scenarios)
    if (response.negotiated_price !== null && response.negotiated_price !== undefined) {
      setCurrentPrice(response.negotiated_price)

    if (response.cultural_flag) {
        setCulturalFeedback(response.cultural_feedback || "You broke a cultural rule!")
        // Optional: Damage patience heavily
        setPatience(prev => Math.max(0, prev - 25))
    }
      
      // Check Win Condition
      if (scenario?.haggle_settings && response.negotiated_price <= scenario.haggle_settings.target_price) {
        setGameStatus('won')
      }
    }
  }

  useEffect(() => {
    if (gameStatus === 'won' && scenario) {
        // Calculate stars based on patience left
        const stars = patience > 80 ? 3 : patience > 50 ? 2 : 1
        
        finishScenario(scenario.id, stars).then(res => {
            if (res.loot) {
                setWonLoot(res.loot) // Triggers ProverbCard
            }
        })
    }
}, [gameStatus])


  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [turns])

  // Audio Playback
  const playAudio = (url: string, turnNumber: number) => {
    if (audioElementRef.current) {
      audioElementRef.current.pause()
    }

    const audio = new Audio(url)
    audioElementRef.current = audio
    setAudioPlaying(true)
    setPlayingTurnNumber(turnNumber)

    audio.onended = () => {
      setAudioPlaying(false)
      setPlayingTurnNumber(null)
    }

    audio.onerror = () => {
      setAudioPlaying(false)
      setPlayingTurnNumber(null)
      setError('Failed to play audio')
    }

    audio.play().catch((err) => {
      setAudioPlaying(false)
      setPlayingTurnNumber(null)
      setError('Audio playback failed: ' + err.message)
    })
  }

  // Send Audio Handler
  const sendAudio = async () => {
    if (!mediaBlobUrl || !conversationId || gameStatus !== 'active') return

    setLoading(true)
    setError(null)

    try {
      setProcessingStage("Uploading audio...")
      const blob = await fetch(mediaBlobUrl).then((r) => r.blob())
      
      setProcessingStage("Processing your speech...")
      const response = await sendTurn(conversationId, blob)
      
      setProcessingStage("Generating response...")
      
      // Cast response to include gamification fields
      const fullResponse = response as Turn
      
      setTurns(prev => [...prev, fullResponse])
      handleTurnResponse(response)
      
      // Auto-play AI response
      if (response.ai_audio_url) {
        playAudio(response.ai_audio_url, response.turn_number)
      }
      
      clearBlobUrl()
    } catch (err: any) {
      setError(err.message || 'Failed to send audio')
    } finally {
      setLoading(false)
      setProcessingStage(null)
    }
  }

  // Toggles
  const toggleTranslation = (turnNumber: number) => {
    setShowTranslation(prev => ({
      ...prev,
      [turnNumber]: !prev[turnNumber]
    }))
  }

  const toggleCorrection = (turnNumber: number) => {
    setShowCorrection(prev => ({
      ...prev,
      [turnNumber]: !prev[turnNumber]
    }))
  }

  // Save Word Handler
  const handleSaveWord = async (turn: Turn) => {
    if (!turn.ai_text_english) return
    
    setSavingWord(prev => ({ ...prev, [turn.turn_number]: true }))
    
    try {
      await saveWord(
        turn.ai_text,
        turn.ai_text_english,
        turn.ai_text
      )
      alert('Word saved to vocabulary!')
    } catch (err: any) {
      if (err.message.includes('already saved')) {
        alert('This phrase is already in your vocabulary')
      } else {
        alert('Failed to save word: ' + err.message)
      }
    } finally {
      setSavingWord(prev => ({ ...prev, [turn.turn_number]: false }))
    }
  }

  if (loadingHistory) {
    return (
      <div className="flex flex-col h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </div>
    )
  }

  return (
    <>
    <CulturalAlert feedback={culturalFeedback} />
    {wonLoot && <ProverbCard proverb={wonLoot} onClose={() => setWonLoot(null)} />}
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Dashboard
          </button>
          <div className="text-center">
            <h1 className="text-lg font-semibold text-gray-900">
              {scenario?.title || 'Conversation'}
            </h1>
            {scenario?.mission && (
              <p className="text-xs text-gray-500 mt-1">🎯 {scenario.mission.objective}</p>
            )}
          </div>
          <button
            onClick={() => setShowHints(!showHints)}
            className="text-purple-600 hover:text-purple-700 font-medium text-sm px-3 py-1 rounded-lg hover:bg-purple-50 transition"
          >
            💡 {showHints ? 'Hide' : 'Hints'}
          </button>
        </div>
      </div>

      {/* GAMIFICATION HUD */}
      <div className="bg-white border-b border-gray-200 px-4 pt-4 pb-2 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto">
          
          {/* Status Messages */}
          {gameStatus === 'lost' && (
            <div className="bg-red-600 text-white p-3 rounded-lg text-center mb-4 font-bold animate-pulse">
              💔 SESSION FAILED: The seller lost patience!
            </div>
          )}
          {gameStatus === 'won' && (
            <div className="bg-green-600 text-white p-3 rounded-lg text-center mb-4 font-bold animate-bounce">
              🏆 SUCCESS: You got the deal!
            </div>
          )}

          {/* Patience Meter (Always visible) */}
          <PatienceMeter 
            level={patience} 
            sentiment={lastSentiment} 
            isRecording={status === 'recording'}
          />

          {/* Haggle Ticker (Only for Market Scenarios) */}
          {scenario?.category === 'Market' && scenario.haggle_settings && currentPrice !== null && (
            <HaggleTicker
              currentPrice={currentPrice}
              startPrice={scenario.haggle_settings.start_price}
              targetPrice={scenario.haggle_settings.target_price}
            />
          )}
        </div>
      </div>

      {/* Hints Panel */}
      {showHints && scenario?.key_vocabulary && scenario.key_vocabulary.length > 0 && (
        <div className="bg-purple-50 border-b border-purple-200 animate-in slide-in-from-top duration-300">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <h3 className="font-semibold text-purple-900 mb-3">📚 Key Vocabulary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {scenario.key_vocabulary.map((vocab, index) => (
                <div key={index} className="bg-white rounded-lg px-3 py-2 flex justify-between items-center shadow-sm">
                  <span className="font-medium text-gray-900">{vocab.word}</span>
                  <span className="text-gray-600 text-sm">{vocab.meaning}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
        <div className="max-w-4xl mx-auto space-y-6">
          {turns.map((turn) => (
            <div key={turn.turn_number} className="space-y-4">
              {/* User message */}
              <div className="flex justify-end">
                <div className="max-w-[85%] sm:max-w-[70%]">
                  <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-md">
                    <p className="text-sm">{turn.transcription}</p>
                  </div>
                  {turn.correction && turn.grammar_score && turn.grammar_score < 8 && (
                    <div className="mt-2 flex flex-col items-end">
                      <button
                        onClick={() => toggleCorrection(turn.turn_number)}
                        className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center bg-amber-50 px-2 py-1 rounded-md"
                      >
                        ✨ Grammar feedback
                      </button>
                      {showCorrection[turn.turn_number] && (
                        <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm text-amber-900 w-full animate-in fade-in">
                          {turn.correction}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* AI message */}
              <div className="flex justify-start">
                <div className="max-w-[85%] sm:max-w-[70%]">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      {audioPlaying && playingTurnNumber === turn.turn_number && (
                        <span className="text-xs text-blue-600 animate-pulse font-semibold">🔊 Speaking...</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-900 leading-relaxed">{turn.ai_text}</p>
                    <div className="mt-3 flex items-center gap-2 flex-wrap border-t border-gray-100 pt-2">
                      {turn.ai_audio_url && (
                        <button
                          onClick={() => playAudio(turn.ai_audio_url, turn.turn_number)}
                          disabled={audioPlaying && playingTurnNumber === turn.turn_number}
                          className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                        >
                          {audioPlaying && playingTurnNumber === turn.turn_number ? '⏸ Playing...' : '🔊 Replay'}
                        </button>
                      )}
                      {!turn.ai_audio_url && turn.audio_error && (
                        <span className="text-xs bg-gray-50 text-gray-600 px-3 py-1.5 rounded-full font-medium">
                          {turn.audio_error.includes('timeout')
                            ? 'Audio timed out'
                            : turn.audio_error.includes('model_overloaded')
                              ? 'Service busy'
                              : 'Audio unavailable'}
                        </span>
                      )}
                      <button
                        onClick={() => toggleTranslation(turn.turn_number)}
                        className="text-xs bg-gray-50 text-gray-600 px-3 py-1.5 rounded-full hover:bg-gray-100 font-medium transition-colors"
                      >
                        {showTranslation[turn.turn_number] ? 'Hide translation' : '🌐 Translation'}
                      </button>
                      {turn.ai_text_english && (
                        <button
                          onClick={() => handleSaveWord(turn)}
                          disabled={savingWord[turn.turn_number]}
                          className="text-xs bg-purple-50 text-purple-600 px-3 py-1.5 rounded-full hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                        >
                          {savingWord[turn.turn_number] ? 'Saving...' : '📚 Save'}
                        </button>
                      )}
                    </div>
                    {showTranslation[turn.turn_number] && turn.ai_text_english && (
                      <div className="mt-2 text-xs text-gray-600 italic bg-gray-50 p-2 rounded-md animate-in fade-in">
                        <span className="font-medium text-gray-500">Meaning:</span> {turn.ai_text_english}
                      </div>
                    )}
                  </div>
                  {turn.grammar_score === 10 && (
                    <div className="mt-1 text-xs text-green-600 flex items-center gap-1 font-medium px-2">
                      ✓ Perfect grammar!
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Processing indicator (thinking bubble) */}
          {processingStage && (
            <div className="flex justify-start">
              <div className="max-w-[70%]">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-sm text-gray-600 font-medium animate-pulse">{processingStage}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className={`bg-white border-t border-gray-200 px-4 py-4 ${gameStatus !== 'active' ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-800 text-sm flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-red-600 font-bold">✕</button>
            </div>
          )}

          <div className="flex items-center gap-3">
            {/* Recording status with visualizer */}
            <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Status: <span className={status === 'recording' ? 'text-red-600 font-bold' : 'text-gray-600'}>{status === 'recording' ? 'Recording...' : 'Ready'}</span>
                </span>
                {status === 'recording' && (
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
              </div>
              {/* Audio visualizer bars */}
              {status === 'recording' ? (
                <div className="flex items-center justify-center gap-1 h-8">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-gradient-to-t from-red-500 to-red-400 rounded-full"
                      style={{
                        height: '100%',
                        animation: `pulse ${0.5 + Math.random() * 0.5}s ease-in-out infinite`,
                        animationDelay: `${i * 0.05}s`,
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1 h-8 opacity-20">
                   {[...Array(12)].map((_, i) => (
                    <div key={i} className="w-1.5 bg-gray-400 rounded-full h-1" />
                   ))}
                </div>
              )}
            </div>

            {/* Control buttons */}
            <button
              onClick={startRecording}
              disabled={status === 'recording' || loading}
              className="bg-green-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md active:transform active:scale-95 flex items-center gap-2"
            >
              🎤 Record
            </button>
            
            <button
              onClick={stopRecording}
              disabled={status !== 'recording'}
              className="bg-red-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md active:transform active:scale-95"
            >
              ⏹ Stop
            </button>
            
            <button
              onClick={sendAudio}
              disabled={!mediaBlobUrl || loading}
              className="bg-blue-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md active:transform active:scale-95 flex items-center gap-2"
            >
              {loading ? '⏳ Sending...' : '📤 Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
