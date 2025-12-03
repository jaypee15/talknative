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
  correction: string | null
  grammar_score: number | null
  user_audio_url?: string
  sentiment_score: number | null
  negotiated_price: number | null
  cultural_flag?: boolean
  cultural_feedback?: string | null
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
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)

  const { status, startRecording, stopRecording, mediaBlobUrl, clearBlobUrl } = useReactMediaRecorder({ 
    audio: true,
    mediaRecorderOptions: {
      mimeType: 'audio/webm;codecs=opus',
      audioBitsPerSecond: 32000,
    }
  })

  // Load History
  useEffect(() => {
    const loadData = async () => {
      if (!conversationId) return
      try {
        setLoadingHistory(true)
        const history = await getConversationTurns(conversationId)
        setTurns(history as Turn[])
        
        const stateScenarioId = (location.state as any)?.scenarioId
        if (stateScenarioId) {
          const scenarioData = await getScenarioById(stateScenarioId)
          setScenario(scenarioData)
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

  // Initialize Logic
  useEffect(() => {
    if (scenario?.haggle_settings) {
      setCurrentPrice(scenario.haggle_settings.start_price)
    }
  }, [scenario])

  useEffect(() => {
    if (gameStatus !== 'active') return
    const timer = setInterval(() => {
      setPatience(prev => {
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

  // Win Condition
  useEffect(() => {
    if (gameStatus === 'won' && scenario) {
        const stars = patience > 80 ? 3 : patience > 50 ? 2 : 1
        finishScenario(scenario.id, stars).then(res => {
            if (res.loot) setWonLoot(res.loot)
        })
    }
  }, [gameStatus])

  // Response Handler
  const handleTurnResponse = (response: TurnResponse) => {
    if (response.sentiment_score !== null) {
      setLastSentiment(response.sentiment_score)
      setPatience(prev => {
        const impact = response.sentiment_score! * (response.sentiment_score! < 0 ? 15 : 5)
        return Math.min(100, Math.max(0, prev + impact))
      })
    }
    if (response.negotiated_price !== null) {
      setCurrentPrice(response.negotiated_price)
      if (scenario?.haggle_settings && response.negotiated_price <= scenario.haggle_settings.target_price) {
        setGameStatus('won')
      }
    }
    if (response.cultural_flag) {
        setCulturalFeedback(response.cultural_feedback || "You broke a cultural rule!")
        setPatience(prev => Math.max(0, prev - 25))
    }
  }

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  useEffect(() => scrollToBottom(), [turns])

  const playAudio = (url: string, turnNumber: number) => {
    if (audioElementRef.current) audioElementRef.current.pause()
    const audio = new Audio(url)
    audioElementRef.current = audio
    setAudioPlaying(true)
    setPlayingTurnNumber(turnNumber)
    audio.onended = () => { setAudioPlaying(false); setPlayingTurnNumber(null) }
    audio.onerror = () => { setAudioPlaying(false); setPlayingTurnNumber(null); setError('Failed to play audio') }
    audio.play().catch((err) => { setAudioPlaying(false); setPlayingTurnNumber(null); setError('Playback failed') })
  }

  const sendAudio = async () => {
    if (!mediaBlobUrl || !conversationId || gameStatus !== 'active') return
    setLoading(true)
    setError(null)
    try {
      setProcessingStage("Processing...")
      const blob = await fetch(mediaBlobUrl).then((r) => r.blob())
      const response = await sendTurn(conversationId, blob)
      setTurns(prev => {
        const r = response as Turn
        const idx = prev.findIndex(t => t.turn_number === r.turn_number)
        if (idx !== -1) {
          const next = prev.slice()
          next[idx] = r
          return next
        }
        return [...prev, r]
      })
      handleTurnResponse(response)
      if (response.ai_audio_url) playAudio(response.ai_audio_url, response.turn_number)
      clearBlobUrl()
    } catch (err: any) {
      setError(err.message || 'Failed to send audio')
    } finally {
      setLoading(false)
      setProcessingStage(null)
    }
  }

  const toggleTranslation = (turnNumber: number) => {
    setShowTranslation(prev => ({ ...prev, [turnNumber]: !prev[turnNumber] }))
  }
  const toggleCorrection = (turnNumber: number) => {
    setShowCorrection(prev => ({ ...prev, [turnNumber]: !prev[turnNumber] }))
  }
  const handleSaveWord = async (turn: Turn) => {
    if (!turn.ai_text_english) return
    setSavingWord(prev => ({ ...prev, [turn.turn_number]: true }))
    try {
      await saveWord(turn.ai_text, turn.ai_text_english, turn.ai_text)
      // We might want a toast here
    } catch (err: any) {
      console.error(err)
    } finally {
      setSavingWord(prev => ({ ...prev, [turn.turn_number]: false }))
    }
  }

  if (loadingHistory) return (
    <div className="flex flex-col h-screen bg-naija-paper items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-naija-primary mx-auto mb-4"></div>
      <p className="text-naija-dark font-medium">Loading conversation...</p>
    </div>
  )

  return (
      <div className="flex flex-col h-screen bg-naija-paper bg-ankara-pattern">
        <CulturalAlert feedback={culturalFeedback} />
        {wonLoot && <ProverbCard proverb={wonLoot} onClose={() => setWonLoot(null)} />}
  
        {/* 1. Header: Glassmorphism effect */}
        <div className="bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-3 shadow-sm sticky top-0 z-20">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-full transition group">
              <i className="ph-bold ph-arrow-left text-xl text-naija-dark group-hover:-translate-x-1 transition-transform"></i>
            </button>
            <div className="text-center">
              {/* Font Display for bold cultural feel */}
              <h1 className="font-display font-bold text-lg text-naija-dark leading-tight">{scenario?.title}</h1>
              <div className="flex items-center justify-center gap-1.5 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-naija-primary"></span>
                </span>
                <span className="text-xs text-gray-500 font-medium tracking-wide uppercase">Live Scenario</span>
              </div>
            </div>
            <button 
              onClick={() => setShowHints(!showHints)} 
              className={`p-2 rounded-full transition-all ${showHints ? 'bg-naija-adire text-white shadow-lg shadow-indigo-500/30' : 'hover:bg-gray-100 text-naija-adire'}`}
            >
              <i className={`ph-fill ph-lightbulb text-xl ${showHints ? 'animate-pulse' : ''}`}></i>
            </button>
          </div>
        </div>
  
        {/* 2. Gamification Bar */}
        <div className="bg-white/80 backdrop-blur border-b border-gray-100 px-4 py-2 sticky top-[62px] z-10">
          <div className="max-w-3xl mx-auto">
             <PatienceMeter level={patience} sentiment={lastSentiment} isRecording={status === 'recording'} />
          </div>
        </div>
  
        {/* 3. Hints Drawer */}
        {showHints && scenario?.key_vocabulary && (
          <div className="bg-naija-adire text-white p-4 animate-in slide-in-from-top-2 border-b border-indigo-900 sticky top-[110px] z-10 shadow-xl">
              <div className="max-w-3xl mx-auto">
                  <h3 className="font-display font-bold mb-3 text-sm uppercase tracking-widest text-indigo-200">Cheat Sheet</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {scenario.key_vocabulary.map((vocab, i) => (
                          <div key={i} className="flex justify-between items-center bg-white/10 p-2 rounded-lg backdrop-blur-sm border border-white/10">
                              <span className="font-bold">{vocab.word}</span>
                              <span className="text-sm opacity-80">{vocab.meaning}</span>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
        )}
  
        {/* Ticker Overlay */}
        {scenario?.category === 'Market' && scenario.haggle_settings && currentPrice !== null && (
            <div className="absolute top-32 right-4 z-20 w-40 animate-in slide-in-from-right fade-in duration-500">
                 <HaggleTicker currentPrice={currentPrice} startPrice={scenario.haggle_settings.start_price} targetPrice={scenario.haggle_settings.target_price} />
            </div>
        )}
  
        {/* 4. Chat Area: Updated Bubbles */}
        <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
          <div className="max-w-3xl mx-auto space-y-8">
            
            {/* Mission Capsule */}
            <div className="flex justify-center">
                <span className="bg-white/80 backdrop-blur-sm border border-gray-200 px-4 py-1.5 rounded-full text-xs text-gray-500 font-medium shadow-sm">
                    🎯 Mission: {scenario?.mission?.objective}
                </span>
            </div>
  
            {turns.map((turn) => (
              <div key={turn.turn_number} className="space-y-6">
                  {/* User Message (Right) - Using Naija Adire Color */}
                  <div className="flex flex-col items-end pl-12">
                      <div className="bg-naija-adire text-white rounded-2xl rounded-tr-sm px-6 py-4 shadow-lg shadow-indigo-900/10 border border-indigo-900 relative group">
                          <p className="text-base font-sans leading-relaxed">{turn.transcription}</p>
                          
                          {/* Grammar Badge */}
                          {turn.grammar_score && turn.grammar_score < 10 && (
                              <button 
                                  onClick={() => toggleCorrection(turn.turn_number)} 
                                  className="absolute -bottom-3 -right-2 bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full border border-red-100 shadow-sm hover:scale-105 transition-transform flex items-center gap-1"
                              >
                                  <i className="ph-bold ph-warning-circle"></i> Fix Grammar
                              </button>
                          )}
                      </div>
                      {showCorrection[turn.turn_number] && (
                          <div className="mt-4 mr-2 bg-white border-l-4 border-red-400 p-4 rounded-r-xl shadow-md text-sm text-gray-700 animate-in fade-in slide-in-from-top-2 max-w-sm">
                              <span className="block text-xs font-bold text-red-500 uppercase tracking-wider mb-1">Correction</span>
                              {turn.correction}
                          </div>
                      )}
                  </div>
  
                  {/* AI Message (Left) */}
                  <div className="flex flex-col items-start pr-12">
                      <div className="flex items-end gap-3">
                          {/* Avatar */}
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-naija-primary to-green-800 flex items-center justify-center text-white font-bold ring-4 ring-white shadow-md z-10">
                              AI
                          </div>
                          <div className="bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm px-6 py-4 shadow-lg shadow-gray-200/50 relative">
                              <p className="text-base font-sans leading-relaxed">{turn.ai_text}</p>
                              
                              {/* Action Bar */}
                              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                                  <button 
                                      onClick={() => playAudio(turn.ai_audio_url, turn.turn_number)} 
                                      disabled={audioPlaying && playingTurnNumber === turn.turn_number}
                                      className={`p-2 rounded-full transition-colors ${audioPlaying && playingTurnNumber === turn.turn_number ? 'bg-naija-primary text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                  >
                                      <i className={`ph-fill ${audioPlaying && playingTurnNumber === turn.turn_number ? 'ph-pause' : 'ph-speaker-high'}`}></i>
                                  </button>
                                  <button 
                                      onClick={() => toggleTranslation(turn.turn_number)} 
                                      className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs font-bold text-gray-500 uppercase tracking-wide transition-colors"
                                  >
                                      Translate
                                  </button>
                                  {turn.ai_text_english && (
                                      <button 
                                          onClick={() => handleSaveWord(turn)}
                                          disabled={savingWord[turn.turn_number]}
                                          className="ml-auto text-gray-400 hover:text-naija-adire transition-colors"
                                      >
                                          <i className={`ph-fill ${savingWord[turn.turn_number] ? 'ph-check' : 'ph-bookmark-simple'} text-lg`}></i>
                                      </button>
                                  )}
                              </div>
                          </div>
                      </div>
                      
                      {showTranslation[turn.turn_number] && (
                          <div className="mt-3 ml-14 p-4 bg-yellow-50/80 border border-yellow-100 rounded-xl text-sm text-yellow-900 animate-in fade-in slide-in-from-top-1 backdrop-blur-sm">
                              <span className="block text-xs font-bold text-yellow-600 uppercase mb-1 opacity-75">English</span>
                              {turn.ai_text_english}
                          </div>
                      )}
                  </div>
              </div>
            ))}
            
            {/* Loading Indicator */}
            {loading && (
                <div className="flex justify-start pl-12 animate-pulse">
                    <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-6 py-4 flex gap-1.5 items-center">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                        <span className="ml-2 text-xs font-medium text-gray-500 uppercase tracking-wide">{processingStage || 'Thinking'}</span>
                    </div>
                </div>
            )}
            
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>
  
        {/* 5. Footer: Dynamic Island Input */}
        <div className="bg-white border-t border-gray-200 p-4 safe-area-bottom shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
            <div className="max-w-3xl mx-auto flex items-center gap-4">
                {/* Dynamic Island Recorder */}
                <div className={`flex-1 h-16 rounded-[2rem] border-2 flex items-center px-6 justify-between relative overflow-hidden transition-all duration-300 ${status === 'recording' ? 'bg-red-50 border-red-100 shadow-inner' : 'bg-gray-50 border-transparent'}`}>
                    {status === 'recording' ? (
                        <>
                            <div className="flex items-center gap-3 z-10">
                                <span className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>
                                <span className="text-red-600 font-bold font-display tracking-wide">Recording...</span>
                            </div>
                            {/* Audio Waves Visualizer */}
                            <div className="flex gap-1 h-8 items-center z-10">
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className="w-1.5 bg-red-400/60 rounded-full animate-[bounce_1s_infinite]" style={{height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 0.05}s`}}></div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <span className="text-gray-400 font-medium">Tap microphone to speak...</span>
                    )}
                </div>
  
                {/* Action Button */}
                {status === 'recording' ? (
                    <button onClick={stopRecording} className="h-16 w-16 bg-red-500 hover:bg-red-600 text-white rounded-[2rem] flex items-center justify-center shadow-lg shadow-red-500/30 transition-all transform hover:scale-105 active:scale-95 group">
                        <i className="ph-fill ph-stop text-2xl group-hover:scale-110 transition-transform"></i>
                    </button>
                ) : (
                    <button onClick={startRecording} disabled={loading} className="h-16 w-16 bg-naija-primary hover:bg-green-700 text-white rounded-[2rem] flex items-center justify-center shadow-lg shadow-green-600/30 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group">
                        <i className="ph-fill ph-microphone text-2xl group-hover:scale-110 transition-transform"></i>
                    </button>
                )}
                
                 <button 
                  onClick={sendAudio} 
                  disabled={!mediaBlobUrl || loading} 
                  className={`h-16 w-16 rounded-[2rem] flex items-center justify-center shadow-lg transition-all transform hover:scale-105 active:scale-95 ${mediaBlobUrl ? 'bg-naija-adire text-white cursor-pointer shadow-indigo-500/30' : 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none'}`}
                 >
                    <i className="ph-fill ph-paper-plane-right text-2xl"></i>
                </button>
            </div>
        </div>
      </div>
    )
}
