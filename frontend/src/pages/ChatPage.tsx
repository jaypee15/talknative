import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useReactMediaRecorder } from 'react-media-recorder'
import { sendTurn } from '../lib/api'

interface Turn {
  turn_number: number
  transcription: string
  ai_text: string
  ai_audio_url: string
  correction: string | null
  grammar_score: number | null
  user_audio_url?: string
}

export default function ChatPage() {
  const { id: conversationId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const [turns, setTurns] = useState<Turn[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [playingTurnNumber, setPlayingTurnNumber] = useState<number | null>(null)
  const [showTranslation, setShowTranslation] = useState<{[key: number]: boolean}>({})
  const [showCorrection, setShowCorrection] = useState<{[key: number]: boolean}>({})
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)

  const { status, startRecording, stopRecording, mediaBlobUrl, clearBlobUrl } = useReactMediaRecorder({ 
    audio: true 
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [turns])

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

  const sendAudio = async () => {
    if (!mediaBlobUrl || !conversationId) return

    setLoading(true)
    setError(null)

    try {
      const blob = await fetch(mediaBlobUrl).then((r) => r.blob())
      const response = await sendTurn(conversationId, blob)
      
      setTurns([...turns, response])
      
      // Auto-play AI response
      if (response.ai_audio_url) {
        playAudio(response.ai_audio_url, response.turn_number)
      }
      
      clearBlobUrl()
    } catch (err: any) {
      setError(err.message || 'Failed to send audio')
    } finally {
      setLoading(false)
    }
  }

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

  return (
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
          <h1 className="text-lg font-semibold text-gray-900">Conversation</h1>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {turns.map((turn) => (
            <div key={turn.turn_number} className="space-y-4">
              {/* User message */}
              <div className="flex justify-end">
                <div className="max-w-[70%]">
                  <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3">
                    <p className="text-sm">{turn.transcription}</p>
                  </div>
                  {turn.correction && turn.grammar_score && turn.grammar_score < 8 && (
                    <div className="mt-2">
                      <button
                        onClick={() => toggleCorrection(turn.turn_number)}
                        className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center"
                      >
                        ✨ Grammar feedback
                      </button>
                      {showCorrection[turn.turn_number] && (
                        <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm text-amber-900">
                          {turn.correction}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* AI message */}
              <div className="flex justify-start">
                <div className="max-w-[70%]">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      {audioPlaying && playingTurnNumber === turn.turn_number && (
                        <span className="text-xs text-blue-600 animate-pulse">🔊 Playing...</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-900">{turn.ai_text}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => playAudio(turn.ai_audio_url, turn.turn_number)}
                        disabled={audioPlaying && playingTurnNumber === turn.turn_number}
                        className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        {audioPlaying && playingTurnNumber === turn.turn_number ? '⏸ Playing...' : '🔊 Replay'}
                      </button>
                      <button
                        onClick={() => toggleTranslation(turn.turn_number)}
                        className="text-xs bg-gray-50 text-gray-600 px-3 py-1 rounded-full hover:bg-gray-100 font-medium"
                      >
                        {showTranslation[turn.turn_number] ? 'Hide translation' : '🌐 Show translation'}
                      </button>
                    </div>
                    {showTranslation[turn.turn_number] && (
                      <div className="mt-2 text-xs text-gray-500 italic border-t border-gray-100 pt-2">
                        Translation feature coming soon!
                      </div>
                    )}
                  </div>
                  {turn.grammar_score === 10 && (
                    <div className="mt-1 text-xs text-green-600 flex items-center gap-1">
                      ✓ Perfect grammar!
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-800 text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3">
            {/* Recording status */}
            <div className="flex-1 bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Status: <span className={status === 'recording' ? 'text-red-600' : 'text-gray-600'}>{status}</span>
                </span>
                {status === 'recording' && (
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
              </div>
            </div>

            {/* Control buttons */}
            <button
              onClick={startRecording}
              disabled={status === 'recording' || loading}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              🎤 Record
            </button>
            
            <button
              onClick={stopRecording}
              disabled={status !== 'recording'}
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              ⏹ Stop
            </button>
            
            <button
              onClick={sendAudio}
              disabled={!mediaBlobUrl || loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {loading ? '⏳ Sending...' : '📤 Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
