import { supabase } from './supabaseClient'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token || null
}

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAuthToken()
  
  const headers = new Headers(options.headers)
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  
  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })
}

// Type definitions
export type Language = 'yoruba' | 'hausa' | 'igbo'
export type Proficiency = 'beginner' | 'intermediate' | 'advanced'

export interface UserProfile {
  id: string
  email: string
  target_language: Language | null
  proficiency_level: Proficiency | null
  created_at: string
}

export interface ScenarioRoles {
  user: string
  ai: string
}

export interface ScenarioMission {
  objective: string
  success_condition: string
}

export interface KeyVocabulary {
  word: string
  meaning: string
}

export interface HaggleSettings {
  start_price: number
  target_price: number
  reserve_price: number
}

export interface Scenario {
  id: string
  language: Language
  category?: string
  title: string
  difficulty: string
  description?: string
  roles?: ScenarioRoles
  mission?: ScenarioMission
  key_vocabulary?: KeyVocabulary[]
  system_prompt_context?: string
  haggle_settings?: HaggleSettings
  level: number
}

export interface ConversationStart {
  conversation_id: string
  initial_ai_greeting?: string
  initial_ai_audio_url?: string
}

export interface TurnResponse {
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
  sentiment_score: number | null
  negotiated_price: number | null
  cultural_flag?: boolean
  cultural_feedback?: string | null
}

export interface ConversationHistory {
  conversation_id: string
  scenario_title: string
  scenario_id: string
  created_at: string
  turn_count: number
  last_message: string | null
  active: boolean
}

export interface SavedWord {
  id: number
  word: string
  translation: string
  context_sentence: string | null
  language: Language
  created_at: string
}

// API functions
export async function updateUserProfile(
  target_language: Language,
  proficiency_level: Proficiency
): Promise<UserProfile> {
  const response = await apiRequest('/api/v1/user/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target_language, proficiency_level }),
  })
  
  if (!response.ok) {
    throw new Error('Failed to update profile')
  }
  
  return response.json()
}

export async function getUserProfile(): Promise<UserProfile> {
  const response = await apiRequest('/api/v1/user/profile')
  
  if (!response.ok) {
    throw new Error('Failed to get profile')
  }
  
  return response.json()
}

export async function getScenarios(): Promise<Scenario[]> {
  const response = await apiRequest('/api/v1/scenarios')
  
  if (!response.ok) {
    throw new Error('Failed to get scenarios')
  }
  
  return response.json()
}

export async function startConversation(scenarioId: string): Promise<ConversationStart> {
  const response = await apiRequest('/api/v1/chat/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenario_id: scenarioId }),
  })
  
  if (!response.ok) {
    throw new Error('Failed to start conversation')
  }
  
  return response.json()
}

export async function sendTurn(
  conversationId: string,
  audioBlob: Blob
): Promise<TurnResponse> {
  const formData = new FormData()
  formData.append('file', audioBlob, 'audio.webm')
  
  const response = await apiRequest(`/api/v1/chat/${conversationId}/turn`, {
    method: 'POST',
    body: formData,
  })
  
  if (!response.ok) {
    throw new Error('Failed to send turn')
  }
  
  return response.json()
}

export async function getConversationTurns(conversationId: string): Promise<TurnResponse[]> {
  const response = await apiRequest(`/api/v1/chat/${conversationId}/turns`)
  
  if (!response.ok) {
    throw new Error('Failed to load conversation history')
  }
  
  return response.json()
}

export async function getConversationHistory(): Promise<ConversationHistory[]> {
  const response = await apiRequest('/api/v1/chat/history')
  
  if (!response.ok) {
    throw new Error('Failed to load conversation history')
  }
  
  return response.json()
}

export async function getScenarioById(scenarioId: string): Promise<Scenario | null> {
  const scenarios = await getScenarios()
  return scenarios.find(s => s.id === scenarioId) || null
}

export async function saveWord(
  word: string,
  translation: string,
  contextSentence?: string
): Promise<SavedWord> {
  const response = await apiRequest('/api/v1/vocabulary/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      word,
      translation,
      context_sentence: contextSentence
    })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to save word')
  }
  
  return response.json()
}

export async function getSavedWords(): Promise<SavedWord[]> {
  const response = await apiRequest('/api/v1/vocabulary')
  
  if (!response.ok) {
    throw new Error('Failed to load saved words')
  }
  
  return response.json()
}

export async function deleteSavedWord(wordId: number): Promise<void> {
  const response = await apiRequest(`/api/v1/vocabulary/${wordId}`, {
    method: 'DELETE'
  })
  
  if (!response.ok) {
    throw new Error('Failed to delete word')
  }
}

export async function getUserProgress() {
  const response = await apiRequest('/api/v1/game/progress')
  if (!response.ok) throw new Error('Failed to fetch progress')
  return response.json()
}

export async function finishScenario(scenarioId: string, stars: number) {
  const response = await apiRequest('/api/v1/game/finish_scenario', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenario_id: scenarioId, stars }),
  })
  if (!response.ok) throw new Error('Failed to update progress')
  return response.json()
}

export async function getWisdomDeck() {
  const response = await apiRequest('/api/v1/game/deck')
  if (!response.ok) throw new Error('Failed to fetch deck')
  return response.json()
}
